const {
    buscarLocalizacao,
    buscarClimaAtual,
    buscarJson,
    obterClima,
    formatarNomeCidade,
    formatarTemperatura,
    formatarDataHora,
    CidadeNaoEncontradaError,
    FalhaApiError,
    ErroRede,
    EntradaInvalidaError,
} = require("../assets/js/api.js");

function criarRespostaJson(dados, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        json: jest.fn().mockResolvedValue(dados),
    };
}

function criarRespostaJsonInvalido() {
    return {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError("JSON inválido")),
    };
}

function criarClassList(classesIniciais = []) {
    const classes = new Set(classesIniciais);

    return {
        add(classe) {
            classes.add(classe);
        },
        remove(classe) {
            classes.delete(classe);
        },
        toggle(classe, ativo) {
            if (ativo) {
                classes.add(classe);
            } else {
                classes.delete(classe);
            }
        },
        contains(classe) {
            return classes.has(classe);
        },
    };
}

function criarElemento(id) {
    return {
        id,
        value: "",
        textContent: "",
        className: "",
        disabled: false,
        classList: criarClassList(),
        atributos: {},
        setAttribute(nome, valor) {
            this.atributos[nome] = valor;
        },
    };
}

function carregarModuloComDOM(fetchMock) {
    jest.resetModules();

    const eventos = {};
    const elementos = {
        form: criarElemento("form-clima"),
        inputCidade: criarElemento("cidade"),
        mensagem: criarElemento("mensagem"),
        resultado: criarElemento("resultado"),
        nomeCidade: criarElemento("nome-cidade"),
        temperatura: criarElemento("temperatura"),
        descricaoClima: criarElemento("descricao-clima"),
        iconeClima: criarElemento("icone-clima"),
        dataConsulta: criarElemento("data-consulta"),
        botaoBuscar: criarElemento("buscar"),
        body: criarElemento("body"),
    };

    elementos.body.classList = criarClassList(["periodo-dia"]);
    elementos.form.addEventListener = (evento, callback) => {
        eventos[evento] = callback;
    };
    elementos.form.querySelector = () => elementos.botaoBuscar;

    global.fetch = fetchMock;
    global.document = {
        body: elementos.body,
        querySelector(seletor) {
            const seletores = {
                "#form-clima": elementos.form,
                "#cidade": elementos.inputCidade,
                "#mensagem": elementos.mensagem,
                "#resultado": elementos.resultado,
                "#nome-cidade": elementos.nomeCidade,
                "#temperatura": elementos.temperatura,
                "#descricao-clima": elementos.descricaoClima,
                "#icone-clima": elementos.iconeClima,
                "#data-consulta": elementos.dataConsulta,
            };

            return seletores[seletor];
        },
    };

    require("../assets/js/api.js");

    return {
        elementos,
        submit: () => eventos.submit({ preventDefault: jest.fn() }),
    };
}

describe("API de previsão do tempo", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        delete global.document;
    });

    test("busca localização da cidade e envia o nome tratado para a API", async () => {
        global.fetch.mockResolvedValueOnce(
            criarRespostaJson({
                results: [
                    {
                        name: "São Paulo",
                        admin1: "São Paulo",
                        country: "Brasil",
                        latitude: -23.55,
                        longitude: -46.63,
                    },
                ],
            }),
        );

        const local = await buscarLocalizacao("  São Paulo  ");
        const url = global.fetch.mock.calls[0][0];

        expect(local).toMatchObject({
            name: "São Paulo",
            latitude: -23.55,
            longitude: -46.63,
        });
        expect(url.searchParams.get("name")).toBe("São Paulo");
        expect(url.searchParams.get("count")).toBe("1");
        expect(url.searchParams.get("language")).toBe("pt");
    });

    test("lança erro quando a cidade não é encontrada", async () => {
        global.fetch.mockResolvedValueOnce(criarRespostaJson({ results: [] }));

        await expect(buscarLocalizacao("Cidade Inexistente")).rejects.toThrow(
            CidadeNaoEncontradaError,
        );
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test.each(["   ", "", null, undefined])(
        "valida entrada de cidade antes de consultar a API: %p",
        async (cidade) => {
            await expect(buscarLocalizacao(cidade)).rejects.toThrow(
                EntradaInvalidaError,
            );
            expect(global.fetch).not.toHaveBeenCalled();
        },
    );

    test("busca clima atual com coordenadas válidas", async () => {
        global.fetch.mockResolvedValueOnce(
            criarRespostaJson({
                current: {
                    temperature_2m: 25.4,
                    weather_code: 1,
                    is_day: 1,
                    time: "2026-08-12T11:00",
                },
                current_units: {
                    temperature_2m: "°C",
                },
            }),
        );

        const clima = await buscarClimaAtual("-23.55", "-46.63");
        const url = global.fetch.mock.calls[0][0];

        expect(clima.current.temperature_2m).toBe(25.4);
        expect(clima.current.weather_code).toBe(1);
        expect(url.searchParams.get("latitude")).toBe("-23.55");
        expect(url.searchParams.get("longitude")).toBe("-46.63");
        expect(url.searchParams.get("current")).toBe(
            "temperature_2m,weather_code,is_day",
        );
        expect(url.searchParams.get("temperature_unit")).toBe("celsius");
    });

    test.each([
        ["abc", -46.63],
        [-23.55, Number.NaN],
        [undefined, -46.63],
    ])(
        "valida coordenadas antes de consultar a API: %p, %p",
        async (latitude, longitude) => {
            await expect(buscarClimaAtual(latitude, longitude)).rejects.toThrow(
                EntradaInvalidaError,
            );
            expect(global.fetch).not.toHaveBeenCalled();
        },
    );

    test("trata erro HTTP da API com mensagem contextual", async () => {
        global.fetch.mockResolvedValueOnce(
            criarRespostaJson({}, { ok: false, status: 500 }),
        );

        await expect(
            buscarJson(new URL("https://api.example.test"), "API indisponível."),
        ).rejects.toThrow("API indisponível.");
    });

    test("trata limite de requisições da API", async () => {
        global.fetch.mockResolvedValueOnce(
            criarRespostaJson({}, { ok: false, status: 429 }),
        );

        await expect(buscarClimaAtual(-23.55, -46.63)).rejects.toThrow(
            "Limite de requisições da API excedido",
        );
    });

    test("trata falha de rede preservando a causa original", async () => {
        const erroOriginal = new Error("Falha de conexão");

        global.fetch.mockRejectedValueOnce(erroOriginal);

        await expect(buscarLocalizacao("São Paulo")).rejects.toMatchObject({
            name: "ErroRede",
            cause: erroOriginal,
        });
    });

    test("trata JSON inválido retornado pela API", async () => {
        global.fetch.mockResolvedValueOnce(criarRespostaJsonInvalido());

        await expect(
            buscarJson(new URL("https://api.example.test"), "API indisponível."),
        ).rejects.toThrow("A API retornou uma resposta inválida.");
    });

    test("trata dados climáticos incompletos", async () => {
        global.fetch.mockResolvedValueOnce(
            criarRespostaJson({
                current: {
                    weather_code: 1,
                    is_day: 1,
                },
            }),
        );

        await expect(buscarClimaAtual(-23.55, -46.63)).rejects.toThrow(
            FalhaApiError,
        );
    });

    test("mapeia descrição e ícone do clima para dia, noite e código desconhecido", () => {
        expect(obterClima(0, true)).toEqual({
            descricao: "Céu limpo",
            icone: "wi-day-sunny",
        });
        expect(obterClima(0, false)).toEqual({
            descricao: "Céu limpo",
            icone: "wi-night-clear",
        });
        expect(obterClima(999, true)).toEqual({
            descricao: "Condição climática não informada",
            icone: "wi-na",
        });
    });

    test("formata cidade, temperatura e data da consulta", () => {
        expect(
            formatarNomeCidade({
                name: "Recife",
                admin1: "Pernambuco",
                country: "Brasil",
            }),
        ).toBe("Recife - Pernambuco, Brasil");
        expect(formatarTemperatura(18.35)).toBe("18,4");
        expect(formatarDataHora("2025-10-13T14:30")).toContain(
            "segunda-feira, 13 de outubro de 2025",
        );
        expect(formatarDataHora(null)).toBe("data e hora não informadas");
    });

    test("renderiza resultado na tela após envio válido do formulário", async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValueOnce(
                criarRespostaJson({
                    results: [
                        {
                            name: "Recife",
                            admin1: "Pernambuco",
                            country: "Brasil",
                            latitude: -8.05,
                            longitude: -34.9,
                        },
                    ],
                }),
            )
            .mockResolvedValueOnce(
                criarRespostaJson({
                    current: {
                        temperature_2m: 26.2,
                        weather_code: 2,
                        is_day: 0,
                        time: "2025-10-13T21:15",
                    },
                    current_units: {
                        temperature_2m: "°C",
                    },
                }),
            );

        const { elementos, submit } = carregarModuloComDOM(fetchMock);

        elementos.inputCidade.value = "Recife";

        await submit();

        expect(elementos.nomeCidade.textContent).toBe(
            "Recife - Pernambuco, Brasil",
        );
        expect(elementos.temperatura.textContent).toBe("26,2°C");
        expect(elementos.descricaoClima.textContent).toBe(
            "Parcialmente nublado",
        );
        expect(elementos.iconeClima.className).toBe("wi wi-night-alt-cloudy");
        expect(elementos.resultado.classList.contains("ativo")).toBe(true);
        expect(elementos.body.classList.contains("periodo-noite")).toBe(true);
        expect(elementos.body.classList.contains("periodo-dia")).toBe(false);
        expect(elementos.botaoBuscar.disabled).toBe(false);
    });

    test("exibe erro na tela sem consultar API quando cidade está vazia", async () => {
        const fetchMock = jest.fn();
        const { elementos, submit } = carregarModuloComDOM(fetchMock);

        elementos.inputCidade.value = "   ";

        await submit();

        expect(elementos.mensagem.textContent).toBe(
            "Digite o nome de uma cidade.",
        );
        expect(elementos.mensagem.className).toBe("erro");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test("exibe erro na tela quando a API não encontra a cidade", async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValueOnce(criarRespostaJson({ results: [] }));
        const { elementos, submit } = carregarModuloComDOM(fetchMock);

        elementos.inputCidade.value = "Cidade Inexistente";

        await submit();

        expect(elementos.mensagem.textContent).toBe(
            "Cidade não encontrada. Confira o nome e tente novamente.",
        );
        expect(elementos.mensagem.className).toBe("erro");
        expect(elementos.resultado.classList.contains("ativo")).toBe(false);
    });

    test("exibe erro de rede na tela quando fetch falha", async () => {
        const fetchMock = jest.fn().mockRejectedValueOnce(new Error("offline"));
        const { elementos, submit } = carregarModuloComDOM(fetchMock);

        elementos.inputCidade.value = "São Paulo";

        await submit();

        expect(elementos.mensagem.textContent).toBe(
            "Erro de rede. Verifique sua conexão e tente novamente.",
        );
        expect(elementos.mensagem.className).toBe("erro");
        expect(elementos.resultado.classList.contains("ativo")).toBe(false);
    });
});
