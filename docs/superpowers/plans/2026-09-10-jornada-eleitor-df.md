# Jornada do eleitor — DF (Governador e Senador) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar ao site "O Candidato" um wizard de 4 etapas (Presidente, Governador, Senador, Resumo) que dá ao eleitor do DF uma visão completa de tudo que ele vota em 2026, com resumos breves (sem página dedicada) para Governador e Senador.

**Architecture:** Next.js App Router com 3 rotas novas (`/governador`, `/senador`, `/resumo`) mais a rota `/` existente (que passa a ser a etapa "Presidente"). Todo conteúdo vem de JSON estático versionado, pré-renderizado no build — mesmo padrão já usado para `/candidato/[slug]`. Um array `ETAPAS` centraliza a ordem/rótulos do wizard; componentes pequenos (`CabecalhoEtapa`, `EtapaIndicador`, `EtapaNav`, `CargoCard`) são reaproveitados pelas 3 páginas novas.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, TypeScript, Tailwind v4, lucide-react. Sem framework de testes (o projeto verifica via `npm run build` + `npm run lint` + checagem manual no navegador — não há Jest/Vitest configurado).

**Spec:** `docs/superpowers/specs/2026-09-10-jornada-eleitor-df-design.md`

## Global Constraints

- Sem página dedicada para Governador/Senador — só o card resumido definido aqui.
- Sem seletor de estado/cidade e sem Deputado Federal/Distrital neste corte (decisão de escopo do spec).
- Todo campo de dado é fato verificável (TSE ou imprensa, nunca inventado) — quando uma fonte não confirma um campo, ele fica ausente (`undefined`), nunca com valor chutado.
- Ordem alfabética sempre, nunca por relevância/ranking — mesma regra já aplicada a `listarCandidatos()`.
- Seguir os tokens de cor e classes utilitárias já existentes (`rotulo`, `acima-do-grao`, `papel-*`, `tinta-*`, `bronze-*`, `font-serif` nos títulos) — não introduzir novos tokens visuais.
- `npm run build` deve continuar pré-renderizando todas as rotas estaticamente (sem rota dinâmica em runtime).

---

## Dados verificados (fonte primária desta task)

Governador e Senador do DF, eleição 2026, consultados na API do DivulgaCandContas do TSE em 10/09/2026 (`https://divulgacandcontas.tse.jus.br/divulga/#/candidato/CENTROOESTE/DF/20322002026`) para nome/número/partido/situação de registro/coligação. Vice de Samara Mineiro e Rico Pinheiro confirmados no TSE (nome, sem partido claro na fonte). Suplentes de Senador e os partidos dos vices de Governador vieram de imprensa (Senado Notícias, com fotos creditadas ao TSE, e Terra) — não conferidos diretamente na API do TSE; ficam documentados como tal no README (Task 8).

---

### Task 1: Tipos e dados de Governador/Senador do DF

**Files:**
- Modify: `src/lib/types.ts` (adicionar ao final do arquivo)
- Create: `src/data/cargos-df.json`
- Modify: `src/lib/candidatos.ts` (adicionar import + 2 funções)

**Interfaces:**
- Produces: `CandidatoCargo` (campos: `nome: string`, `numero: number`, `partido: string`, `vice?: string`, `suplentes?: string[]`, `coligacao?: string`, `situacaoRegistro: string`), `ArquivoCargosDF` (`{ atualizadoEm: string; governador: CandidatoCargo[]; senador: CandidatoCargo[] }`), `listarGovernadores(): CandidatoCargo[]`, `listarSenadores(): CandidatoCargo[]` — usados pelas Tasks 4, 5, 6, 7.

- [ ] **Step 1: Adicionar os tipos em `src/lib/types.ts`**

Adicionar ao final do arquivo (depois de `EventoEleitoral`):

```ts
/**
 * Cargo distrital sem ficha dedicada (Governador, Senador do DF) — só o
 * resumo breve do wizard. Deliberadamente um subconjunto de `Candidato`: sem
 * `slug`, `bio`, `resumo`, `planoGoverno` — campos que só existem porque há
 * uma página própria para consumi-los.
 */
export interface CandidatoCargo {
  /** Nome de urna. */
  nome: string;
  numero: number;
  partido: string;
  /** Só para Governador; formato "Nome (Partido)". Ausente quando o partido
   * do vice não foi confirmado por nenhuma fonte. */
  vice?: string;
  /** Só para Senador: os dois suplentes da chapa, formato "Nome (Partido)". */
  suplentes?: string[];
  /** Nome da coligação/federação, quando houver. Ausente em candidatura isolada. */
  coligacao?: string;
  /** Situação do registro na Justiça Eleitoral, na redação do TSE. */
  situacaoRegistro: string;
}

/** `src/data/cargos-df.json` — candidaturas a Governador e Senador do DF. */
export interface ArquivoCargosDF {
  /** Data (YYYY-MM-DD) da última conferência dos dados na fonte oficial. */
  atualizadoEm: string;
  governador: CandidatoCargo[];
  senador: CandidatoCargo[];
}
```

- [ ] **Step 2: Criar `src/data/cargos-df.json`**

```json
{
  "atualizadoEm": "2026-09-10",
  "governador": [
    {
      "nome": "Arruda",
      "numero": 55,
      "partido": "PSD",
      "vice": "Luiz Pitiman (PSD)",
      "coligacao": "Resgatar Brasília (PSD/Avante)",
      "situacaoRegistro": "Indeferido em prazo recursal ou com recurso"
    },
    {
      "nome": "Cappelli",
      "numero": 40,
      "partido": "PSB",
      "vice": "Sofia Carvalho (PSB)",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Celina Leão",
      "numero": 11,
      "partido": "PP",
      "vice": "Gustavo Rocha (PP)",
      "coligacao": "Propósito e Ação (Republicanos/MDB/Podemos/PL/DC/Mobiliza/Democrata/PRD-Solidariedade/União-PP)",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Elisson",
      "numero": 36,
      "partido": "Agir",
      "vice": "Subtenente Sergio Prado (Agir)",
      "situacaoRegistro": "Aguardando julgamento"
    },
    {
      "nome": "Expedito Mendonça",
      "numero": 29,
      "partido": "PCO",
      "vice": "Valmir Barbosa (PCO)",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Kiko Caputo",
      "numero": 30,
      "partido": "Novo",
      "vice": "Delegado Rafael Sampaio (Novo)",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Leandro Grass",
      "numero": 13,
      "partido": "PT",
      "vice": "Dora Gomes (PV)",
      "coligacao": "DF do Povo",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Paula Belmonte",
      "numero": 45,
      "partido": "PSDB",
      "vice": "Juiz Everardo Ribeiro (PSDB)",
      "coligacao": "Federação PSDB Cidadania",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Professor Robson",
      "numero": 16,
      "partido": "PSTU",
      "vice": "Guillen (PSTU)",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Professora Samara Mineiro",
      "numero": 80,
      "partido": "UP",
      "vice": "Thaís Oliveira",
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Rico Pinheiro",
      "numero": 28,
      "partido": "PRTB",
      "vice": "Cristiane Barros",
      "situacaoRegistro": "Aguardando julgamento"
    }
  ],
  "senador": [
    {
      "nome": "Avenir Rosa",
      "numero": 355,
      "partido": "Democrata",
      "suplentes": ["Marco Aurélio (Democrata)", "Sebastião Geronimo (Democrata)"],
      "situacaoRegistro": "Indeferido em prazo recursal ou com recurso"
    },
    {
      "nome": "Bia Kicis",
      "numero": 223,
      "partido": "PL",
      "suplentes": ["Samuel Kicis (PL)", "Renato Figueiredo (PL)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "David Horn",
      "numero": 290,
      "partido": "PCO",
      "suplentes": ["Mauro Sousa (PCO)", "Ricardo Machado (PCO)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Erika Kokay",
      "numero": 131,
      "partido": "PT",
      "suplentes": ["Giulia Tadini (PSOL)", "Samuel Domingues (PT)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Guto Felício dos Santos",
      "numero": 456,
      "partido": "PSDB",
      "suplentes": ["Luciana Loureiro (PSDB)", "Professor Tatá (PSDB)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Leila do Vôlei",
      "numero": 123,
      "partido": "PDT",
      "suplentes": ["Raphael Sodré (Rede)", "Tetê Monteiro (PSOL)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Marley",
      "numero": 700,
      "partido": "Avante",
      "suplentes": ["Diego (Avante)", "Coronel Leite (Avante)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Michelle Bolsonaro",
      "numero": 222,
      "partido": "PL",
      "suplentes": ["Diego Torres (PL)", "Cristian Viana (Podemos)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Professor Guilherme Amorim",
      "numero": 800,
      "partido": "UP",
      "suplentes": ["Tadeu Toniatti (UP)", "Ivone Mineiro (UP)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Ronaldo Fonseca",
      "numero": 555,
      "partido": "PSD",
      "suplentes": ["Professora Eunice Santos (PSD)", "Dr. Antonio (PSD)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Sebastião Coelho",
      "numero": 300,
      "partido": "Novo",
      "suplentes": ["Ibi Batista (Novo)", "Coronel Leonardo (Novo)"],
      "situacaoRegistro": "Deferido"
    },
    {
      "nome": "Tiago",
      "numero": 360,
      "partido": "Agir",
      "suplentes": ["2º Sgt. Thiago Melo (Agir)", "1º Sgt. Alexandre (Agir)"],
      "situacaoRegistro": "Aguardando julgamento"
    },
    {
      "nome": "Zanata",
      "numero": 161,
      "partido": "PSTU",
      "suplentes": ["Edson Da Silva (PSTU)", "Renato (PSTU)"],
      "situacaoRegistro": "Deferido"
    }
  ]
}
```

- [ ] **Step 3: Adicionar as funções de acesso em `src/lib/candidatos.ts`**

No topo do arquivo, junto aos outros imports de dados:

```ts
import cargosDfData from "@/data/cargos-df.json";
```

E no bloco de imports de tipos, adicionar `ArquivoCargosDF` e `CandidatoCargo` à lista já existente vinda de `@/lib/types`.

No final do arquivo:

```ts
/** Candidatos a Governador do DF, em ordem alfabética pelo nome de urna. */
export function listarGovernadores(): CandidatoCargo[] {
  return [...(cargosDfData as ArquivoCargosDF).governador].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

/** Candidatos a Senador do DF, em ordem alfabética pelo nome de urna. */
export function listarSenadores(): CandidatoCargo[] {
  return [...(cargosDfData as ArquivoCargosDF).senador].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
}
```

- [ ] **Step 4: Verificar tipos e build**

Run: `npm run build`
Expected: build conclui sem erros de tipo (as duas novas funções ainda não são usadas por nenhuma página, então não há erro de "unused" em TS/Next — apenas confirme que não há erro de compilação nos arquivos tocados).

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/data/cargos-df.json src/lib/candidatos.ts
git commit -m "$(cat <<'EOF'
feat(dados): candidaturas a Governador e Senador do DF em 2026

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Modelo das etapas e navegação do wizard

**Files:**
- Create: `src/lib/etapas.ts`
- Create: `src/components/EtapaNav.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: `Etapa` (tipo, campos `slug: "presidente" | "governador" | "senador" | "resumo"`, `href: string`, `rotulo: string`), `ETAPAS: Etapa[]`, `EtapaIndicador({ atual }: { atual: Etapa["slug"] })`, `EtapaNav({ atual }: { atual: Etapa["slug"] })` — usados pelas Tasks 3, 4 (indiretamente via CabecalhoEtapa) e pelas páginas das Tasks 5, 6, 7 e pelo `page.tsx`/`Hero.tsx` da Task 8.

- [ ] **Step 1: Criar `src/lib/etapas.ts`**

```ts
/**
 * As 4 etapas da jornada do eleitor do DF, na ordem em que aparecem.
 *
 * Fixas e conhecidas de propósito — não é uma lista genérica para outros
 * estados/cargos, então não há necessidade de configuração externa.
 */
export interface Etapa {
  slug: "presidente" | "governador" | "senador" | "resumo";
  href: string;
  rotulo: string;
}

export const ETAPAS: Etapa[] = [
  { slug: "presidente", href: "/", rotulo: "Presidente" },
  { slug: "governador", href: "/governador", rotulo: "Governador" },
  { slug: "senador", href: "/senador", rotulo: "Senador" },
  { slug: "resumo", href: "/resumo", rotulo: "Resumo" },
];
```

- [ ] **Step 2: Criar `src/components/EtapaNav.tsx`**

```tsx
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ETAPAS } from "@/lib/etapas";
import type { Etapa } from "@/lib/etapas";

/** "Etapa 2 de 4 · Governador" — contexto de onde o eleitor está no wizard. */
export function EtapaIndicador({ atual }: { atual: Etapa["slug"] }) {
  const indice = ETAPAS.findIndex((e) => e.slug === atual);

  return (
    <p className="rotulo text-bronze-500">
      Etapa {indice + 1} de {ETAPAS.length} · {ETAPAS[indice].rotulo}
    </p>
  );
}

/**
 * Anterior/próximo entre as etapas do wizard. Mesmo padrão visual da
 * navegação entre fichas de candidato (`Vizinhos`, em
 * `src/app/candidato/[slug]/page.tsx`), generalizado para as 4 etapas fixas
 * em vez de uma lista de candidatos.
 */
export function EtapaNav({ atual }: { atual: Etapa["slug"] }) {
  const indice = ETAPAS.findIndex((e) => e.slug === atual);
  const anterior = indice > 0 ? ETAPAS[indice - 1] : null;
  const proximo = indice < ETAPAS.length - 1 ? ETAPAS[indice + 1] : null;

  if (!anterior && !proximo) return null;

  return (
    <nav
      aria-label="Etapas da jornada do eleitor"
      className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {anterior ? <SetaEtapa etapa={anterior} sentido="anterior" /> : <span />}
      {proximo && <SetaEtapa etapa={proximo} sentido="proximo" />}
    </nav>
  );
}

function SetaEtapa({
  etapa,
  sentido,
}: {
  etapa: Etapa;
  sentido: "anterior" | "proximo";
}) {
  const ehProximo = sentido === "proximo";
  const Icone = ehProximo ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={etapa.href}
      className={`group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition hover:border-papel-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500 ${
        ehProximo ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <Icone
        className="size-4 shrink-0 text-tinta-400 transition group-hover:text-bronze-500"
        aria-hidden
      />
      <span className="flex min-w-0 flex-col">
        <span className="rotulo text-tinta-400">
          {ehProximo ? "Próxima etapa" : "Etapa anterior"}
        </span>
        <span className="truncate font-serif text-lg text-tinta-900">
          {etapa.rotulo}
        </span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros (os dois módulos ainda não são importados em nenhuma página — confirme apenas que compilam).

- [ ] **Step 4: Commit**

```bash
git add src/lib/etapas.ts src/components/EtapaNav.tsx
git commit -m "$(cat <<'EOF'
feat: modelo das etapas e navegação do wizard do eleitor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Cabeçalho compartilhado das etapas

**Files:**
- Create: `src/components/CabecalhoEtapa.tsx`

**Interfaces:**
- Consumes: `EtapaIndicador` e `Etapa` de `@/components/EtapaNav` e `@/lib/etapas` (Task 2).
- Produces: `CabecalhoEtapa({ atual, titulo, descricao }: { atual: Etapa["slug"]; titulo: string; descricao: string })` — usado pelas Tasks 5, 6, 7.

- [ ] **Step 1: Criar `src/components/CabecalhoEtapa.tsx`**

```tsx
import Link from "next/link";
import { EtapaIndicador } from "@/components/EtapaNav";
import type { Etapa } from "@/lib/etapas";

/**
 * Cabeçalho das etapas Governador, Senador e Resumo — mesma estrutura visual
 * do `Hero` da home (marca, indicador de etapa, título, descrição), sem
 * repetir o calendário eleitoral em toda etapa.
 */
export function CabecalhoEtapa({
  atual,
  titulo,
  descricao,
}: {
  atual: Etapa["slug"];
  titulo: string;
  descricao: string;
}) {
  return (
    <header className="acima-do-grao mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-16">
      <Link
        href="/"
        className="mb-6 flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
      >
        <span aria-hidden className="h-px w-8 bg-bronze-500/50 sm:w-12" />
        <span className="rotulo text-bronze-500">O Candidato</span>
      </Link>

      <EtapaIndicador atual={atual} />

      <h1 className="mt-3 max-w-3xl font-serif text-[2.125rem] leading-[1.08] tracking-[-0.015em] text-balance text-tinta-900 sm:text-5xl lg:text-[3.75rem]">
        {titulo}
      </h1>

      <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-tinta-500 sm:mt-6 sm:text-base">
        {descricao}
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/CabecalhoEtapa.tsx
git commit -m "$(cat <<'EOF'
feat: cabeçalho compartilhado das etapas do wizard

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Card resumido de cargo (`CargoCard`)

**Files:**
- Create: `src/components/CargoCard.tsx`

**Interfaces:**
- Consumes: `CandidatoCargo` de `@/lib/types` (Task 1), `iniciaisDe` de `@/lib/candidatos` (já existe no arquivo).
- Produces: `CargoCard({ candidato, linhaSecundaria }: { candidato: CandidatoCargo; linhaSecundaria?: string })` — usado pelas Tasks 5 e 6.

- [ ] **Step 1: Criar `src/components/CargoCard.tsx`**

```tsx
import { iniciaisDe } from "@/lib/candidatos";
import type { CandidatoCargo } from "@/lib/types";

/**
 * Card resumido para cargos sem ficha dedicada (Governador, Senador).
 *
 * Mesma diagramação para todos os candidatos do cargo. Sempre usa o
 * placeholder de iniciais — não há curadoria de fotos para além de
 * Presidente neste corte — para não misturar candidaturas com e sem foto na
 * mesma grade.
 */
export function CargoCard({
  candidato,
  linhaSecundaria,
}: {
  candidato: CandidatoCargo;
  /** Ex.: "Vice: Fulano (PT)" ou "Suplentes: Fulano (PT), Beltrana (PV)". */
  linhaSecundaria?: string;
}) {
  const { nome, partido, numero, situacaoRegistro } = candidato;

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden bg-linear-to-br from-papel-200 to-papel-400">
        <span
          aria-hidden
          className="font-serif text-5xl text-bronze-500/30 select-none sm:text-6xl"
        >
          {iniciaisDe(nome)}
        </span>

        <span className="absolute top-3 right-3 rounded-lg bg-bronze-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-white shadow-sm">
          {numero}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="rotulo text-bronze-500">{partido}</span>

        <h3 className="font-serif text-xl leading-tight text-tinta-900">
          {nome}
        </h3>

        {linhaSecundaria && (
          <p className="text-sm leading-relaxed text-tinta-500">
            {linhaSecundaria}
          </p>
        )}

        <p className="mt-auto pt-2 text-xs text-tinta-400">
          {situacaoRegistro}
        </p>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/CargoCard.tsx
git commit -m "$(cat <<'EOF'
feat: card resumido para candidatos sem ficha dedicada

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Página `/governador`

**Files:**
- Create: `src/app/governador/page.tsx`

**Interfaces:**
- Consumes: `listarGovernadores`, `lerNoticias` de `@/lib/candidatos` (Task 1 e já existente), `CabecalhoEtapa` (Task 3), `CargoCard` (Task 4), `EtapaNav` (Task 2), `Rodape` (já existente).

- [ ] **Step 1: Criar `src/app/governador/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CabecalhoEtapa } from "@/components/CabecalhoEtapa";
import { CargoCard } from "@/components/CargoCard";
import { EtapaNav } from "@/components/EtapaNav";
import { Rodape } from "@/components/Rodape";
import { lerNoticias, listarGovernadores } from "@/lib/candidatos";

export const metadata: Metadata = {
  title: "Governador do DF em 2026 — O Candidato",
  description:
    "Quem disputa o Governo do Distrito Federal em 2026, em ordem alfabética e com o registro oficial no TSE.",
};

export default function PaginaGovernador() {
  const candidatos = listarGovernadores();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <CabecalhoEtapa
        atual="governador"
        titulo="Quem disputa o Governo do DF em 2026"
        descricao={`${candidatos.length} candidaturas registradas no TSE para o Governo do Distrito Federal, em ordem alfabética. Sem ranking e sem opinião — só o registro oficial.`}
      />

      <section
        aria-labelledby="titulo-governador"
        className="acima-do-grao mx-auto w-full max-w-6xl px-5 pb-12 sm:px-6"
      >
        <h2 id="titulo-governador" className="sr-only">
          Candidatos a Governador do DF
        </h2>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {candidatos.map((candidato) => (
            <li key={candidato.nome} className="flex">
              <CargoCard
                candidato={candidato}
                linhaSecundaria={
                  candidato.vice ? `Vice: ${candidato.vice}` : undefined
                }
              />
            </li>
          ))}
        </ul>

        <EtapaNav atual="governador" />
      </section>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
```

- [ ] **Step 2: Rodar o dev server e verificar visualmente**

Run: `npm run dev`
Abrir `http://localhost:3000/governador` no navegador e conferir:
- 11 cards aparecem em ordem alfabética.
- Cada card mostra iniciais, número, partido, nome, "Vice: ..." e a situação do registro.
- O link "Etapa anterior" leva a `/` e "Próxima etapa" leva a `/senador` (a rota ainda não existe — 404 esperado até a Task 6).

Parar o dev server depois de conferir.

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: `/governador` aparece na lista de rotas pré-renderizadas do build, sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/app/governador/page.tsx
git commit -m "$(cat <<'EOF'
feat: etapa Governador do wizard do eleitor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Página `/senador`

**Files:**
- Create: `src/app/senador/page.tsx`

**Interfaces:**
- Consumes: `listarSenadores`, `lerNoticias` de `@/lib/candidatos`, `CabecalhoEtapa`, `CargoCard`, `EtapaNav`, `Rodape` — mesmas de Task 5.

- [ ] **Step 1: Criar `src/app/senador/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CabecalhoEtapa } from "@/components/CabecalhoEtapa";
import { CargoCard } from "@/components/CargoCard";
import { EtapaNav } from "@/components/EtapaNav";
import { Rodape } from "@/components/Rodape";
import { lerNoticias, listarSenadores } from "@/lib/candidatos";

export const metadata: Metadata = {
  title: "Senador pelo DF em 2026 — O Candidato",
  description:
    "Quem disputa as vagas de Senador pelo Distrito Federal em 2026, em ordem alfabética e com o registro oficial no TSE.",
};

export default function PaginaSenador() {
  const candidatos = listarSenadores();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <CabecalhoEtapa
        atual="senador"
        titulo="Quem disputa o Senado pelo DF em 2026"
        descricao={`${candidatos.length} candidaturas disputam as 2 vagas de Senador pelo Distrito Federal em 2026, em ordem alfabética. Cada chapa tem 2 suplentes, que assumem o mandato se o titular se afastar.`}
      />

      <section
        aria-labelledby="titulo-senador"
        className="acima-do-grao mx-auto w-full max-w-6xl px-5 pb-12 sm:px-6"
      >
        <h2 id="titulo-senador" className="sr-only">
          Candidatos a Senador pelo DF
        </h2>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {candidatos.map((candidato) => (
            <li key={candidato.nome} className="flex">
              <CargoCard
                candidato={candidato}
                linhaSecundaria={
                  candidato.suplentes
                    ? `Suplentes: ${candidato.suplentes.join(", ")}`
                    : undefined
                }
              />
            </li>
          ))}
        </ul>

        <EtapaNav atual="senador" />
      </section>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
```

- [ ] **Step 2: Rodar o dev server e verificar visualmente**

Run: `npm run dev`
Abrir `http://localhost:3000/senador` e conferir:
- 13 cards em ordem alfabética, cada um com a linha "Suplentes: ...".
- "Etapa anterior" leva a `/governador`, "Próxima etapa" leva a `/resumo` (404 esperado até a Task 7).

Parar o dev server.

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: `/senador` pré-renderizada, sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/app/senador/page.tsx
git commit -m "$(cat <<'EOF'
feat: etapa Senador do wizard do eleitor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Página `/resumo`

**Files:**
- Create: `src/app/resumo/page.tsx`

**Interfaces:**
- Consumes: `listarCandidatos`, `listarGovernadores`, `listarSenadores`, `lerNoticias` de `@/lib/candidatos`, `CabecalhoEtapa`, `EtapaNav`, `Rodape`.

- [ ] **Step 1: Criar `src/app/resumo/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoEtapa } from "@/components/CabecalhoEtapa";
import { EtapaNav } from "@/components/EtapaNav";
import { Rodape } from "@/components/Rodape";
import {
  lerNoticias,
  listarCandidatos,
  listarGovernadores,
  listarSenadores,
} from "@/lib/candidatos";

export const metadata: Metadata = {
  title: "O que você vai votar no DF em 2026 — O Candidato",
  description:
    "Presidente, Governador e Senador: os cargos em disputa na urna do eleitor do Distrito Federal em 2026.",
};

interface ItemResumo {
  nome: string;
  partido: string;
  numero: number;
}

export default function PaginaResumo() {
  const presidente: ItemResumo[] = listarCandidatos();
  const governador: ItemResumo[] = listarGovernadores();
  const senador: ItemResumo[] = listarSenadores();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <CabecalhoEtapa
        atual="resumo"
        titulo="O que você vai votar no DF em 2026"
        descricao="Os cargos em disputa que aparecem na sua urna, com o total de candidaturas registradas em cada um."
      />

      <section className="acima-do-grao mx-auto w-full max-w-3xl px-5 pb-16 sm:px-6">
        <SecaoResumo titulo="Presidente" href="/" itens={presidente} />
        <SecaoResumo titulo="Governador" href="/governador" itens={governador} />
        <SecaoResumo titulo="Senador" href="/senador" itens={senador} />

        <EtapaNav atual="resumo" />
      </section>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}

function SecaoResumo({
  titulo,
  href,
  itens,
}: {
  titulo: string;
  href: string;
  itens: ItemResumo[];
}) {
  return (
    <section
      aria-labelledby={`titulo-resumo-${titulo}`}
      className="flex flex-col gap-4 border-b border-border/70 py-8 first:pt-0 last:border-0"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id={`titulo-resumo-${titulo}`}
          className="font-serif text-2xl text-tinta-900"
        >
          {titulo}
        </h2>
        <Link
          href={href}
          className="rotulo shrink-0 text-bronze-500 underline decoration-dotted underline-offset-4 hover:text-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
        >
          Ver todos
        </Link>
      </div>

      <p className="rotulo text-tinta-400">
        {itens.length} {itens.length === 1 ? "candidatura" : "candidaturas"}
      </p>

      <ul className="flex flex-col gap-2">
        {itens.map((item) => (
          <li
            key={item.nome}
            className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 text-sm text-tinta-700 last:border-0"
          >
            <span className="truncate">{item.nome}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-tinta-400">
              {item.numero} · {item.partido}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Rodar o dev server e verificar visualmente**

Run: `npm run dev`
Abrir `http://localhost:3000/resumo` e conferir:
- 3 seções (Presidente 13, Governador 11, Senador 13), cada uma com a lista de nome + número + partido e um link "Ver todos" para a rota certa.
- "Etapa anterior" leva a `/senador`; não há "próxima etapa" (Resumo é a última — só a seta anterior deve aparecer).

Parar o dev server.

- [ ] **Step 3: Lint e build**

Run: `npm run lint && npm run build`
Expected: `/resumo` pré-renderizada, sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/app/resumo/page.tsx
git commit -m "$(cat <<'EOF'
feat: etapa de resumo do wizard do eleitor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Ligar a home ao wizard

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `EtapaIndicador`, `EtapaNav` de `@/components/EtapaNav` (Task 2).

- [ ] **Step 1: Adicionar o indicador de etapa ao `Hero`**

Em `src/components/Hero.tsx`, adicionar o import e a linha do indicador logo antes do `<h1>`:

```tsx
import { CalendarioEleitoral } from "@/components/CalendarioEleitoral";
import { EtapaIndicador } from "@/components/EtapaNav";
import type { EventoEleitoral } from "@/lib/types";

export function Hero({
  calendario,
  totalCandidaturas,
}: {
  calendario: EventoEleitoral[];
  totalCandidaturas: number;
}) {
  return (
    <header className="acima-do-grao mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-16">
      {/* Marca: placa institucional, não logotipo de campanha. */}
      <div className="mb-10 flex items-center gap-3 sm:mb-14">
        <span
          aria-hidden
          className="h-px w-8 bg-bronze-500/50 sm:w-12"
        />
        <p className="rotulo text-bronze-500">O Candidato</p>
      </div>

      <EtapaIndicador atual="presidente" />

      <h1 className="mt-3 max-w-3xl font-serif text-[2.125rem] leading-[1.08] tracking-[-0.015em] text-balance text-tinta-900 sm:text-5xl lg:text-[3.75rem]">
        Quem disputa a Presidência em{" "}
        <span className="text-bronze-500">2026</span>
      </h1>

      <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-pretty text-tinta-500 sm:mt-6 sm:text-base">
        As {totalCandidaturas} candidaturas registradas no TSE, em ordem
        alfabética e com a mesma diagramação. Cada ficha traz o registro
        oficial, os capítulos do plano de governo nas palavras do próprio
        candidato e manchetes com link para a fonte. Sem análise, sem ranking e
        sem opinião.
      </p>

      <CalendarioEleitoral eventos={calendario} />
    </header>
  );
}
```

(A única mudança de fato é a linha `<EtapaIndicador atual="presidente" />` e o `mt-3` acrescentado à classe do `<h1>` para o espaçamento em relação a ela — o resto do arquivo permanece igual.)

- [ ] **Step 2: Adicionar a navegação de etapa em `src/app/page.tsx`**

```tsx
import { EtapaNav } from "@/components/EtapaNav";
import { Galeria } from "@/components/Galeria";
import { Hero } from "@/components/Hero";
import { Rodape } from "@/components/Rodape";
import {
  lerNoticias,
  listarCalendario,
  listarCandidatos,
} from "@/lib/candidatos";

export default function Home() {
  // Tudo vem de JSON versionado no repositório: a página é estática e o
  // conteúdo muda quando o cron semanal commita novos dados.
  const candidatos = listarCandidatos();
  const calendario = listarCalendario();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <Hero calendario={calendario} totalCandidaturas={candidatos.length} />
      <Galeria candidatos={candidatos} />

      <div className="acima-do-grao mx-auto w-full max-w-6xl px-5 sm:px-6">
        <EtapaNav atual="presidente" />
      </div>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
```

- [ ] **Step 3: Rodar o dev server e verificar visualmente**

Run: `npm run dev`
Abrir `http://localhost:3000/` e conferir:
- O indicador "Etapa 1 de 4 · Presidente" aparece acima do título.
- Depois da galeria de presidenciáveis, um card "Próxima etapa · Governador" leva a `/governador`.
- Não há seta "anterior" na home (é a primeira etapa).
- Navegar pelas 4 etapas de ponta a ponta (`/` → `/governador` → `/senador` → `/resumo` → volta pra `/`) usando só os botões anterior/próximo.

Parar o dev server.

- [ ] **Step 4: Lint e build**

Run: `npm run lint && npm run build`
Expected: sem erros; as 4 rotas do wizard (`/`, `/governador`, `/senador`, `/resumo`) e as 13 fichas de candidato aparecem pré-renderizadas na saída do build.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.tsx src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat: liga a home ao wizard da jornada do eleitor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Documentar no README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Nenhuma — só documentação.

- [ ] **Step 1: Atualizar a tabela de rotas na seção "Estrutura"**

Substituir a tabela atual:

```markdown
| Rota | O que é |
| --- | --- |
| `/` | Hero, calendário eleitoral, busca e galeria das 13 candidaturas — etapa 1 de 4 (Presidente) da jornada do eleitor |
| `/candidato/[slug]` | Ficha completa, uma por candidatura, pré-renderizada no build |
| `/governador` | Etapa 2 de 4: resumo das candidaturas a Governador do DF (sem ficha dedicada) |
| `/senador` | Etapa 3 de 4: resumo das candidaturas a Senador pelo DF (sem ficha dedicada) |
| `/resumo` | Etapa 4 de 4: recapitulação dos 4 cargos que o eleitor do DF vota em 2026 |
```

Logo abaixo, adicionar um parágrafo:

```markdown
As quatro rotas formam um wizard com navegação "etapa anterior/próxima"
(`src/lib/etapas.ts`, `src/components/EtapaNav.tsx`). Governador e Senador
mostram só nome, número, partido, situação do registro e vice/suplentes —
não têm ficha própria como Presidente. O corte é só o Distrito Federal: não
há seletor de estado/cidade, e Deputado Federal e Deputado Distrital ficam
de fora (centenas de candidatos cada, exigem um desenho de lista à parte).
```

- [ ] **Step 2: Atualizar a tabela de dados na seção "Dados"**

Adicionar uma linha:

```markdown
| `src/data/cargos-df.json` | Registros do TSE (Governador) + imprensa (suplentes de Senador e parte dos vices) | à mão |
```

- [ ] **Step 3: Adicionar uma subseção sobre a fonte de `cargos-df.json`**

Logo após a subseção "### Dados do registro", adicionar:

```markdown
### Governador e Senador do DF

Nome, número, partido, situação de registro e coligação de Governador vêm
direto da API do DivulgaCandContas do TSE
(`https://divulgacandcontas.tse.jus.br/divulga/#/candidato/CENTROOESTE/DF/20322002026`),
consultada em 10/09/2026. Os suplentes de cada chapa de Senador e o partido
de alguns vices de Governador não estavam confirmáveis nessa consulta e
vieram de imprensa (Senado Notícias, que credita as fotos ao TSE, e Terra) —
por isso um campo ausente no JSON (`vice` sem partido, por exemplo) significa
que nenhuma fonte confirmou aquele dado, nunca que ele foi chutado.
```

- [ ] **Step 4: Revisar o arquivo renderizado**

Run: `cat README.md | head -60`
Expected: as três edições aparecem coerentes com o resto do documento (mesmo tom, mesma formatação de tabela).

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: documenta o wizard do eleitor e a fonte de cargos-df.json

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
