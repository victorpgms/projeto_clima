# Atribuições e Créditos de Terceiros

Este projeto utiliza APIs, bibliotecas e serviços de terceiros. As atribuições abaixo devem ser mantidas em redistribuições públicas do projeto.

## APIs e Dados

### Open-Meteo

- Uso no projeto: geocodificação de cidades e dados meteorológicos atuais/diários.
- URLs:
  - https://open-meteo.com/
  - https://github.com/open-meteo/open-meteo
- Licença dos dados: Attribution 4.0 International (CC BY 4.0).
- Licença do código-fonte da Open-Meteo: AGPL-3.0, aplicável ao código-fonte da Open-Meteo, não ao simples consumo da API.
- Observação de uso: a API pública é documentada como gratuita para uso não comercial. Para uso comercial, revise os termos vigentes da Open-Meteo.
- Atribuição exibida na aplicação: "Dados meteorológicos por Open-Meteo.com".

## Ícones e Fontes

### Weather Icons 2.0.12

- Autor/manutenção: Erik Flowers.
- Créditos do projeto original: Erik Flowers e Lukas Bischoff.
- Uso no projeto: fonte/CSS de ícones climáticos.
- URL: https://github.com/erikflowers/weather-icons
- Licenças:
  - Fonte/ícones: SIL Open Font License 1.1.
  - Código/CSS: MIT License.
  - Documentação: CC BY 3.0.

## CDN

### cdnjs / Cloudflare

- Uso no projeto: entrega do arquivo `weather-icons.min.css` e fontes relacionadas.
- URLs:
  - https://cdnjs.com/
  - https://cdnjs.cloudflare.com/
- Observação: cdnjs distribui bibliotecas open source via infraestrutura Cloudflare. O uso do CDN também está sujeito aos termos e políticas de privacidade do provedor.

## Ferramentas de Desenvolvimento

### Jest

- Uso no projeto: testes automatizados.
- URL: https://jestjs.io/
- Licença do pacote principal: MIT.
- Escopo: dependência de desenvolvimento, não carregada em produção no navegador.

## Dependências Transitivas do Node

As dependências transitivas instaladas por `jest` aparecem no `package-lock.json`. Na auditoria local, foram identificadas licenças permissivas, incluindo MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD, BlueOak-1.0.0, CC-BY-4.0 e combinação MIT OR CC0-1.0.

Recomendação: antes de redistribuição comercial, gere uma revisão atualizada a partir do `package-lock.json`, pois versões e licenças transitivas podem mudar após atualizações de dependências.
