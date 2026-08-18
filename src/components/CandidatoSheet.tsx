"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { CreditoFotoLinha, Retrato } from "@/components/Retrato";
import { formatarData } from "@/lib/candidatos";
import { cn } from "@/lib/utils";
import type { Candidato, Noticia } from "@/lib/types";

type Aba = "perfil" | "propostas" | "noticias";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "perfil", rotulo: "Perfil" },
  { id: "propostas", rotulo: "Propostas" },
  { id: "noticias", rotulo: "Notícias" },
];

const DURACAO_SAIDA_MS = 300;

/**
 * Bottom sheet no estilo iOS: desliza de baixo, cantos superiores arredondados,
 * fecha por Esc, por clique no fundo ou pelo botão.
 *
 * Feita à mão em vez de com um componente de dialog pronto porque o
 * comportamento desejado (folha ancorada embaixo, altura limitada, conteúdo
 * com rolagem própria) é mais direto de controlar do que de configurar.
 */
export function CandidatoSheet({
  candidato,
  noticias,
  onFechar,
}: {
  candidato: Candidato | null;
  noticias: Noticia[];
  onFechar: () => void;
}) {
  // Mantém o conteúdo durante a animação de saída, depois que `candidato` some.
  const [exibido, setExibido] = useState<Candidato | null>(candidato);
  const [anterior, setAnterior] = useState<Candidato | null>(candidato);
  const [entrou, setEntrou] = useState(false);
  const [aba, setAba] = useState<Aba>("perfil");

  const painelRef = useRef<HTMLDivElement>(null);
  const elementoAnterior = useRef<HTMLElement | null>(null);
  const tituloId = useId();

  // Ajuste de estado durante a renderização — o padrão recomendado pelo React
  // para reagir a mudança de prop, em vez de um efeito que dispara re-render.
  if (candidato !== anterior) {
    setAnterior(candidato);
    if (candidato) {
      setExibido(candidato);
      setAba("perfil");
    }
  }

  // `entrou` sozinho não decide: fechar zera a folha na hora, sem setState.
  const aberto = candidato !== null && entrou;

  // Entrada. Dois frames garantem que o estado inicial (fora da tela) seja
  // pintado antes da transição, senão o browser agrupa e a animação some.
  useEffect(() => {
    if (!candidato) return;
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntrou(true)),
    );
    return () => cancelAnimationFrame(frame);
  }, [candidato]);

  // Saída: desmonta só depois que a folha terminou de descer.
  useEffect(() => {
    if (candidato) return;
    const timer = setTimeout(() => {
      setExibido(null);
      setEntrou(false);
    }, DURACAO_SAIDA_MS);
    return () => clearTimeout(timer);
  }, [candidato]);

  // Trava o scroll da página enquanto a folha está aberta.
  useEffect(() => {
    if (!candidato) return;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [candidato]);

  // Move o foco para a folha e devolve ao card de origem ao fechar.
  useEffect(() => {
    if (!candidato) return;
    elementoAnterior.current = document.activeElement as HTMLElement | null;
    painelRef.current?.focus();
    return () => elementoAnterior.current?.focus();
  }, [candidato]);

  useEffect(() => {
    if (!candidato) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [candidato, onFechar]);

  const aoClicarNoFundo = useCallback(
    (evento: React.MouseEvent<HTMLDivElement>) => {
      if (evento.target === evento.currentTarget) onFechar();
    },
    [onFechar],
  );

  if (!exibido) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={aoClicarNoFundo}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-tinta-900/70 backdrop-blur-sm transition-opacity duration-300 ease-out",
          aberto ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[88svh] w-full max-w-2xl flex-col",
          "rounded-t-3xl border border-b-0 border-border bg-card shadow-2xl shadow-black/60",
          "transition-transform duration-300 ease-out outline-none",
          aberto ? "translate-y-0" : "translate-y-full",
        )}
      >
        <Cabecalho
          candidato={exibido}
          tituloId={tituloId}
          onFechar={onFechar}
          aba={aba}
          onTrocarAba={setAba}
        />

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {aba === "perfil" && <AbaPerfil candidato={exibido} />}
          {aba === "propostas" && <AbaPropostas candidato={exibido} />}
          {aba === "noticias" && <AbaNoticias noticias={noticias} />}
        </div>
      </div>
    </div>
  );
}

function Cabecalho({
  candidato,
  tituloId,
  onFechar,
  aba,
  onTrocarAba,
}: {
  candidato: Candidato;
  tituloId: string;
  onFechar: () => void;
  aba: Aba;
  onTrocarAba: (aba: Aba) => void;
}) {
  return (
    <div className="shrink-0 border-b border-border px-6 pt-3 pb-4">
      {/* Alça: sinaliza que a folha é arrastável no vocabulário do iOS. */}
      <div
        aria-hidden
        className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15"
      />

      <div className="flex items-start gap-4">
        <div className="w-16 shrink-0 overflow-hidden rounded-lg">
          <Retrato candidato={candidato} sizes="4rem" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="rotulo text-latao-500">{candidato.partido}</span>
          <h2
            id={tituloId}
            className="mt-1 font-serif text-2xl leading-tight text-foreground"
          >
            {candidato.nome}
          </h2>
          {candidato.nomeCompleto && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {candidato.nomeCompleto}
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-lg bg-latao-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-tinta-900">
          {candidato.numero}
        </span>

        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="-mt-1 -mr-1 shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <ControleSegmentado aba={aba} onTrocarAba={onTrocarAba} />
    </div>
  );
}

/** Segmented control no estilo iOS: pílula deslizante sobre trilho recuado. */
function ControleSegmentado({
  aba,
  onTrocarAba,
}: {
  aba: Aba;
  onTrocarAba: (aba: Aba) => void;
}) {
  const indice = ABAS.findIndex((a) => a.id === aba);

  return (
    <div
      role="tablist"
      aria-label="Seções do candidato"
      className="relative mt-5 grid grid-cols-3 gap-1 rounded-xl bg-tinta-700 p-1"
    >
      {/* Indicador deslizante. inset-y-1 + width de 1/3 menos o padding. */}
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-lg bg-tinta-500 shadow-sm transition-transform duration-300 ease-out"
        style={{
          width: "calc((100% - 1rem) / 3)",
          transform: `translateX(calc(${indice} * (100% + 0.25rem)))`,
        }}
      />

      {ABAS.map(({ id, rotulo }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={aba === id}
          onClick={() => onTrocarAba(id)}
          className={cn(
            "relative z-10 rounded-lg py-2 text-sm font-medium transition-colors duration-200",
            aba === id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

function AbaPerfil({ candidato }: { candidato: Candidato }) {
  const linhas: { rotulo: string; valor: string }[] = [
    { rotulo: "Partido", valor: candidato.partido },
    { rotulo: "Número", valor: String(candidato.numero) },
    { rotulo: "Vice", valor: candidato.vice },
    {
      rotulo: "Idade",
      // Sem fonte confirmada, mostra travessão em vez de estimar.
      valor: candidato.idade === null ? "—" : `${candidato.idade} anos`,
    },
  ];

  return (
    <div role="tabpanel" className="space-y-6">
      <p className="text-[0.9375rem] leading-relaxed text-foreground/85">
        {candidato.bio}
      </p>

      <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {linhas.map(({ rotulo, valor }) => (
          <div
            key={rotulo}
            className="flex items-baseline justify-between gap-4 px-4 py-3"
          >
            <dt className="rotulo">{rotulo}</dt>
            <dd className="text-right text-sm text-foreground">{valor}</dd>
          </div>
        ))}
      </dl>

      {candidato.observacao && (
        <p className="rounded-xl border border-border bg-tinta-700 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {candidato.observacao}
        </p>
      )}

      <CreditoFotoLinha candidato={candidato} />
    </div>
  );
}

function AbaPropostas({ candidato }: { candidato: Candidato }) {
  return (
    <div role="tabpanel" className="space-y-5">
      {candidato.temas.length > 0 ? (
        <>
          <h3 className="rotulo">Temas centrais declarados</h3>
          <ul className="flex flex-wrap gap-2">
            {candidato.temas.map((tema) => (
              <li
                key={tema}
                className="rounded-lg border border-latao-500/25 bg-latao-500/5 px-3 py-1.5 text-sm text-foreground"
              >
                {tema}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Vazio texto="Os temas declarados desta candidatura ainda não foram catalogados a partir do plano de governo registrado no TSE." />
      )}

      {candidato.planoGoverno ? (
        <a
          href={candidato.planoGoverno}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-latao-400 underline decoration-dotted underline-offset-4 hover:text-latao-500"
        >
          Plano de governo registrado no TSE
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      ) : (
        <a
          href="https://divulgacandcontas.tse.jus.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-latao-400 underline decoration-dotted underline-offset-4 hover:text-latao-500"
        >
          Consultar no DivulgaCandContas do TSE
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}

function AbaNoticias({ noticias }: { noticias: Noticia[] }) {
  if (noticias.length === 0) {
    return (
      <div role="tabpanel">
        <Vazio texto="Nenhuma notícia coletada até agora. A lista é atualizada automaticamente uma vez por semana." />
      </div>
    );
  }

  return (
    <div role="tabpanel">
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {noticias.map((noticia) => (
          <li key={noticia.url}>
            {/*
              Apenas manchete, fonte, data e link. O texto da matéria nunca é
              reproduzido — o clique leva ao veículo original.
            */}
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1.5 px-4 py-3.5 transition hover:bg-white/3"
            >
              <span className="flex items-center gap-2 text-[0.6875rem] tracking-wide text-muted-foreground uppercase">
                {noticia.fonte}
                <span aria-hidden>·</span>
                <time dateTime={noticia.data}>
                  {formatarData(noticia.data)}
                </time>
              </span>
              <span className="flex items-start gap-2 text-[0.9375rem] leading-snug text-foreground">
                {noticia.titulo}
                <ExternalLink
                  className="mt-1 size-3.5 shrink-0 text-muted-foreground transition group-hover:text-latao-400"
                  aria-hidden
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
      {texto}
    </p>
  );
}
