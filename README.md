Projeto Clima

Aplicação web para consultar o clima atual de uma cidade a partir do nome informado pelo usuário. O projeto utiliza HTML, CSS e JavaScript no frontend, além de um backend simples em JavaScript puro com Node.js, consumindo as APIs públicas da Open-Meteo.

Funcionalidades
Busca de cidade por nome.
Conversão da cidade em latitude e longitude.
Exibição da temperatura atual em graus Celsius.
Exibição da sensação térmica.
Exibição da umidade atual.
Exibição da velocidade do vento.
Identificação da condição atual do clima.
Tratamento para cidades não encontradas.
Tratamento básico de erros durante a consulta.
Interface simples e responsiva para desktop e dispositivos móveis.
Tecnologias
HTML5
CSS3
JavaScript
Node.js
Fetch API
Open-Meteo Geocoding API
Open-Meteo Forecast API
Estrutura
app_clima/
├── index.html
├── style.css
├── script.js
├── server.js
└── README.md
Instalação

Requisitos:

Node.js instalado na máquina.
Editor de código de sua preferência, como Visual Studio Code.

Clone o repositório:

git clone https://github.com/phcarneiro9/app-clima.git
cd app-clima

O projeto não utiliza bibliotecas ou frameworks adicionais, portanto não é necessário executar npm install.

Execução

Abra o terminal dentro da pasta do projeto e execute:

node server.js

O terminal exibirá uma mensagem semelhante a:

Servidor rodando na porta 3000
Acesse: http://localhost:3000

Depois, abra no navegador:

http://localhost:3000
Exemplo de Uso
Inicie o servidor com node server.js.
Abra http://localhost:3000 no navegador.
Digite o nome de uma cidade, por exemplo São Paulo.
Clique no botão para buscar o clima.
A aplicação exibirá as informações meteorológicas atuais da cidade.
API

O projeto utiliza a API pública da Open-Meteo.

Primeiro, a aplicação utiliza a API de geolocalização para localizar a cidade e obter suas coordenadas.

Exemplo:

https://geocoding-api.open-meteo.com/v1/search

Depois, utiliza latitude e longitude para consultar os dados meteorológicos.

Exemplo:

https://api.open-meteo.com/v1/forecast

Os principais dados utilizados na aplicação são:

Temperatura atual.
Sensação térmica.
Umidade relativa do ar.
Velocidade do vento.
Código da condição meteorológica.
Backend

O backend foi desenvolvido utilizando JavaScript puro com Node.js, sem Express ou outros frameworks.

O servidor é responsável por:

Servir os arquivos HTML, CSS e JavaScript.
Receber o nome da cidade informado pelo usuário.
Consultar a API da Open-Meteo.
Processar os dados recebidos.
Retornar as informações para o frontend.

A porta utilizada pelo projeto é configurada da seguinte forma:

const PORT = process.env.PORT || 3000;

Isso permite que a aplicação funcione localmente e também em serviços de deploy que fornecem uma porta automaticamente.

Responsividade

A interface foi desenvolvida para funcionar em diferentes tamanhos de tela, incluindo:

Computadores.
Tablets.
Smartphones.

O CSS utiliza ajustes responsivos para manter os elementos organizados em dispositivos móveis.

Tratamento de Erros

A aplicação possui tratamento básico para situações como:

Campo de cidade vazio.
Cidade não encontrada.
Falha ao consultar a API.
Problemas de comunicação com o servidor.

Quando algum erro ocorre, uma mensagem é exibida ao usuário.

Deploy

O projeto está preparado para deploy em serviços que suportam aplicações Node.js, como o Render.

Comando de inicialização:

node server.js

A aplicação utiliza a variável de ambiente PORT disponibilizada pelo serviço de hospedagem.

Objetivo do Projeto

Este projeto foi desenvolvido como atividade prática com o objetivo de aplicar conceitos de desenvolvimento web e integração com APIs REST públicas.

Durante o desenvolvimento foram utilizados conceitos como:

Estruturação de páginas com HTML.
Estilização e responsividade com CSS.
Manipulação de elementos com JavaScript.
Requisições HTTP utilizando Fetch API.
Consumo de API REST.
Desenvolvimento de servidor com Node.js.
Tratamento de dados JSON.
Integração entre frontend e backend.

Desenvolvido por: Patrick Carneiro

GitHub: https://github.com/phcarneiro9
