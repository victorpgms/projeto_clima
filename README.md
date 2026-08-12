# Projeto Clima

Aplicação web estática para consultar o clima atual e a previsão dos próximos 5 dias a partir do nome de uma cidade. O projeto usa HTML, CSS e JavaScript no navegador, consome as APIs públicas da Open-Meteo e inclui testes automatizados com Jest.

## Funcionalidades

- Busca de cidade por nome com conversão para latitude e longitude.
- Temperatura atual em graus Celsius.
- Descrição textual do clima e ícone correspondente com Weather Icons.
- Umidade, velocidade do vento e precipitação do momento da consulta.
- Previsão de 5 dias com temperaturas máximas e mínimas diárias.
- Alternância visual automática entre dia e noite conforme a resposta da API.
- Botão manual de tema escuro.
- Tratamento de cidade inválida, erro de rede, falhas de API, limite de requisições e respostas incompletas.
- Aviso de privacidade visível na interface.
- Política de segurança no HTML com CSP, `referrer` restrito e SRI para o CSS externo.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Fetch API
- Open-Meteo Geocoding API
- Open-Meteo Forecast API
- Weather Icons 2.0.12 via cdnjs
- Node.js e npm
- Jest

## Estrutura

```text
projeto_clima/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── api.js
├── tests/
│   └── api.test.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── LICENSE
├── NOTICE.md
├── SECURITY_PRIVACY_REPORT.md
└── LICENSE_COMPLIANCE_REPORT.md
```

## Instalação

Requisitos:

- Node.js 18 ou superior recomendado.
- npm instalado junto com o Node.js.

Clone o repositório:

```bash
git clone https://github.com/victorpgms/projeto_clima.git
cd projeto_clima
```

Instale as dependências de desenvolvimento:

```bash
npm install
```

## Execução

Como o projeto é estático, é possível abrir o arquivo `index.html` diretamente no navegador.

Opcionalmente, use um servidor local para simular melhor um ambiente web:

```bash
npx http-server .
```

Depois acesse o endereço local indicado pelo terminal.

## Exemplo de Uso

1. Abra a aplicação no navegador.
2. Digite uma cidade, por exemplo `São Paulo`.
3. Clique em `Buscar clima`.
4. A tela exibirá cidade, temperatura atual, descrição do clima, umidade, vento, precipitação e previsão de 5 dias.
5. Use `Tema escuro` para alternar manualmente a aparência.

## Testes

Execute a suíte automatizada:

```bash
npm test
```

No PowerShell, se a política de execução bloquear `npm`, use:

```powershell
npm.cmd test
```

Gerar cobertura:

```bash
npm test -- --coverage --runInBand
```

Os testes cobrem:

- Cidade válida e cidade inexistente.
- Entrada vazia e coordenadas inválidas.
- Erros HTTP, limite `429`, falha de rede e JSON inválido.
- Campos obrigatórios do clima atual.
- Previsão diária incompleta.
- Formatação de cidade, temperatura, medidas e datas.
- Renderização do resultado na interface.
- Botão de tema escuro.
- Bloqueio de URLs sem HTTPS no helper de rede.

## Segurança e Privacidade

A aplicação não possui login, backend próprio, banco de dados, cookies, `localStorage` ou chaves de API. A cidade digitada é enviada para a Open-Meteo para obter coordenadas e dados meteorológicos. O navegador também carrega o CSS e as fontes do Weather Icons via cdnjs, o que pode gerar metadados técnicos normais de requisições HTTP para o provedor de CDN.

Medidas aplicadas:

- Uso exclusivo de endpoints `https://`.
- Bloqueio de URLs não HTTPS no helper `buscarJson`.
- CSP no `index.html` restringindo scripts, estilos, fontes e conexões externas.
- `referrer` configurado como `no-referrer`.
- SRI no CSS externo do Weather Icons.
- Renderização da previsão via DOM e `textContent`, sem inserir dados externos por `innerHTML`.
- Mensagens de erro amigáveis ao usuário, sem exposição de detalhes técnicos em produção.

Leia o relatório completo em [SECURITY_PRIVACY_REPORT.md](SECURITY_PRIVACY_REPORT.md).

## Licenciamento e Conformidade

O projeto está licenciado sob MIT. Consulte [LICENSE](LICENSE).

Componentes e serviços de terceiros estão listados em [NOTICE.md](NOTICE.md). A Open-Meteo exige atribuição para os dados climáticos, por isso a aplicação exibe crédito próximo aos resultados.

Para uso comercial, revise os termos atuais da Open-Meteo, pois a API pública é documentada como gratuita para uso não comercial, com dados sob CC BY 4.0.

Leia a análise completa em [LICENSE_COMPLIANCE_REPORT.md](LICENSE_COMPLIANCE_REPORT.md).

## Fontes Oficiais Consultadas

- Open-Meteo: https://open-meteo.com/
- Repositório Open-Meteo: https://github.com/open-meteo/open-meteo
- Weather Icons: https://erikflowers.github.io/weather-icons/
- Repositório Weather Icons: https://github.com/erikflowers/weather-icons
- cdnjs: https://cdnjs.com/
- Jest: https://jestjs.io/

## Autor

Victor Pedro

- GitHub: https://github.com/victorpgms
- Repositório: https://github.com/victorpgms/projeto_clima
