# Relatório de Licenciamento e Conformidade

Data da auditoria: 12 de agosto de 2026

## Escopo

Foram revisados os arquivos `package.json`, `package-lock.json`, `index.html`, `assets/js/api.js`, `README.md`, `LICENSE` e `NOTICE.md`, além das fontes oficiais dos serviços e bibliotecas de terceiros.

## Licença do Projeto

- Licença escolhida: MIT.
- Arquivo criado: `LICENSE`, com texto completo em inglês e português.
- `package.json` e `package-lock.json` atualizados para `MIT`.

## Componentes de Terceiros

| Componente | Uso | Licença/Termos | Status |
| --- | --- | --- | --- |
| Open-Meteo API | Geocodificação e clima | Dados sob CC BY 4.0; API pública gratuita para uso não comercial; código-fonte Open-Meteo sob AGPL-3.0 | Compatível para uso educacional com atribuição; uso comercial exige revisão dos termos |
| Weather Icons 2.0.12 | Ícones climáticos | SIL OFL 1.1 para fonte/ícones; MIT para CSS/código; CC BY 3.0 para documentação | Compatível; atribuição registrada em NOTICE |
| cdnjs / Cloudflare | CDN do Weather Icons | Termos e política de privacidade do provedor | Compatível; dependência operacional documentada |
| Jest | Testes automatizados | MIT para o pacote principal | Compatível; devDependency |
| Dependências transitivas do Jest | Testes | MIT, ISC, BSD, Apache-2.0, 0BSD, BlueOak-1.0.0, CC-BY-4.0 e MIT OR CC0-1.0 conforme `package-lock.json` | Compatíveis para uso educacional; revisar ao atualizar versões |

## Alertas de Conformidade

- A atribuição da Open-Meteo deve permanecer visível quando os dados climáticos forem exibidos.
- A API pública da Open-Meteo é indicada para uso não comercial gratuito. Para uso comercial, validar termos vigentes e eventual plano comercial.
- O carregamento por CDN envolve um terceiro operacional. Para ambientes com requisitos rígidos de privacidade, hospedar os assets localmente.
- Manter `NOTICE.md` junto ao projeto em redistribuições públicas.
- Ao atualizar dependências com `npm update` ou `npm install`, repetir a auditoria de licenças no `package-lock.json`.

## Conclusão

Não foram encontrados conflitos de licenciamento para uso educacional. Para uso comercial, o principal ponto de atenção é a política de uso da Open-Meteo, que deve ser confirmada antes de publicação comercial ou uso em produto.
