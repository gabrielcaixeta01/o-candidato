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
/** Distância de arrasto, em px, a partir da qual a folha fecha ao soltar. */
const LIMIAR_ARRASTE = 110;

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Folha de detalhes do candidato.
 *
 * Muda de forma conforme a tela: bottom sheet ancorada embaixo no celular,
 * com alça e arrasto para fechar; diálogo centralizado no desktop, onde uma
 * folha colada na base do monitor não faria sentido.
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
  const [arrasteY, setArrasteY] = useState(0);
  const [arrastando, setArrastando] = useState(false);

  const painelRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const elementoAnterior = useRef<HTMLElement | null>(null);
  const inicioArraste = useRef<number | null>(null);
  const base = useId();

  // Ajuste de estado durante a renderização — o padrão recomendado pelo React
  // para reagir a mudança de prop, em vez de um efeito que dispara re-render.
  if (candidato !== anterior) {
    setAnterior(candidato);
    if (candidato) {
      setExibido(candidato);
      setAba("perfil");
      setArrasteY(0);
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
      setArrasteY(0);
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

  // Esc fecha; Tab circula dentro da folha em vez de vazar para a página atrás.
  useEffect(() => {
    if (!candidato) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        onFechar();
        return;
      }
      if (evento.key !== "Tab" || !painelRef.current) return;

      const focaveis = Array.from(
        painelRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL),
      ).filter((elemento) => elemento.offsetParent !== null);
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const ativo = document.activeElement;

      if (evento.shiftKey && (ativo === primeiro || ativo === painelRef.current)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && ativo === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
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

  /*
    Arrasto para fechar, só pelo cabeçalho. Preso ao cabeçalho de propósito:
    no corpo, o gesto competiria com a rolagem da lista de notícias.
  */
  const aoTocarInicio = useCallback((evento: React.TouchEvent) => {
    inicioArraste.current = evento.touches[0].clientY;
    setArrastando(true);
  }, []);

  const aoTocarMover = useCallback((evento: React.TouchEvent) => {
    if (inicioArraste.current === null) return;
    const delta = evento.touches[0].clientY - inicioArraste.current;
    // Só para baixo: puxar para cima não estica a folha.
    setArrasteY(Math.max(0, delta));
  }, []);

  const aoTocarFim = useCallback(() => {
    inicioArraste.current = null;
    setArrastando(false);
    setArrasteY((atual) => {
      if (atual > LIMIAR_ARRASTE) onFechar();
      return 0;
    });
  }, [onFechar]);

  if (!exibido) return null;

  const idAba = (id: Aba) => `${base}-aba-${id}`;
  const idPainel = (id: Aba) => `${base}-painel-${id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      onClick={aoClicarNoFundo}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-tinta-900/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          aberto ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${base}-titulo`}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90svh] w-full flex-col overflow-hidden bg-card outline-none",
          "rounded-t-3xl sm:max-h-[85svh] sm:max-w-2xl sm:rounded-3xl",
          "shadow-[0_-8px_40px_rgba(20,24,31,0.18)] sm:shadow-2xl",
          // No celular sobe; no desktop cresce e aparece no lugar.
          "transition-[transform,opacity] duration-300 ease-out",
          aberto
            ? "translate-y-0 sm:scale-100 sm:opacity-100"
            : "translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0",
          arrastando && "transition-none",
        )}
        style={
          arrasteY > 0 ? { transform: `translateY(${arrasteY}px)` } : undefined
        }
      >
        <Cabecalho
          candidato={exibido}
          tituloId={`${base}-titulo`}
          onFechar={onFechar}
          aba={aba}
          onTrocarAba={setAba}
          idAba={idAba}
          idPainel={idPainel}
          onTocarInicio={aoTocarInicio}
          onTocarMover={aoTocarMover}
          onTocarFim={aoTocarFim}
        />

        <div
          ref={conteudoRef}
          id={idPainel(aba)}
          role="tabpanel"
          aria-labelledby={idAba(aba)}
          tabIndex={0}
          className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6"
        >
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
  idAba,
  idPainel,
  onTocarInicio,
  onTocarMover,
  onTocarFim,
}: {
  candidato: Candidato;
  tituloId: string;
  onFechar: () => void;
  aba: Aba;
  onTrocarAba: (aba: Aba) => void;
  idAba: (id: Aba) => string;
  idPainel: (id: Aba) => string;
  onTocarInicio: (evento: React.TouchEvent) => void;
  onTocarMover: (evento: React.TouchEvent) => void;
  onTocarFim: () => void;
}) {
  return (
    <div
      className="shrink-0 border-b border-border bg-card px-5 pt-3 pb-4 sm:px-6 sm:pt-5"
      onTouchStart={onTocarInicio}
      onTouchMove={onTocarMover}
      onTouchEnd={onTocarFim}
    >
      {/* Alça: sinaliza o arrasto no vocabulário do iOS. Some no desktop,
          onde não existe gesto correspondente. */}
      <div
        aria-hidden
        className="mx-auto mb-4 h-1 w-10 rounded-full bg-papel-400 sm:hidden"
      />

      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-14 shrink-0 overflow-hidden rounded-lg sm:w-16">
          <Retrato candidato={candidato} sizes="4rem" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="rotulo text-bronze-500">{candidato.partido}</span>
          <h2
            id={tituloId}
            className="mt-1 font-serif text-xl leading-tight text-balance text-tinta-900 sm:text-2xl"
          >
            {candidato.nome}
          </h2>
          {candidato.nomeCompleto && (
            <p className="mt-0.5 truncate text-sm text-tinta-500">
              {candidato.nomeCompleto}
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-lg bg-bronze-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-white">
          {candidato.numero}
        </span>

        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="-mt-1.5 -mr-1.5 grid size-9 shrink-0 place-items-center rounded-lg text-tinta-500 transition hover:bg-papel-200 hover:text-tinta-900"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <ControleSegmentado
        aba={aba}
        onTrocarAba={onTrocarAba}
        idAba={idAba}
        idPainel={idPainel}
      />
    </div>
  );
}

/** Segmented control no estilo iOS: pílula deslizante sobre trilho recuado. */
function ControleSegmentado({
  aba,
  onTrocarAba,
  idAba,
  idPainel,
}: {
  aba: Aba;
  onTrocarAba: (aba: Aba) => void;
  idAba: (id: Aba) => string;
  idPainel: (id: Aba) => string;
}) {
  const indice = ABAS.findIndex((a) => a.id === aba);

  // Setas percorrem as abas, como manda o padrão ARIA de tablist.
  const aoTeclar = (evento: React.KeyboardEvent) => {
    const passo =
      evento.key === "ArrowRight" ? 1 : evento.key === "ArrowLeft" ? -1 : 0;
    if (passo === 0) return;
    evento.preventDefault();
    onTrocarAba(ABAS[(indice + passo + ABAS.length) % ABAS.length].id);
  };

  return (
    <div
      role="tablist"
      aria-label="Seções do candidato"
      onKeyDown={aoTeclar}
      className="relative mt-4 grid grid-cols-3 gap-1 rounded-xl bg-papel-200 p-1 sm:mt-5"
    >
      {/* Indicador deslizante. A largura desconta o padding do trilho (0.5rem)
          e os dois vãos entre colunas (0.5rem). */}
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-lg bg-card shadow-xs transition-transform duration-300 ease-out"
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
          id={idAba(id)}
          aria-selected={aba === id}
          aria-controls={idPainel(id)}
          tabIndex={aba === id ? 0 : -1}
          onClick={() => onTrocarAba(id)}
          className={cn(
            "relative z-10 rounded-lg py-2 text-sm font-medium transition-colors duration-200",
            aba === id
              ? "text-tinta-900"
              : "text-tinta-500 hover:text-tinta-900",
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
    <div className="space-y-6">
      <p className="text-[0.9375rem] leading-relaxed text-tinta-700">
        {candidato.bio}
      </p>

      <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {linhas.map(({ rotulo, valor }) => (
          <div
            key={rotulo}
            className="flex items-baseline justify-between gap-4 px-4 py-3"
          >
            <dt className="rotulo">{rotulo}</dt>
            <dd className="text-right text-sm text-tinta-900">{valor}</dd>
          </div>
        ))}
      </dl>

      {candidato.observacao && (
        <p className="rounded-xl border border-border bg-papel-100 px-4 py-3 text-sm leading-relaxed text-tinta-500">
          {candidato.observacao}
        </p>
      )}

      <CreditoFotoLinha candidato={candidato} />
    </div>
  );
}

function AbaPropostas({ candidato }: { candidato: Candidato }) {
  return (
    <div className="space-y-5">
      {candidato.temas.length > 0 ? (
        <>
          <h3 className="rotulo">Temas centrais declarados</h3>
          <ul className="flex flex-wrap gap-2">
            {candidato.temas.map((tema) => (
              <li
                key={tema}
                className="rounded-lg border border-bronze-500/25 bg-bronze-500/5 px-3 py-1.5 text-sm text-tinta-900"
              >
                {tema}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Vazio texto="Os temas declarados desta candidatura ainda não foram catalogados a partir do plano de governo registrado no TSE." />
      )}

      <LinkExterno
        href={
          candidato.planoGoverno ?? "https://divulgacandcontas.tse.jus.br/"
        }
      >
        {candidato.planoGoverno
          ? "Plano de governo registrado no TSE"
          : "Consultar no DivulgaCandContas do TSE"}
      </LinkExterno>
    </div>
  );
}

function AbaNoticias({ noticias }: { noticias: Noticia[] }) {
  if (noticias.length === 0) {
    return (
      <Vazio texto="Nenhuma notícia coletada até agora. A lista é atualizada automaticamente uma vez por semana." />
    );
  }

  return (
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
            className="group flex flex-col gap-1.5 px-4 py-3.5 transition hover:bg-papel-100"
          >
            <span className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] tracking-wide text-tinta-500 uppercase">
              {noticia.fonte}
              <span aria-hidden>·</span>
              <time dateTime={noticia.data}>{formatarData(noticia.data)}</time>
            </span>
            <span className="flex items-start gap-2 text-[0.9375rem] leading-snug text-tinta-900">
              {noticia.titulo}
              <ExternalLink
                className="mt-1 size-3.5 shrink-0 text-tinta-400 transition group-hover:text-bronze-500"
                aria-hidden
              />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function LinkExterno({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-bronze-500 underline decoration-dotted underline-offset-4 hover:text-bronze-600"
    >
      {children}
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl border border-dashed border-input px-4 py-6 text-center text-sm leading-relaxed text-tinta-500">
      {texto}
    </p>
  );
}
