# Relatório de Segurança e Privacidade

Data da auditoria: 12 de agosto de 2026

## Escopo

Foram analisados `index.html`, `assets/js/api.js`, `assets/css/style.css`, `package.json`, `package-lock.json` e `tests/api.test.js`.

O projeto é uma aplicação web estática, sem backend próprio, autenticação, banco de dados, cookies ou armazenamento local persistente.

## Fluxo de Dados

1. O usuário digita o nome de uma cidade.
2. A cidade é enviada via HTTPS para a Open-Meteo Geocoding API.
3. A resposta contém latitude, longitude e metadados públicos da cidade.
4. Latitude e longitude são enviadas via HTTPS para a Open-Meteo Forecast API.
5. O navegador exibe temperatura, descrição, umidade, vento, precipitação e previsão de 5 dias.

Dados não armazenados pela aplicação:

- Nome da cidade pesquisada.
- Coordenadas retornadas.
- Dados climáticos.
- Preferência de tema.
- Identificadores pessoais.

## Riscos Identificados

| Risco | Severidade | Situação |
| --- | --- | --- |
| Envio da cidade pesquisada a uma API externa | Baixa/Média | Mitigado com aviso de privacidade no HTML e documentação |
| Requisições a CDN externa para ícones | Baixa | Documentado em README e NOTICE |
| Uso de dados externos na interface | Média | Mitigado com renderização por DOM e `textContent` |
| Comunicação insegura por HTTP | Média | Mitigado com validação de URLs HTTPS e CSP |
| Vazamento de chaves/API secrets | Baixa | Não há chaves de API no projeto |
| Logs técnicos em produção | Baixa | Reduzidos para modo debug local |

## Correções Aplicadas

- Adicionado aviso de privacidade visível na interface.
- Adicionada atribuição visível para Open-Meteo.
- Adicionado `Content-Security-Policy` no HTML:
  - scripts restritos a `'self'`;
  - conexões restritas às APIs da Open-Meteo;
  - estilos/fontes restritos ao projeto e cdnjs;
  - bloqueio de `object-src`;
  - `base-uri` e `form-action` restritos.
- Adicionado `referrer` como `no-referrer`.
- Adicionado SRI e `crossorigin="anonymous"` ao CSS externo do Weather Icons.
- `buscarJson` agora rejeita URLs que não usam HTTPS.
- A previsão de 5 dias deixou de ser renderizada com `innerHTML` e passou a usar `document.createElement` e `textContent`.
- Logs detalhados passam a ser exibidos apenas em ambiente local/debug.
- Testes atualizados para cobrir bloqueio de HTTP e renderização segura.

## Resultado de Auditoria Automatizada

Comando executado:

```bash
npm audit --omit=dev
```

Resultado:

```text
found 0 vulnerabilities
```

Observação: a aplicação não possui dependências de produção via npm. O Jest é usado apenas como dependência de desenvolvimento.

## Recomendações para Produção

- Servir a aplicação somente por HTTPS.
- Preferir CSP via cabeçalhos HTTP no servidor, além da meta tag.
- Manter ou reforçar estes cabeçalhos em produção:
  - `Content-Security-Policy`
  - `Referrer-Policy: no-referrer`
  - `X-Content-Type-Options: nosniff`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=()`
  - `Strict-Transport-Security` quando o domínio estiver integralmente em HTTPS.
- Considerar hospedar Weather Icons localmente para reduzir dependência de CDN e exposição de metadados a terceiros.
- Não adicionar chaves de API, tokens ou credenciais ao frontend.
- Não ativar geolocalização automática sem consentimento explícito.
- Executar `npm audit` e testes antes de publicar novas versões.
- Revisar termos da Open-Meteo antes de uso comercial.
