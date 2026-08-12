/**
 * @fileoverview Integra a interface de previsão do tempo com as APIs da
 * Open-Meteo para buscar coordenadas, clima atual, umidade, vento,
 * precipitação, previsão de 5 dias, ícone representativo e data/hora
 * da consulta.
 *
 * @example
 * buscarLocalizacao("São Paulo")
 *     .then((local) => buscarClimaAtual(local.latitude, local.longitude))
 *     .then((dadosClima) => console.log(dadosClima.current.temperature_2m))
 *     .catch((erro) => console.error(erro.message));
 */

const temDOM = typeof document !== "undefined";

const formClima = temDOM ? document.querySelector("#form-clima") : null;
const inputCidade = temDOM ? document.querySelector("#cidade") : null;
const mensagem = temDOM ? document.querySelector("#mensagem") : null;

const botaoBuscar = formClima?.querySelector("button[type='submit']") ?? null;

const resultado = temDOM ? document.querySelector("#resultado") : null;
const nomeCidade = temDOM ? document.querySelector("#nome-cidade") : null;
const temperatura = temDOM ? document.querySelector("#temperatura") : null;
const descricaoClima = temDOM
    ? document.querySelector("#descricao-clima")
    : null;

const iconeClima = temDOM ? document.querySelector("#icone-clima") : null;
const dataConsulta = temDOM ? document.querySelector("#data-consulta") : null;
const botaoTema = temDOM ? document.querySelector("#botao-tema") : null;
const umidadeAtual = temDOM ? document.querySelector("#umidade-atual") : null;
const ventoAtual = temDOM ? document.querySelector("#vento-atual") : null;
const precipitacaoAtual = temDOM
    ? document.querySelector("#precipitacao-atual")
    : null;
const previsaoLista = temDOM ? document.querySelector("#previsao-lista") : null;

const CLASSE_TEMA_ESCURO = "tema-escuro";

const FORMATADOR_DATA = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

const FORMATADOR_HORA = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

const FORMATADOR_DIA_CURTO = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
});

const CLIMA_POR_CODIGO = {
    0: {
        descricao: "Céu limpo",
        dia: "wi-day-sunny",
        noite: "wi-night-clear",
    },
    1: {
        descricao: "Principalmente limpo",
        dia: "wi-day-sunny-overcast",
        noite: "wi-night-alt-partly-cloudy",
    },
    2: {
        descricao: "Parcialmente nublado",
        dia: "wi-day-cloudy",
        noite: "wi-night-alt-cloudy",
    },
    3: {
        descricao: "Nublado",
        dia: "wi-cloudy",
        noite: "wi-night-cloudy",
    },
    45: {
        descricao: "Nevoeiro",
        dia: "wi-day-fog",
        noite: "wi-night-fog",
    },
    48: {
        descricao: "Nevoeiro com geada",
        dia: "wi-day-fog",
        noite: "wi-night-fog",
    },
    51: {
        descricao: "Garoa fraca",
        dia: "wi-day-sprinkle",
        noite: "wi-night-alt-sprinkle",
    },
    53: {
        descricao: "Garoa moderada",
        dia: "wi-day-sprinkle",
        noite: "wi-night-alt-sprinkle",
    },
    55: {
        descricao: "Garoa intensa",
        dia: "wi-day-showers",
        noite: "wi-night-alt-showers",
    },
    56: {
        descricao: "Garoa congelante fraca",
        dia: "wi-day-rain-mix",
        noite: "wi-night-alt-rain-mix",
    },
    57: {
        descricao: "Garoa congelante intensa",
        dia: "wi-day-rain-mix",
        noite: "wi-night-alt-rain-mix",
    },
    61: {
        descricao: "Chuva fraca",
        dia: "wi-day-rain",
        noite: "wi-night-alt-rain",
    },
    63: {
        descricao: "Chuva moderada",
        dia: "wi-day-rain",
        noite: "wi-night-alt-rain",
    },
    65: {
        descricao: "Chuva intensa",
        dia: "wi-day-rain-wind",
        noite: "wi-night-alt-rain-wind",
    },
    66: {
        descricao: "Chuva congelante fraca",
        dia: "wi-day-rain-mix",
        noite: "wi-night-alt-rain-mix",
    },
    67: {
        descricao: "Chuva congelante intensa",
        dia: "wi-day-rain-mix",
        noite: "wi-night-alt-rain-mix",
    },
    71: {
        descricao: "Neve fraca",
        dia: "wi-day-snow",
        noite: "wi-night-alt-snow",
    },
    73: {
        descricao: "Neve moderada",
        dia: "wi-day-snow",
        noite: "wi-night-alt-snow",
    },
    75: {
        descricao: "Neve intensa",
        dia: "wi-day-snow-wind",
        noite: "wi-night-alt-snow-wind",
    },
    77: {
        descricao: "Grãos de neve",
        dia: "wi-snowflake-cold",
        noite: "wi-snowflake-cold",
    },
    80: {
        descricao: "Pancadas de chuva fracas",
        dia: "wi-day-showers",
        noite: "wi-night-alt-showers",
    },
    81: {
        descricao: "Pancadas de chuva moderadas",
        dia: "wi-day-showers",
        noite: "wi-night-alt-showers",
    },
    82: {
        descricao: "Pancadas de chuva intensas",
        dia: "wi-day-storm-showers",
        noite: "wi-night-alt-storm-showers",
    },
    85: {
        descricao: "Pancadas de neve fracas",
        dia: "wi-day-snow",
        noite: "wi-night-alt-snow",
    },
    86: {
        descricao: "Pancadas de neve intensas",
        dia: "wi-day-snow-wind",
        noite: "wi-night-alt-snow-wind",
    },
    95: {
        descricao: "Tempestade",
        dia: "wi-day-thunderstorm",
        noite: "wi-night-alt-thunderstorm",
    },
    96: {
        descricao: "Tempestade com granizo leve",
        dia: "wi-day-hail",
        noite: "wi-night-alt-hail",
    },
    99: {
        descricao: "Tempestade com granizo forte",
        dia: "wi-day-hail",
        noite: "wi-night-alt-hail",
    },
};

class CidadeNaoEncontradaError extends Error {
    constructor(message = "Cidade não encontrada.") {
        super(message);
        this.name = "CidadeNaoEncontradaError";
    }
}

class FalhaApiError extends Error {
    constructor(message = "A API falhou. Tente novamente em alguns instantes.") {
        super(message);
        this.name = "FalhaApiError";
    }
}

class ErroRede extends Error {
    constructor(
        message = "Erro de rede. Verifique sua conexão e tente novamente.",
        options = {},
    ) {
        super(message);
        this.name = "ErroRede";
        this.cause = options.cause;
    }
}

class EntradaInvalidaError extends Error {
    constructor(message = "Entrada inválida.") {
        super(message);
        this.name = "EntradaInvalidaError";
    }
}

if (formClima) {
    formClima.addEventListener("submit", async function (event) {
        event.preventDefault();

        const cidade = inputCidade?.value.trim() ?? "";

        if (!cidade) {
            mostrarMensagem("Digite o nome de uma cidade.", "erro");
            esconderResultado();
            return;
        }

        iniciarBusca();

        try {
            const local = await buscarLocalizacao(cidade);

            const dadosClima = await buscarClimaAtual(
                local.latitude,
                local.longitude,
            );

            exibirResultado(local, dadosClima);
        } catch (erro) {
            tratarErro(erro);
        } finally {
            finalizarBusca();
        }
    });
}

if (botaoTema) {
    botaoTema.addEventListener("click", alternarTemaEscuro);
    atualizarBotaoTema();
}

/**
 * Busca latitude, longitude e metadados de uma cidade pela API de
 * Geocodificação da Open-Meteo.
 *
 * @param {string} cidade - Nome da cidade informada pelo usuário.
 * @returns {Promise<Object>} Primeiro resultado encontrado pela API, contendo
 * propriedades como `name`, `admin1`, `country`, `latitude` e `longitude`.
 * @throws {EntradaInvalidaError} Quando `cidade` não é uma string preenchida.
 * @throws {CidadeNaoEncontradaError} Quando a API não encontra resultados.
 * @throws {FalhaApiError} Quando a API responde com erro ou JSON inválido.
 * @throws {ErroRede} Quando a requisição não chega à API por falha de rede.
 *
 * @example
 * const local = await buscarLocalizacao("São Paulo");
 * console.log(local.latitude, local.longitude);
 */
async function buscarLocalizacao(cidade) {
    const cidadeTratada = typeof cidade === "string" ? cidade.trim() : "";

    if (!cidadeTratada) {
        throw new EntradaInvalidaError("Digite o nome de uma cidade.");
    }

    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");

    url.search = new URLSearchParams({
        name: cidadeTratada,
        count: "1",
        language: "pt",
        format: "json",
    });

    const dados = await buscarJson(
        url,
        "A API de geocodificação falhou. Tente novamente em alguns instantes.",
    );

    if (!Array.isArray(dados.results) || dados.results.length === 0) {
        throw new CidadeNaoEncontradaError();
    }

    return dados.results[0];
}

/**
 * Busca os dados climáticos atuais para uma latitude e longitude.
 *
 * @param {number|string} latitude - Latitude do local consultado.
 * @param {number|string} longitude - Longitude do local consultado.
 * @returns {Promise<Object>} Resposta da API Forecast da Open-Meteo com
 * clima atual, umidade, vento, precipitação, previsão diária de 5 dias e
 * unidades de medida.
 * @throws {EntradaInvalidaError} Quando latitude ou longitude não são números.
 * @throws {FalhaApiError} Quando a API falha, retorna JSON inválido ou dados
 * climáticos incompletos.
 * @throws {ErroRede} Quando ocorre falha de rede.
 *
 * @example
 * const clima = await buscarClimaAtual(-23.55, -46.63);
 * console.log(`${clima.current.temperature_2m}°C`);
 */
async function buscarClimaAtual(latitude, longitude) {
    const latitudeNumerica = Number(latitude);
    const longitudeNumerica = Number(longitude);

    if (!Number.isFinite(latitudeNumerica) || !Number.isFinite(longitudeNumerica)) {
        throw new EntradaInvalidaError(
            "Latitude e longitude devem ser números válidos.",
        );
    }

    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.search = new URLSearchParams({
        latitude: String(latitudeNumerica),
        longitude: String(longitudeNumerica),
        current:
            "temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m,precipitation",
        daily: "temperature_2m_max,temperature_2m_min",
        forecast_days: "5",
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
        timezone: "auto",
    });

    const dados = await buscarJson(
        url,
        "A API de clima falhou. Tente novamente em alguns instantes.",
    );

    if (!dados.current || !dados.daily) {
        throw new FalhaApiError("A API retornou dados climáticos incompletos.");
    }

    validarClimaAtual(dados.current);
    validarPrevisaoDiaria(dados.daily);

    return dados;
}

function validarClimaAtual(climaAtual) {
    const camposNumericos = [
        "temperature_2m",
        "weather_code",
        "is_day",
        "relative_humidity_2m",
        "wind_speed_10m",
        "precipitation",
    ];

    const temCampoInvalido = camposNumericos.some(
        (campo) => typeof climaAtual[campo] !== "number",
    );

    if (temCampoInvalido) {
        throw new FalhaApiError("A API retornou dados climáticos incompletos.");
    }
}

function validarPrevisaoDiaria(previsaoDiaria) {
    const temDadosDiarios =
        Array.isArray(previsaoDiaria.time) &&
        Array.isArray(previsaoDiaria.temperature_2m_max) &&
        Array.isArray(previsaoDiaria.temperature_2m_min);

    const temCincoDias =
        temDadosDiarios &&
        previsaoDiaria.time.length >= 5 &&
        previsaoDiaria.temperature_2m_max.length >= 5 &&
        previsaoDiaria.temperature_2m_min.length >= 5;

    const temperaturasSaoNumericas =
        temCincoDias &&
        previsaoDiaria.temperature_2m_max
            .slice(0, 5)
            .every((temperatura) => typeof temperatura === "number") &&
        previsaoDiaria.temperature_2m_min
            .slice(0, 5)
            .every((temperatura) => typeof temperatura === "number");

    if (!temperaturasSaoNumericas) {
        throw new FalhaApiError("A API retornou dados de previsão incompletos.");
    }
}

/**
 * Executa uma requisição `fetch` e converte a resposta para JSON.
 *
 * @param {URL|string} url - URL do endpoint que será consultado.
 * @param {string} mensagemErroApi - Mensagem usada quando a API responde com
 * status HTTP de erro.
 * @returns {Promise<Object>} Corpo JSON retornado pela API.
 * @throws {ErroRede} Quando `fetch` rejeita por erro de conexão.
 * @throws {FalhaApiError} Quando a API responde com erro HTTP, limite de
 * requisições ou JSON inválido.
 *
 * @example
 * const dados = await buscarJson(new URL("https://api.example.com"), "API indisponível.");
 */
async function buscarJson(url, mensagemErroApi) {
    let resposta;

    try {
        resposta = await fetch(url);
    } catch (erro) {
        throw new ErroRede(undefined, { cause: erro });
    }

    if (resposta.status === 429) {
        throw new FalhaApiError(
            "Limite de requisições da API excedido. Tente novamente mais tarde.",
        );
    }

    if (!resposta.ok) {
        throw new FalhaApiError(mensagemErroApi);
    }

    try {
        return await resposta.json();
    } catch {
        throw new FalhaApiError("A API retornou uma resposta inválida.");
    }
}

function exibirResultado(local, dadosClima) {
    const climaAtual = dadosClima.current;
    const ehDia = climaAtual.is_day === 1;
    const clima = obterClima(climaAtual.weather_code, ehDia);
    const unidadesAtuais = dadosClima.current_units ?? {};
    const unidadeTemperatura = unidadesAtuais.temperature_2m ?? "°C";

    nomeCidade.textContent = formatarNomeCidade(local);
    temperatura.textContent = `${formatarTemperatura(
        climaAtual.temperature_2m,
    )}${unidadeTemperatura}`;
    descricaoClima.textContent = clima.descricao;
    dataConsulta.textContent = `Consulta: ${formatarDataHora(climaAtual.time)}`;
    umidadeAtual.textContent = formatarMedida(
        climaAtual.relative_humidity_2m,
        unidadesAtuais.relative_humidity_2m ?? "%",
    );
    ventoAtual.textContent = formatarMedida(
        climaAtual.wind_speed_10m,
        unidadesAtuais.wind_speed_10m ?? "km/h",
    );
    precipitacaoAtual.textContent = formatarMedida(
        climaAtual.precipitation,
        unidadesAtuais.precipitation ?? "mm",
    );

    iconeClima.className = `wi ${clima.icone}`;
    iconeClima.setAttribute("title", clima.descricao);

    document.body.classList.toggle("periodo-dia", ehDia);
    document.body.classList.toggle("periodo-noite", !ehDia);

    mostrarMensagem("", "");
    renderizarPrevisao(dadosClima.daily, dadosClima.daily_units);
    resultado.classList.add("ativo");
}

function obterClima(codigo, ehDia) {
    const clima = CLIMA_POR_CODIGO[codigo] ?? {
        descricao: "Condição climática não informada",
        dia: "wi-na",
        noite: "wi-na",
    };

    return {
        descricao: clima.descricao,
        icone: ehDia ? clima.dia : clima.noite,
    };
}

function formatarNomeCidade(local) {
    const detalhes = [local.admin1, local.country].filter(Boolean).join(", ");

    return detalhes ? `${local.name} - ${detalhes}` : local.name;
}

function formatarTemperatura(valor) {
    return valor.toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
    });
}

function formatarMedida(valor, unidade) {
    const valorFormatado = formatarTemperatura(valor);

    return unidade === "%"
        ? `${valorFormatado}${unidade}`
        : `${valorFormatado} ${unidade}`;
}

function formatarDataHora(dataHoraApi) {
    const partes = dataHoraApi?.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
    );

    if (!partes) {
        return "data e hora não informadas";
    }

    const [, ano, mes, dia, hora, minuto] = partes;
    const data = new Date(ano, Number(mes) - 1, dia, hora, minuto);

    return `${FORMATADOR_DATA.format(data)} às ${FORMATADOR_HORA.format(data)}`;
}

function formatarDataCurta(dataApi) {
    const partes = dataApi?.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!partes) {
        return "Data não informada";
    }

    const [, ano, mes, dia] = partes;
    const data = new Date(ano, Number(mes) - 1, dia);

    return FORMATADOR_DIA_CURTO.format(data);
}

function obterPrevisaoDiaria(previsaoDiaria) {
    return previsaoDiaria.time.slice(0, 5).map((data, indice) => ({
        data,
        maxima: previsaoDiaria.temperature_2m_max[indice],
        minima: previsaoDiaria.temperature_2m_min[indice],
    }));
}

function renderizarPrevisao(previsaoDiaria, unidadesDiarias = {}) {
    if (!previsaoLista) {
        return;
    }

    const unidadeMaxima = unidadesDiarias.temperature_2m_max ?? "°C";
    const unidadeMinima = unidadesDiarias.temperature_2m_min ?? unidadeMaxima;
    const previsoes = obterPrevisaoDiaria(previsaoDiaria);

    previsaoLista.innerHTML = previsoes
        .map(
            (previsao) => `
                <article class="previsao-dia">
                    <span>${formatarDataCurta(previsao.data)}</span>
                    <p class="previsao-temperaturas">
                        <strong>Máx: ${formatarMedida(
                            previsao.maxima,
                            unidadeMaxima,
                        )}</strong>
                        <strong>Mín: ${formatarMedida(
                            previsao.minima,
                            unidadeMinima,
                        )}</strong>
                    </p>
                </article>
            `,
        )
        .join("");
}

function alternarTemaEscuro() {
    const temaEscuroAtivo = !document.body.classList.contains(CLASSE_TEMA_ESCURO);

    document.body.classList.toggle(CLASSE_TEMA_ESCURO, temaEscuroAtivo);
    atualizarBotaoTema(temaEscuroAtivo);
}

function atualizarBotaoTema(
    temaEscuroAtivo = document.body.classList.contains(CLASSE_TEMA_ESCURO),
) {
    if (!botaoTema) {
        return;
    }

    botaoTema.textContent = temaEscuroAtivo ? "Tema claro" : "Tema escuro";
    botaoTema.setAttribute("aria-pressed", String(temaEscuroAtivo));
}

function iniciarBusca() {
    mostrarMensagem("Buscando previsão...", "carregando");
    esconderResultado();

    if (botaoBuscar) {
        botaoBuscar.disabled = true;
        botaoBuscar.textContent = "Buscando...";
    }
}

function finalizarBusca() {
    if (botaoBuscar) {
        botaoBuscar.disabled = false;
        botaoBuscar.textContent = "Buscar clima";
    }
}

function esconderResultado() {
    resultado?.classList.remove("ativo");
}

function mostrarMensagem(texto, tipo) {
    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function tratarErro(erro) {
    console.error(erro);

    if (erro instanceof CidadeNaoEncontradaError) {
        mostrarMensagem(
            "Cidade não encontrada. Confira o nome e tente novamente.",
            "erro",
        );
    } else if (erro instanceof ErroRede) {
        mostrarMensagem(
            "Erro de rede. Verifique sua conexão e tente novamente.",
            "erro",
        );
    } else if (erro instanceof EntradaInvalidaError) {
        mostrarMensagem(erro.message, "erro");
    } else if (erro instanceof FalhaApiError) {
        mostrarMensagem(erro.message, "erro");
    } else {
        mostrarMensagem(
            "Não foi possível consultar a previsão do tempo.",
            "erro",
        );
    }

    esconderResultado();
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
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
        CidadeNaoEncontradaError,
        FalhaApiError,
        ErroRede,
        EntradaInvalidaError,
    };
}
