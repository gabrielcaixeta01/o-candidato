# Jornada do eleitor — DF (Presidente, Governador, Senador)

## Contexto

Hoje o site cobre só a candidatura a Presidente. O eleitor do DF também vota
para Governador e Senador (Deputado Federal e Distrital ficam fora deste
corte — envolvem centenas de candidatos cada e exigem um desenho de lista
próprio, a ser tratado depois). O objetivo é dar ao eleitor uma noção
completa de tudo que ele vai votar, sem construir uma página dedicada por
candidato para os cargos além de Presidente — só um resumo breve.

Decisão de escopo: o site fica focado no DF. Não há seletor de estado/cidade
nem abstração para outras UFs — se o projeto crescer para outros estados,
isso é um redesenho futuro, não uma generalização antecipada aqui.

## Fluxo

Wizard de 4 etapas, uma rota por etapa, navegação "anterior/próximo" entre
elas:

1. `/presidente` (= `/`, home atual) — reaproveita a galeria existente de
   candidatos a presidente. Cards continuam linkando para `/candidato/[slug]`,
   inalterado.
2. `/governador` — cards resumidos dos candidatos a Governador do DF.
3. `/senador` — cards resumidos das chapas (titular + suplentes) às vagas de
   Senador do DF em disputa em 2026.
4. `/resumo` — recapitulação: os 4 cargos que o eleitor vai votar, cada um
   com a contagem de candidatos e um card condensado por candidatura, mais um
   lembrete do calendário eleitoral.

O cabeçalho de marca e o `CalendarioEleitoral` (hoje dentro do `Hero`)
aparecem em todas as etapas, via um layout comum. Cada etapa mostra um
indicador textual simples ("Etapa 2 de 4 · Governador") e botões
anterior/próximo ligando as 4 rotas em sequência.

Fora do escopo: nenhuma tela de seleção de estado/cidade. Deputado Federal e
Deputado Distrital ficam de fora deste corte.

## Dados

Novo arquivo `src/data/cargos-df.json`, curado manualmente a partir do TSE
(mesmo processo já usado para presidente — DivulgaCandContas/CKAN, fotos do
Wikimedia quando existirem, versionadas em `public/`):

```json
{
  "atualizadoEm": "2026-09-10",
  "governador": [
    {
      "nome": "...",
      "numero": 45,
      "partido": "...",
      "vice": "Nome (PARTIDO)",
      "coligacao": "...",
      "foto": null,
      "situacaoRegistro": "..."
    }
  ],
  "senador": [
    {
      "nome": "...",
      "numero": 45,
      "partido": "...",
      "suplentes": ["Nome (PARTIDO)", "Nome (PARTIDO)"],
      "foto": null,
      "situacaoRegistro": "..."
    }
  ]
}
```

A coleta em si (baixar dados do TSE, curar fotos e texto) é uma tarefa de
pesquisa/preenchimento de dados no plano de implementação — não uma decisão
de arquitetura. Fica igualmente sujeita às regras editoriais já em vigor no
projeto (ordem alfabética, sem ranking, sem opinião, foto com crédito
obrigatório).

## Tipos (`src/lib/types.ts`)

```ts
/** Cargo distrital sem página dedicada — só o resumo do wizard. */
export interface CandidatoCargo {
  nome: string;
  numero: number;
  partido: string;
  /** Só para governador. */
  vice?: string;
  /** Só para senador; titular + suplentes. */
  suplentes?: string[];
  coligacao?: string;
  foto: CreditoFoto | null;
  situacaoRegistro: string;
}

export interface ArquivoCargosDF {
  atualizadoEm: string;
  governador: CandidatoCargo[];
  senador: CandidatoCargo[];
}
```

`CandidatoCargo` é deliberadamente um subconjunto de `Candidato`: sem `slug`,
`bio`, `resumo`, `planoGoverno`, `nascimento` etc. — campos que só existem
porque há uma página dedicada para consumi-los.

## Funções de acesso (`src/lib/candidatos.ts`)

- `listarGovernadores(): CandidatoCargo[]` — ordem alfabética por `nome`,
  mesma regra do `listarCandidatos()`.
- `listarSenadores(): CandidatoCargo[]` — idem.

## Componentes

- `CargoCard` (novo) — card compacto: `Retrato` (reaproveitado) + nome +
  número + partido, e uma linha extra condicional (vice para governador,
  suplentes para senador).
- `EtapaWizard` (novo, layout) — cabeçalho com indicador de etapa e
  anterior/próximo; usado pelas 4 rotas via um `layout.tsx` compartilhado ou
  componente explícito em cada página.
- `/resumo` reaproveita `CandidatoCard` (presidente) e `CargoCard`
  (governador/senador) em forma condensada, com link de volta para cada
  etapa.

## Testes

- Build (`next build`) com as 4 rotas pré-renderizadas estaticamente, como
  hoje acontece com `/candidato/[slug]`.
- Lint e checagem de tipos.
- Verificação manual no navegador: navegação anterior/próximo entre as 4
  etapas, estado vazio quando `cargos-df.json` não tiver um cargo populado
  (não deve quebrar a build nem mostrar lista vazia sem explicação).
