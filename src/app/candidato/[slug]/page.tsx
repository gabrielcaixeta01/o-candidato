import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { CreditoFotoLinha, Retrato } from "@/components/Retrato";
import { Espectro } from "@/components/Espectro";
import { Rodape } from "@/components/Rodape";
import {
  candidatoPorSlug,
  espectroDe,
  formatarData,
  fontesEspectro,
  idadeDe,
  lerNoticias,
  listarCandidatos,
  noticiasDo,
  propostasDe,
  vizinhosDe,
} from "@/lib/candidatos";
import type { Candidato, Noticia, Proposta } from "@/lib/types";

// As 13 fichas são pré-renderizadas no build. Não há rota dinâmica em
// produção: o conteúdo só muda quando o JSON muda.
export function generateStaticParams() {
  return listarCandidatos().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/candidato/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const candidato = candidatoPorSlug(slug);
  if (!candidato) return {};

  const titulo = `${candidato.nome} (${candidato.partido}, ${candidato.numero}) — O Candidato`;
  return {
    title: titulo,
    description: candidato.bio,
    openGraph: { title: titulo, description: candidato.bio, type: "profile" },
  };
}

export default async function PaginaCandidato(
  props: PageProps<"/candidato/[slug]">,
) {
  const { slug } = await props.params;
  const candidato = candidatoPorSlug(slug);
  if (!candidato) notFound();

  const noticias = noticiasDo(candidato);
  const propostas = propostasDe(candidato);
  const classificacoes = espectroDe(candidato);
  const { fontes, compilacao } = fontesEspectro();
  const { atualizadoEm } = lerNoticias();
  const { anterior, proximo } = vizinhosDe(candidato);

  return (
    <>
      <article className="acima-do-grao mx-auto w-full max-w-5xl px-5 pt-6 pb-16 sm:px-6 sm:pt-10 sm:pb-24">
        {/* Marca à esquerda e volta à direita: a ficha precisa se identificar
            como parte do site para quem chega direto por link ou busca. */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
          >
            <span aria-hidden className="h-px w-6 bg-bronze-500/50 sm:w-10" />
            <span className="rotulo text-bronze-500">O Candidato</span>
          </Link>

          <Link
            href="/#candidatos"
            className="inline-flex items-center gap-2 rounded-lg py-2 text-sm text-tinta-500 transition hover:text-bronze-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Todas as candidaturas
          </Link>
        </div>

        <Cabecalho candidato={candidato} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
          <div className="flex flex-col gap-12">
            <Secao id="resumo" titulo="Quem é">
              <div className="flex flex-col gap-4 text-[0.9375rem] leading-relaxed text-tinta-700 sm:text-base">
                {candidato.resumo.map((paragrafo) => (
                  <p key={paragrafo.slice(0, 40)}>{paragrafo}</p>
                ))}
              </div>
            </Secao>

            <Secao
              id="espectro"
              titulo="Posicionamento"
              nota={`Como levantamentos independentes classificam o ${candidato.partido}`}
            >
              <Espectro
                classificacoes={classificacoes}
                partido={candidato.partido}
                fontes={fontes}
                compilacao={compilacao}
              />
            </Secao>

            <Secao
              id="propostas"
              titulo="Propostas"
              nota="Capítulos do plano de governo registrado na Justiça Eleitoral"
            >
              <Propostas candidato={candidato} propostas={propostas} />
            </Secao>

            <Secao id="noticias" titulo="Notícias recentes">
              <Noticias noticias={noticias} nome={candidato.nome} />
            </Secao>
          </div>

          <FichaTecnica candidato={candidato} />
        </div>

        <Vizinhos anterior={anterior} proximo={proximo} />
      </article>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}

/* ---------------------------------------------------------------- cabeçalho */

function Cabecalho({ candidato }: { candidato: Candidato }) {
  const { nome, nomeCompleto, partido, numero, vice } = candidato;

  return (
    <header className="mt-6 flex flex-col gap-7 sm:mt-8 sm:flex-row sm:items-end sm:gap-9">
      {/* Largura fixa: o retrato ocupa o mesmo espaço em todas as fichas,
          independentemente do tamanho do nome ou da quantidade de texto. */}
      <div className="w-40 shrink-0 overflow-hidden rounded-2xl border border-border shadow-sm sm:w-52">
        <Retrato
          candidato={candidato}
          prioridade
          sizes="(min-width: 640px) 13rem, 10rem"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-bronze-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-white">
            {numero}
          </span>
          <span className="rotulo text-bronze-500">{partido}</span>
        </div>

        <h1 className="font-serif text-[2rem] leading-[1.1] text-tinta-900 sm:text-5xl">
          {nome}
        </h1>

        {nomeCompleto && nomeCompleto !== nome && (
          <p className="text-sm text-tinta-500">
            Nome civil: <span className="text-tinta-700">{nomeCompleto}</span>
          </p>
        )}

        <p className="text-sm text-tinta-500">
          Candidato a vice: <span className="text-tinta-700">{vice}</span>
        </p>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ propostas */

/**
 * Capítulos do plano registrado, com resumo do que cada um propõe.
 *
 * O título é transcrito do sumário do PDF; o resumo é redigido por nós e
 * descreve o que o plano propõe, sem avaliar se é bom, viável ou caro. Todo
 * resumo usa verbo de atribuição ("propõe", "prevê"), para que fique claro de
 * quem é a afirmação, e tem extensão semelhante em todas as fichas — dar mais
 * espaço a uma candidatura já seria uma forma de destaque.
 */
function Propostas({
  candidato,
  propostas,
}: {
  candidato: Candidato;
  propostas: Proposta[];
}) {
  const { planoGoverno, sqCandidato } = candidato;

  if (propostas.length === 0 && !planoGoverno) {
    return (
      <div className="flex flex-col gap-4">
        <Vazio>
          Não consta plano de governo desta candidatura no pacote de propostas
          publicado pelo TSE. Sem o documento, não há proposta registrada a
          resumir.
        </Vazio>
        <LinkTse sq={sqCandidato} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col">
        {propostas.map((proposta, i) => (
          <li
            key={proposta.titulo}
            className="flex gap-3.5 border-b border-border/70 py-4 first:pt-0 last:border-0 sm:gap-4"
          >
            <span
              aria-hidden
              className="mt-0.5 w-5 shrink-0 text-right font-mono text-xs tabular-nums text-bronze-500/70"
            >
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="text-[0.9375rem] leading-snug font-medium text-tinta-900">
                {proposta.titulo}
              </h3>
              <p className="text-sm leading-relaxed text-tinta-500">
                {proposta.resumo}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs leading-relaxed text-tinta-400">
        Títulos transcritos do sumário do plano. Os resumos são redação de O
        Candidato a partir do texto de cada capítulo e descrevem o que o
        documento propõe, sem avaliá-lo. O teor exato está no PDF.
      </p>

      {planoGoverno && (
        <div className="flex flex-col gap-3">
          <a
            href={planoGoverno.arquivo}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-start gap-3 rounded-xl border border-border bg-papel-100 px-4 py-3.5 transition hover:border-bronze-500/50 hover:bg-papel-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
          >
            <FileText
              className="mt-0.5 size-5 shrink-0 text-bronze-500"
              aria-hidden
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[0.9375rem] font-medium text-tinta-900">
                {planoGoverno.titulo ?? "Plano de governo registrado no TSE"}
              </span>
              <span className="text-xs text-tinta-500">
                PDF · {planoGoverno.paginas}{" "}
                {planoGoverno.paginas === 1 ? "página" : "páginas"} · documento
                oficial protocolado na Justiça Eleitoral
              </span>
            </span>
          </a>
          <LinkTse sq={sqCandidato} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- notícias */

/**
 * Só manchete, veículo, data e link. O texto da matéria nunca é reproduzido —
 * a leitura acontece no site do veículo original.
 */
function Noticias({ noticias, nome }: { noticias: Noticia[]; nome: string }) {
  if (noticias.length === 0) {
    return <Vazio>Nenhuma manchete recente registrada para {nome}.</Vazio>;
  }

  return (
    <ul className="flex flex-col">
      {noticias.map((noticia) => (
        <li key={noticia.url} className="border-b border-border/70 last:border-0">
          <a
            href={noticia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1.5 py-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
          >
            <span className="text-[0.9375rem] leading-snug text-tinta-900 transition group-hover:text-bronze-600">
              {noticia.titulo}
            </span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-tinta-500">
              <span className="rotulo text-bronze-500">{noticia.fonte}</span>
              <span aria-hidden>·</span>
              <time dateTime={noticia.data}>{formatarData(noticia.data)}</time>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- ficha lateral */

function FichaTecnica({ candidato }: { candidato: Candidato }) {
  const linhas: [string, string][] = [
    ["Partido", candidato.partido],
    ["Número", String(candidato.numero)],
    ["Vice", candidato.vice],
    ["Idade", `${idadeDe(candidato.nascimento)} anos`],
    ["Nascimento", formatarData(candidato.nascimento)],
    ["Naturalidade", candidato.naturalidade],
    ["Escolaridade", candidato.escolaridade],
    ["Ocupação declarada", candidato.ocupacao],
    ["Situação do registro", candidato.situacaoRegistro],
  ];

  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
      <div className="rounded-2xl border border-border bg-papel-100 p-5 sm:p-6">
        <h2 className="rotulo mb-4 text-bronze-500">Registro no TSE</h2>

        <dl className="flex flex-col">
          {linhas.map(([rotulo, valor]) => (
            <div
              key={rotulo}
              className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2.5 last:border-0 last:pb-0"
            >
              <dt className="shrink-0 text-xs text-tinta-500">{rotulo}</dt>
              <dd className="text-right text-sm text-tinta-900">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      {candidato.observacao && (
        <div className="rounded-2xl border border-bronze-500/30 bg-bronze-500/6 p-5">
          <h2 className="rotulo mb-2 text-bronze-600">Andamento processual</h2>
          <p className="text-sm leading-relaxed text-tinta-700">
            {candidato.observacao}
          </p>
        </div>
      )}

      <CreditoFotoLinha candidato={candidato} />
    </aside>
  );
}

/* ------------------------------------------------------------------ navegação */

/**
 * Anterior e próximo na ordem alfabética — o mesmo critério da galeria.
 * A lista não circula: quem chega na ponta vê apenas um dos lados, em vez de
 * um ciclo que sugeriria uma sequência de importância.
 */
function Vizinhos({
  anterior,
  proximo,
}: {
  anterior: Candidato | null;
  proximo: Candidato | null;
}) {
  if (!anterior && !proximo) return null;

  return (
    <nav
      aria-label="Outras candidaturas"
      className="mt-16 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {anterior ? <SetaVizinho candidato={anterior} sentido="anterior" /> : <span />}
      {proximo && <SetaVizinho candidato={proximo} sentido="proximo" />}
    </nav>
  );
}

function SetaVizinho({
  candidato,
  sentido,
}: {
  candidato: Candidato;
  sentido: "anterior" | "proximo";
}) {
  const proximo = sentido === "proximo";
  const Icone = proximo ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={`/candidato/${candidato.slug}`}
      className={`group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition hover:border-papel-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500 ${
        proximo ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <Icone
        className="size-4 shrink-0 text-tinta-400 transition group-hover:text-bronze-500"
        aria-hidden
      />
      <span className="flex min-w-0 flex-col">
        <span className="rotulo text-tinta-400">
          {proximo ? "Próxima" : "Anterior"}
        </span>
        <span className="truncate font-serif text-lg text-tinta-900">
          {candidato.nome}
        </span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ auxiliares */

function Secao({
  id,
  titulo,
  nota,
  children,
}: {
  id: string;
  titulo: string;
  /** Linha curta que diz de onde vem o conteúdo da seção. */
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`titulo-${id}`}>
      <div className="mb-2 flex items-center gap-3">
        <h2
          id={`titulo-${id}`}
          className="font-serif text-2xl text-tinta-900 sm:text-[1.75rem]"
        >
          {titulo}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>
      {nota && <p className="mb-5 text-sm text-tinta-500">{nota}</p>}
      {!nota && <div className="mb-5" />}
      {children}
    </section>
  );
}

function LinkTse({ sq }: { sq: string }) {
  return (
    <a
      href={`https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/6257/${sq}/2026/BR`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 self-start text-xs text-tinta-500 underline decoration-dotted underline-offset-2 transition hover:text-bronze-500"
    >
      Ficha completa no DivulgaCandContas do TSE
      <ExternalLink className="size-3" aria-hidden />
    </a>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-input px-5 py-8 text-center text-sm text-tinta-500">
      {children}
    </p>
  );
}
