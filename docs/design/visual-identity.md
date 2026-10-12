# Identidade visual — FTech Finance

O produto se chama **FTech Finance** e pertence à **FarmTech**. A identidade é a da FarmTech: a
paleta de sete cores, as fontes Outfit e JetBrains Mono e o símbolo em grade de pontos. O clima é
sóbrio e neutro, de banco: pouca cor, muita linha, números que alinham.

Decidido pelo responsável em 2026-10-11, pela FC-006, com o Design System e o Design do Claude.

## Onde está cada coisa

| O quê                                              | Onde                                                                          | Versão aprovada   |
| -------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------- |
| Design System (livro da marca, tokens, componentes) | [claude.ai/artifact/DxDnUbE9sSQdJbxTPh6WPQ](https://claude.ai/artifact/DxDnUbE9sSQdJbxTPh6WPQ) | `1791756594-5be0` |
| Design do dashboard de saldo (seis artboards)       | [claude.ai/artifact/HEj1d1jqqwAPMBVYZdMsyy](https://claude.ai/artifact/HEj1d1jqqwAPMBVYZdMsyy) | `1791757029-deb7` |
| Canvas de padrões de tela (24 artboards, escuro e claro) | [claude.ai/artifact/YA6oWvBzWghdVTa2kAFTkC](https://claude.ai/artifact/YA6oWvBzWghdVTa2kAFTkC) | `1791836639-e596` |
| Tokens, fonte de verdade para o código             | [`tokens.json`](tokens.json)                                                  | cópia da versão acima |
| Verificação de contraste                            | [`check-contrast.mjs`](check-contrast.mjs)                                    |                   |
| Marca da FarmTech (logo, símbolo, ícones)           | [`assets/`](assets/)                                                          |                   |

Os artifacts são privados: só o responsável os abre, até compartilhar pelo menu da página. Eles
guardam o histórico, mas não têm tags; a versão aprovada é a que está nesta tabela, e a cópia
versionada aqui é o que vale para o código.

## O que foi decidido

- **Nome de exibição:** "FTech Finance", em texto, ao lado do símbolo compacto da FarmTech. O
  logo horizontal da FarmTech aparece só na tela de login e no rodapé "por FarmTech".
- **Tema escuro é a referência**, porque a FarmTech é escura; o tema claro deriva dele. O app segue
  o tema do sistema e deixa o usuário fixar um dos dois.
- **Cores semânticas** (26), com nomes em português: `fundo`, `superficie`, `superficie-elevada`,
  `linha`, `linha-forte`, `texto`, `texto-apoio`, `acento`, `acento-hover`, `sobre-acento`, `foco`
  e as famílias `positivo`, `negativo`, `atencao` e `info`, cada uma com o seu `*-fundo`. Os sete
  `marca-*` são a paleta da FarmTech, exata, e não entram na interface direto.
- **Dinheiro:** `R$ 1.234,56`, sinal antes do `R$` (`+` receita, `−` despesa), algarismos
  tabulares; a cor nunca vai sem o sinal. `positivo` é o verde da marca; `negativo` é vermelho.
- **Status:** selo com ponto, rótulo e fundo da família: pago/recebido (`positivo`), pendente
  (neutro), vencido (`negativo`), agendado/em aberto (`info`), fechada/vence hoje (`atencao`).
- **Tipografia:** Outfit em oito estilos de texto e três de dinheiro; JetBrains Mono só em código.
  As duas vêm do Google Fonts.
- **Espaço e forma:** base de 4px, raios de 4/8/12px e pílula, bordas em vez de sombra.
- **Breakpoints:** tablet a partir de 768px e desktop a partir de 1024px, iguais aos `md` e `lg`
  do Tailwind. Lista vira tabela no tablet; navegação vai da barra inferior para a lateral no
  desktop.
- **Ícones:** lucide, traço de 1,75px.
- **Acessibilidade:** todo par texto/fundo nomeado nas notas dos tokens fica em 4,5:1 ou mais nos
  dois temas; bordas de controle e foco em 3:1 ou mais. `node docs/design/check-contrast.mjs`
  confere os 60 pares e falha se algum cair.

O detalhe de cada regra, com os tokens nomeados, está no livro da marca dentro do Design System
(`project/README.md`).

## Formato dos tokens

O `tokens.json` está no formato do Design System do Claude, em listas (`{"tokens": [{"name",
"value", "usage"}]}`, com `value` por tema), e não no DTCG que a FC-006 previa. O motivo: o Design
System não lê DTCG, e manter os dois formatos criaria duas fontes que divergem. O arquivo é copiado
do artifact sem conversão, e o gerador do tema do frontend lê este formato.

## Telas aprovadas

O canvas do dashboard tem seis artboards, nos dois temas:

| Artboard             | Tamanho    | Arquivo no canvas       |
| -------------------- | ---------- | ----------------------- |
| Celular · escuro     | 390 × 844  | `Main.dc.html`          |
| Tablet · escuro      | 834 × 1112 | `Tablet.dc.html`        |
| Desktop · escuro     | 1440 × 900 | `Desktop.dc.html`       |
| Celular · claro      | 390 × 844  | `CelularClaro.dc.html`  |
| Tablet · claro       | 834 × 1112 | `TabletClaro.dc.html`   |
| Desktop · claro      | 1440 × 900 | `DesktopClaro.dc.html`  |

O [canvas de padrões](https://claude.ai/artifact/YA6oWvBzWghdVTa2kAFTkC), aprovado em 2026-10-12, dá a
forma das demais telas (specs `0009`–`0018` do frontend): lista de lançamentos, formulário (folha
no celular, diálogo no desktop), fatura com pagamento, cadastros com confirmação, relatórios, a
página **Mais** e usuários — cada um em celular e desktop, nos dois temas (24 artboards). As telas
são montadas a partir dele e dos componentes do Design System, sem artboard por tela. As peças que
ele desenha e o Design System ainda não define (diálogo, folha, select, abas, véu do diálogo, botão
destrutivo, cores de gráfico, entre outras) estão listadas nas questões abertas da spec `0009` e
voltam ao Design System quando forem formalizadas.

PNGs exportados ficam em `screens/` quando houver; até lá, os canvas são a referência.

## Como mudar

1. A mudança nasce no Design System (pela página ou por um agente) e, se for de tela, no canvas.
2. Aprovada, copia-se `project/tokens.json` do artifact para `docs/design/tokens.json`, roda-se
   `node docs/design/check-contrast.mjs` e atualiza-se a versão nesta tabela, no mesmo PR.
3. O frontend regenera o tema a partir do `tokens.json` novo.

O comportamento das telas continua nas specs do frontend; o design é referência visual, nunca a
fonte de verdade do que a tela faz.
