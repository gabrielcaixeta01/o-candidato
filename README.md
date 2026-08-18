# O Candidato

Portal factual dos candidatos à Presidência da República em 2026.

Todos os candidatos aparecem em ordem alfabética, com diagramação idêntica.
O site publica apenas dados verificáveis — partido, número, vice, idade, bio e
manchetes com link para a fonte. Sem ranking, sem pesquisa de intenção de voto,
sem cor partidária e sem linguagem de opinião.

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
npm run noticias  # popula src/data/noticias.json manualmente
```

## Dados

Tudo vive em JSON versionado. A página é estática e só muda quando o JSON muda.

| Arquivo | Origem | Editado por |
| --- | --- | --- |
| `src/data/candidatos.json` | Registros do TSE | à mão |
| `src/data/calendario.json` | Calendário eleitoral do TSE | à mão |
| `src/data/noticias.json` | RSS / News API | `scripts/fetch-noticias.mjs` |

Os tipos estão em [`src/lib/types.ts`](src/lib/types.ts), com a regra de cada campo.

### Fotos

As 13 fotos vêm do Wikimedia Commons sob licença livre (CC BY, CC BY-SA ou
Attribution) e ficam **versionadas** em `public/candidatos/`, a 800px de largura,
~2,2 MB no total.

Ficam no repositório de propósito: servidas direto do Wikimedia, o otimizador do
Next tomava HTTP 429 em cache frio e parte dos retratos não carregava. Uma foto
que some quebra a paridade visual entre as candidaturas, que é justamente o que o
projeto precisa garantir.

Para trocar uma foto, salve o arquivo em `public/candidatos/` e aponte o campo:

```json
"foto": {
  "url": "/candidatos/fulano.jpg",
  "credito": "Fulano de Tal/Agência Brasil",
  "licenca": "CC BY 3.0 BR",
  "origem": "https://commons.wikimedia.org/wiki/File:..."
}
```

`credito` e `licenca` são obrigatórios — são exigência das licenças, não enfeite,
e aparecem na aba Perfil. Para usar um host externo, declare-o em
`images.remotePatterns` no [`next.config.ts`](next.config.ts).

Com `foto: null` o card cai num retrato de iniciais na mesma proporção 3:4, então
a diagramação não muda.

> A foto do Renan Santos é a única sem retrato institucional disponível no acervo
> livre — é uma foto de 2018 auto-publicada. Vale trocar se aparecer uma oficial.

### Temas e planos de governo

`temas` está vazio e `planoGoverno` está `null` em todas as candidaturas: os
planos registrados no TSE ainda não foram lidos, e preencher por dedução
violaria o princípio de factualidade do projeto. A aba **Propostas** já trata
esse caso e aponta para o DivulgaCandContas. Ao extrair os temas de cada plano,
basta preencher os dois campos — a interface não precisa mudar.

## Atualização automática de notícias

[`.github/workflows/atualizar-noticias.yml`](.github/workflows/atualizar-noticias.yml)
roda toda segunda-feira às 09:00 UTC (também dá para disparar à mão em
*Actions → Atualizar notícias → Run workflow*). O script busca manchetes de cada
candidato, reescreve `noticias.json` e commita; o commit dispara o redeploy na
Vercel.

Guardamos apenas título, veículo, data e link — o texto da matéria nunca é
reproduzido.

Se uma busca falhar, aquele candidato mantém as manchetes já commitadas em vez
de ficar vazio. O job só quebra se todas as buscas falharem.

### Configuração

Tudo por variável de ambiente, nenhuma obrigatória. No GitHub, defina como
*repository variables* (ou *secrets*, no caso da chave).

| Variável | Padrão | O que faz |
| --- | --- | --- |
| `FONTE_NOTICIAS` | `rss` | `rss` ou `newsapi` |
| `RSS_TEMPLATE` | Google News pt-BR | URL do feed, com `{consulta}` no lugar do termo |
| `NEWSAPI_URL` | `https://newsapi.org/v2/everything` | Endpoint do NewsAPI |
| `NEWSAPI_KEY` | — | Obrigatória com `FONTE_NOTICIAS=newsapi` |
| `MAX_POR_CANDIDATO` | `6` | Máximo de manchetes por candidato |
| `JANELA_DIAS` | `45` | Idade máxima de uma manchete |

## Decisões de neutralidade

Escolhas de produto que existem para sustentar a neutralidade — não são detalhes
de implementação e não devem ser "otimizadas" sem intenção:

- A única ordenação exposta é alfabética pelo nome de urna registrado no TSE.
  O filtro de busca remove itens, mas nunca reordena — ordenar por relevância
  criaria um ranking implícito.
- Cards têm foto na mesma proporção, número na mesma posição e bio com altura
  fixa de duas linhas, para que nenhuma candidatura pareça mais importante.
- Os retratos são exibidos em preto-e-branco (ganham cor no hover). As fotos vêm
  de fontes distintas, e a dessaturação impede que um retrato de estúdio salte
  sobre um registro de evento.
- Bronze (`#8a6a2f`) é o único acento, escolhido por não pertencer a nenhum
  partido brasileiro. Nenhuma cor partidária aparece em lugar nenhum.
- Tema claro único, sem variante escura: uma segunda diagramação seria mais um
  lugar onde a paridade entre candidatos poderia quebrar.
- Campos sem fonte confirmada mostram travessão em vez de estimativa.
- `observacao` descreve andamento processual objetivo (ex.: registro em análise),
  nunca o mérito da candidatura.
