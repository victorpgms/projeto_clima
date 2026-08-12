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

class CidadeNaoEncontradaError extends Error {}
class FalhaApiError extends Error {}
class ErroRede extends Error {}
class EntradaInvalidaError extends Error {}

if (formClima) {
    formClima.addEventListener("submit", async function (event) {
        event.preventDefault();

        const cidade = inputCidade.value.trim();

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

async function buscarClimaAtual(latitude, longitude) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.search = new URLSearchParams({
        latitude,
        longitude,
        current: "temperature_2m,weather_code,is_day",
        temperature_unit: "celsius",
        timezone: "auto",
    });

    const dados = await buscarJson(
        url,
        "A API de clima falhou. Tente novamente em alguns instantes.",
    );

    if (!dados.current || typeof dados.current.temperature_2m !== "number") {
        throw new FalhaApiError("A API retornou dados climáticos incompletos.");
    }

    return dados;
}

async function buscarJson(url, mensagemErroApi) {
    let resposta;

    try {
        resposta = await fetch(url);
    } catch {
        throw new ErroRede();
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
    const unidade = dadosClima.current_units?.temperature_2m ?? "°C";

    nomeCidade.textContent = formatarNomeCidade(local);
    temperatura.textContent = `${formatarTemperatura(
        climaAtual.temperature_2m,
    )}${unidade}`;
    descricaoClima.textContent = clima.descricao;
    dataConsulta.textContent = `Consulta: ${formatarDataHora(climaAtual.time)}`;

    iconeClima.className = `wi ${clima.icone}`;
    iconeClima.setAttribute("title", clima.descricao);

    document.body.classList.toggle("periodo-dia", ehDia);
    document.body.classList.toggle("periodo-noite", !ehDia);

    mostrarMensagem("", "");
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

function formatarDataHora(dataHoraApi) {
    const partes = dataHoraApi?.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
    );

    if (!partes) {
        return "data e hora não informadas";
    }

    const [, ano, mes, dia, hora, minuto] = partes;
    const data = new Date(ano, Number(mes) - 1, dia, hora, minuto);
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(data);
    const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(data);

    return `${dataFormatada} às ${horaFormatada}`;
}

function iniciarBusca() {
    mostrarMensagem("Buscando previsão...", "carregando");
    esconderResultado();
    botaoBuscar.disabled = true;
    botaoBuscar.textContent = "Buscando...";
}

function finalizarBusca() {
    botaoBuscar.disabled = false;
    botaoBuscar.textContent = "Buscar clima";
}

function esconderResultado() {
    resultado.classList.remove("ativo");
}

function mostrarMensagem(texto, tipo) {
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
        CidadeNaoEncontradaError,
        FalhaApiError,
        ErroRede,
        EntradaInvalidaError,
    };
}
