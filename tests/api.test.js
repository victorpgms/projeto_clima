const {
    buscarLocalizacao,
    buscarClimaAtual,
    CidadeNaoEncontradaError,
    FalhaApiError,
    ErroRede,
    EntradaInvalidaError,
} = require("../assets/js/api.js");

describe("Testes da API de previsão do tempo", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("1 - Nome de cidade válido retorna dados meteorológicos", async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
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
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({
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
            });

        const local = await buscarLocalizacao("São Paulo");

        const clima = await buscarClimaAtual(local.latitude, local.longitude);

        expect(local.name).toBe("São Paulo");
        expect(local.latitude).toBe(-23.55);
        expect(local.longitude).toBe(-46.63);

        expect(clima.current.temperature_2m).toBe(25.4);
        expect(clima.current.weather_code).toBe(1);

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test("2 - Nome de cidade inexistente lança exceção tratada", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                results: [],
            }),
        });

        await expect(buscarLocalizacao("Cidade Inexistente")).rejects.toThrow(
            CidadeNaoEncontradaError,
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("3 - Entrada vazia retorna erro de validação", async () => {
        await expect(buscarLocalizacao("   ")).rejects.toThrow(
            EntradaInvalidaError,
        );

        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("4 - Falha da API gera resposta adequada", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await expect(buscarClimaAtual(-23.55, -46.63)).rejects.toThrow(
            FalhaApiError,
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("5 - Limite de requisições da API excedido é tratado", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 429,
        });

        await expect(buscarClimaAtual(-23.55, -46.63)).rejects.toThrow(
            "Limite de requisições da API excedido",
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("6 - Conexão de rede instável gera erro de rede", async () => {
        global.fetch.mockRejectedValueOnce(new Error("Falha de conexão"));

        await expect(buscarLocalizacao("São Paulo")).rejects.toThrow(ErroRede);

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("7 - Mudança inesperada no formato JSON é tratada", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                current: {
                    weather_code: 1,
                    is_day: 1,
                },
            }),
        });

        await expect(buscarClimaAtual(-23.55, -46.63)).rejects.toThrow(
            "A API retornou dados climáticos incompletos.",
        );

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
