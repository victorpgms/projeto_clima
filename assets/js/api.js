const formClima = document.querySelector("#form-clima");
const inputCidade = document.querySelector("#cidade");
const mensagem = document.querySelector("#mensagem");

const resultado = document.querySelector("#resultado");
const nomeCidade = document.querySelector("#nome-cidade");
const temperatura = document.querySelector("#temperatura");

formClima.addEventListener("submit", async function (event) {
    event.preventDefault();

    const cidade = inputCidade.value.trim();

    if (!cidade) {
        mensagem.textContent = "Digite o nome de uma cidade.";
        resultado.classList.remove("ativo");
        return;
    }

    mensagem.textContent = "Buscando previsão...";
    resultado.classList.remove("ativo");

    try {
        // Busca as coordenadas da cidade
        const urlGeocoding =
            `https://geocoding-api.open-meteo.com/v1/search` +
            `?name=${encodeURIComponent(cidade)}` +
            `&count=1&language=pt&format=json`;

        const respostaGeocoding = await fetch(urlGeocoding);

        if (!respostaGeocoding.ok) {
            throw new Error("Erro ao buscar a cidade.");
        }

        const dadosGeocoding = await respostaGeocoding.json();

        if (!dadosGeocoding.results || dadosGeocoding.results.length === 0) {
            mensagem.textContent = "Cidade não encontrada.";
            return;
        }

        const local = dadosGeocoding.results[0];

        const latitude = local.latitude;
        const longitude = local.longitude;

        // Busca a temperatura atual
        const urlClima =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m` +
            `&timezone=auto`;

        const respostaClima = await fetch(urlClima);

        if (!respostaClima.ok) {
            throw new Error("Erro ao buscar os dados climáticos.");
        }

        const dadosClima = await respostaClima.json();

        const temperaturaAtual = dadosClima.current.temperature_2m;
        const unidade = dadosClima.current_units.temperature_2m;

        nomeCidade.textContent =
            `${local.name} - ${local.admin1 || local.country}`;

        temperatura.textContent =
            `${temperaturaAtual}${unidade}`;

        mensagem.textContent = "";

        resultado.classList.add("ativo");
    } catch (erro) {
        console.error(erro);

        mensagem.textContent =
            "Não foi possível consultar a previsão do tempo.";

        resultado.classList.remove("ativo");
    }
});