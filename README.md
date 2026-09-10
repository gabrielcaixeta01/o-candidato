# O Candidato

Portal factual dos candidatos à Presidência da República em 2026.

Todos os candidatos aparecem em ordem alfabética, com diagramação idêntica.
O site publica apenas dados verificáveis — o registro no TSE, um resumo de
trajetória, os capítulos do plano de governo transcritos do documento oficial e
manchetes com link para a fonte. Sem ranking, sem pesquisa de intenção de voto,
sem cor partidária e sem linguagem de opinião.

## Estrutura

| Rota | O que é |
| --- | --- |
| `/` | Hero, calendário eleitoral, busca e galeria das 13 candidaturas — etapa 1 de 4 (Presidente) da jornada do eleitor |
| `/candidato/[slug]` | Ficha completa, uma por candidatura, pré-renderizada no build |
| `/governador` | Etapa 2 de 4: resumo das candidaturas a Governador do DF (sem ficha dedicada) |
| `/senador` | Etapa 3 de 4: resumo das candidaturas a Senador pelo DF (sem ficha dedicada) |
| `/resumo` | Etapa 4 de 4: recapitulação dos 4 cargos que o eleitor do DF vota em 2026 |

As quatro rotas formam um wizard com navegação "etapa anterior/próxima"
(`src/lib/etapas.ts`, `src/components/EtapaNav.tsx`). Governador e Senador
mostram só nome, número, partido, situação do registro e vice/suplentes —
não têm ficha própria como Presidente. O corte é só o Distrito Federal: não
há seletor de estado/cidade, e Deputado Federal e Deputado Distrital ficam
de fora (centenas de candidatos cada, exigem um desenho de lista à parte).

A ficha traz: retrato creditado, resumo de trajetória, posicionamento do
partido segundo levantamentos externos, capítulos do plano de governo com
resumo e link para o PDF registrado, manchetes recentes e uma tabela com o
registro no TSE (nascimento, naturalidade, escolaridade, ocupação declarada e
situação do pedido de registro).

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
| `src/data/propostas.json` | Planos de governo registrados no TSE | à mão |
| `src/data/espectro.json` | Levantamentos de terceiros sobre os partidos | à mão |
| `src/data/calendario.json` | Calendário eleitoral do TSE | à mão |
| `src/data/cargos-df.json` | Registros do TSE (Governador) + imprensa (suplentes de Senador e parte dos vices) | à mão |
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

### Planos de governo e temas

Os PDFs em `public/planos/` são os planos que os próprios candidatos
protocolaram, extraídos do pacote oficial do TSE:

```
https://cdn.tse.jus.br/estatistica/sead/odsele/proposta_governo/proposta_governo_2026_BR.zip
```

Ficam versionados porque o TSE publica os planos **só em .zip por unidade
eleitoral** — não existe URL por candidato para linkar. São ~15 MB no total.

`src/data/propostas.json` mapeia `slug → [{ titulo, resumo }]`, 174 capítulos ao
todo:

- **`titulo`** é transcrito do sumário do PDF. A única edição é de capitalização
  — sumários em caixa alta viram caixa normal, sem trocar palavra.
- **`resumo`** é redação nossa a partir do texto do capítulo. Três regras
  fecham a porta para o viés: descrever o que o plano **propõe** e nunca se é
  bom, viável ou caro; usar verbo de atribuição (*propõe*, *prevê*) para deixar
  claro de quem é a afirmação; manter extensão semelhante em todas as fichas
  (hoje entre 18 e 44 palavras), porque dar mais espaço a uma candidatura já é
  uma forma de destaque.

O teor exato está no PDF, linkado na mesma seção junto com a ficha no
DivulgaCandContas.

> Das 13 candidaturas, 12 têm plano. O pacote do TSE não inclui plano da
> candidatura de Pablo Marçal; a ficha diz isso explicitamente em vez de deixar
> a seção vazia.

### Posicionamento político

`src/data/espectro.json` classifica o **partido**, nunca a pessoa candidata.

Não existe classificação oficial — o TSE não registra posicionamento
ideológico. Por isso o site nunca afirma onde uma candidatura está: mostra o que
levantamentos identificados publicaram sobre o partido, com nome, ano e link de
cada um, no rótulo original.

As fontes discordam com frequência, e as divergências ficam à vista de
propósito. O PSD aparece como *centro-direita* (Cláudio Couto, 2018), *direita*
(Congresso em Foco, 2019) e *centro* (Valor Econômico, 2025) — mostrar os três
informa mais do que escolher um, e escolher seria emitir opinião.

> Missão e Democrata não aparecem em nenhum levantamento: foram registrados em
> 2025, depois de todos eles. A ficha diz isso em vez de arriscar um palpite.

### Por que não há seção de polêmicas

Foi avaliada e recusada, por duas razões.

A forma pedida — "existem rumores de que…" — é o mecanismo clássico de
difamação por insinuação: dá alcance a uma acusação sem assumi-la, e num site
que existe para publicar só o verificável, seria a única seção sem fonte.

E a versão factual da mesma ideia não sobrevive ao teste de paridade. O pacote
de certidões criminais do TSE traz 87 documentos de Lula, 12 de Zema, 5 de Renan
Santos e nenhum para 8 das 13 candidaturas. Certidão é emitida **por foro**, não
por processo: quem morou e trabalhou em mais jurisdições junta mais papel, quase
todo ele "nada consta". Publicar isso lado a lado mediria número de comarcas
consultadas e seria lido como número de problemas. O arquivo `motivo_cassacao`
de 2026 está vazio para as 13.

### Dados do registro

Nascimento, naturalidade, escolaridade, ocupação e situação do registro vêm do
arquivo oficial de candidaturas:

```
https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip
```

`sqCandidato` é o `SQ_CANDIDATO` do TSE — a chave que permite auditar cada campo
no DivulgaCandContas. A **idade não é armazenada**: é derivada de `nascimento` a
cada render, porque um número escrito à mão envelhece em silêncio.

### Governador e Senador do DF

Nome, número, partido, situação de registro e coligação de Governador vêm
direto da API do DivulgaCandContas do TSE
(`https://divulgacandcontas.tse.jus.br/divulga/#/candidato/CENTROOESTE/DF/20322002026`),
consultada em 10/09/2026. Os suplentes de cada chapa de Senador e o partido
de alguns vices de Governador não estavam confirmáveis nessa consulta e
vieram de imprensa (Senado Notícias, que credita as fotos ao TSE, e Terra) —
por isso um campo ausente no JSON (`vice` sem partido, por exemplo) significa
que nenhuma fonte confirmou aquele dado, nunca que ele foi chutado.

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
- Toda ficha tem as mesmas seções, na mesma ordem, com o retrato na mesma
  largura. O `resumo` tem três parágrafos em todas — formação e ocupação,
  trajetória pública, histórico eleitoral e chapa atual.
- O resumo descreve trajetória verificável: cargos com período, formação,
  eleições disputadas. Não avalia gestões nem descreve posicionamento político —
  o que o candidato defende aparece em **Propostas**, com as palavras dele.
- Os retratos são coloridos, no mesmo enquadramento e no mesmo tamanho. A
  paridade vem do recorte, não de filtro sobre a imagem.
- Bronze (`#8a6a2f`) é o único acento, escolhido por não pertencer a nenhum
  partido brasileiro. Nenhuma cor partidária aparece em lugar nenhum.
- A navegação entre fichas segue a mesma ordem alfabética e não circula: quem
  chega na ponta vê só um lado, em vez de um ciclo que sugeriria sequência.
- Tema claro único, sem variante escura: uma segunda diagramação seria mais um
  lugar onde a paridade entre candidatos poderia quebrar.
- Rótulo ideológico é sempre do partido, sempre atribuído a uma fonte com ano e
  link, e nunca dito na voz do site. Fontes que divergem aparecem todas.
- Resumo de proposta descreve, não avalia, e tem extensão semelhante em todas as
  fichas.
- Campos sem fonte confirmada mostram travessão em vez de estimativa.
- `observacao` descreve andamento processual objetivo (ex.: registro em análise),
  nunca o mérito da candidatura.
