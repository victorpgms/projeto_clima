const {
    buscarLocalizacao,
    buscarClimaAtual,
    buscarJson,
    obterClima,
    formatarNomeCidade,
    formatarTemperatura,
    formatarMedida,
    formatarDataHora,
    formatarDataCurta,
    obterPrevisaoDiaria,
    normalizarUrlSegura,
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

function criarClimaCompleto(sobrescritas = {}) {
    return {
        current: {
            time: "2026-08-12T11:00",
            temperature_2m: 25.4,
            weather_code: 1,
            is_day: 1,
            relative_humidity_2m: 68,
            wind_speed_10m: 12.7,
            precipitation: 0.4,
            ...sobrescritas.current,
        },
        current_units: {
            temperature_2m: "°C",
            relative_humidity_2m: "%",
            wind_speed_10m: "km/h",
            precipitation: "mm",
            ...sobrescritas.current_units,
        },
        daily: {
            time: [
                "2026-08-12",
                "2026-08-13",
                "2026-08-14",
                "2026-08-15",
                "2026-08-16",
            ],
            temperature_2m_max: [26, 27.4, 24.8, 25.1, 28],
            temperature_2m_min: [16.2, 17, 15.6, 18.2, 19],
            ...sobrescritas.daily,
        },
        daily_units: {
            temperature_2m_max: "°C",
            temperature_2m_min: "°C",
            ...sobrescritas.daily_units,
        },
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
            if (ativo === undefined) {
                if (classes.has(classe)) {
                    classes.delete(classe);
                } else {
                    classes.add(classe);
                }
            } else if (ativo) {
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

function obterTextoElemento(elemento) {
    if (!elemento) {
        return "";
    }

    if (elemento._textContent) {
        return elemento._textContent;
    }

    return elemento.children?.map(obterTextoElemento).join("") ?? "";
}

function criarElemento(id) {
    return {
        id,
        value: "",
        _textContent: "",
        get textContent() {
            return obterTextoElemento(this);
        },
        set textContent(valor) {
            this._textContent = valor;
        },
        className: "",
        innerHTML: "",
        children: [],
        disabled: false,
        classList: criarClassList(),
        atributos: {},
        append(...filhos) {
            this.children.push(...filhos);
            this.innerHTML = this.children.map(obterTextoElemento).join("");
        },
        replaceChildren(...filhos) {
            this.children = filhos;
            this.innerHTML = this.children.map(obterTextoElemento).join("");
        },
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
        umidadeAtual: criarElemento("umidade-atual"),
        ventoAtual: criarElemento("vento-atual"),
        precipitacaoAtual: criarElemento("precipitacao-atual"),
        previsaoLista: criarElemento("previsao-lista"),
        botaoBuscar: criarElemento("buscar"),
        botaoTema: criarElemento("botao-tema"),
        body: criarElemento("body"),
    };

    elementos.body.classList = criarClassList(["periodo-dia"]);
    elementos.form.addEventListener = (evento, callback) => {
        eventos[`form:${evento}`] = callback;
    };
    elementos.form.querySelector = () => elementos.botaoBuscar;
    elementos.botaoTema.addEventListener = (evento, callback) => {
        eventos[`tema:${evento}`] = callback;
    };

    global.fetch = fetchMock;
    global.document = {
        body: elementos.body,
        createElement(tagName) {
            return criarElemento(tagName);
        },
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
                "#botao-tema": elementos.botaoTema,
                "#umidade-atual": elementos.umidadeAtual,
                "#vento-atual": elementos.ventoAtual,
                "#precipitacao-atual": elementos.precipitacaoAtual,
                "#previsao-lista": elementos.previsaoLista,
            };

            return seletores[seletor];
        },
    };

    require("../assets/js/api.js");

    return {
        elementos,
        submit: () => eventos["form:submit"]({ preventDefault: jest.fn() }),
        clickTema: () => eventos["tema:click"](),
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
        global.fetch.mockResolvedValueOnce(criarRespostaJson(criarClimaCompleto()));

        const clima = await buscarClimaAtual("-23.55", "-46.63");
        const url = global.fetch.mock.calls[0][0];

        expect(clima.current.temperature_2m).toBe(25.4);
        expect(clima.current.weather_code).toBe(1);
        expect(clima.current.relative_humidity_2m).toBe(68);
        expect(clima.current.wind_speed_10m).toBe(12.7);
        expect(clima.daily.temperature_2m_max).toHaveLength(5);
        expect(url.searchParams.get("latitude")).toBe("-23.55");
        expect(url.searchParams.get("longitude")).toBe("-46.63");
        expect(url.searchParams.get("current")).toBe(
            "temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m,precipitation",
        );
        expect(url.searchParams.get("daily")).toBe(
            "temperature_2m_max,temperature_2m_min",
        );
        expect(url.searchParams.get("forecast_days")).toBe("5");
        expect(url.searchParams.get("temperature_unit")).toBe("celsius");
        expect(url.searchParams.get("wind_speed_unit")).toBe("kmh");
        expect(url.searchParams.get("precipitation_unit")).toBe("mm");
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

    test("bloqueia requisições fora de HTTPS", async () => {
        expect(() => normalizarUrlSegura("http://api.example.test")).toThrow(
            EntradaInvalidaError,
        );
        await expect(
            buscarJson("http://api.example.test", "API indisponível."),
        ).rejects.toThrow("A aplicação permite apenas requisições HTTPS.");
        expect(global.fetch).not.toHaveBeenCalled();
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

    test("trata previsão diária incompleta", async () => {
        global.fetch.mockResolvedValueOnce(
            criarRespostaJson(
                criarClimaCompleto({
                    daily: {
                        time: ["2026-08-12"],
                        temperature_2m_max: [26],
                        temperature_2m_min: [16],
                    },
                }),
            ),
        );

        await expect(buscarClimaAtual(-23.55, -46.63)).rejects.toThrow(
            "A API retornou dados de previsão incompletos.",
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
        expect(formatarMedida(68, "%")).toBe("68%");
        expect(formatarMedida(12.7, "km/h")).toBe("12,7 km/h");
        expect(formatarDataHora("2025-10-13T14:30")).toContain(
            "segunda-feira, 13 de outubro de 2025",
        );
        expect(formatarDataCurta("2025-10-13")).toContain("13/10");
        expect(formatarDataHora(null)).toBe("data e hora não informadas");
    });

    test("limita a previsão diária aos próximos 5 dias", () => {
        const previsao = obterPrevisaoDiaria(
            criarClimaCompleto({
                daily: {
                    time: [
                        "2026-08-12",
                        "2026-08-13",
                        "2026-08-14",
                        "2026-08-15",
                        "2026-08-16",
                        "2026-08-17",
                    ],
                    temperature_2m_max: [26, 27, 28, 29, 30, 31],
                    temperature_2m_min: [16, 17, 18, 19, 20, 21],
                },
            }).daily,
        );

        expect(previsao).toHaveLength(5);
        expect(previsao[0]).toEqual({
            data: "2026-08-12",
            maxima: 26,
            minima: 16,
        });
        expect(previsao[4]).toEqual({
            data: "2026-08-16",
            maxima: 30,
            minima: 20,
        });
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
                criarRespostaJson(
                    criarClimaCompleto({
                        current: {
                            temperature_2m: 26.2,
                            weather_code: 2,
                            is_day: 0,
                            time: "2025-10-13T21:15",
                            relative_humidity_2m: 74,
                            wind_speed_10m: 18.6,
                            precipitation: 1.2,
                        },
                        daily: {
                            time: [
                                "2025-10-13",
                                "2025-10-14",
                                "2025-10-15",
                                "2025-10-16",
                                "2025-10-17",
                            ],
                            temperature_2m_max: [30, 29.5, 28, 31, 27.4],
                            temperature_2m_min: [22, 21.5, 20, 23, 19.2],
                        },
                    }),
                ),
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
        expect(elementos.umidadeAtual.textContent).toBe("74%");
        expect(elementos.ventoAtual.textContent).toBe("18,6 km/h");
        expect(elementos.precipitacaoAtual.textContent).toBe("1,2 mm");
        expect(elementos.previsaoLista.innerHTML).toContain("Máx: 30 °C");
        expect(elementos.previsaoLista.innerHTML).toContain("Mín: 19,2 °C");
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

    test("alterna o tema escuro pelo botão da interface", () => {
        const fetchMock = jest.fn();
        const { elementos, clickTema } = carregarModuloComDOM(fetchMock);

        expect(elementos.botaoTema.textContent).toBe("Tema escuro");
        expect(elementos.botaoTema.atributos["aria-pressed"]).toBe("false");

        clickTema();

        expect(elementos.body.classList.contains("tema-escuro")).toBe(true);
        expect(elementos.botaoTema.textContent).toBe("Tema claro");
        expect(elementos.botaoTema.atributos["aria-pressed"]).toBe("true");

        clickTema();

        expect(elementos.body.classList.contains("tema-escuro")).toBe(false);
        expect(elementos.botaoTema.textContent).toBe("Tema escuro");
        expect(elementos.botaoTema.atributos["aria-pressed"]).toBe("false");
    });
});
