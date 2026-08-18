"use client";

import { Retrato } from "@/components/Retrato";
import type { Candidato } from "@/lib/types";

/**
 * Card de candidato.
 *
 * A diagramação é rigorosamente idêntica para todos: mesma proporção de foto,
 * mesma posição do número, mesma altura de bio. Nenhum card recebe destaque,
 * tamanho ou cor diferente.
 *
 * O clique vem de um botão sobreposto em vez de um <button> envolvendo tudo:
 * <button> só aceita conteúdo de frase, então embrulhar <h3> e <p> nele
 * produziria HTML inválido e um rótulo confuso para leitores de tela.
 */
export function CandidatoCard({
  candidato,
  onSelecionar,
  prioridade = false,
}: {
  candidato: Candidato;
  onSelecionar: (candidato: Candidato) => void;
  /** Pré-carrega a imagem dos primeiros cards, que compõem o LCP. */
  prioridade?: boolean;
}) {
  const { nome, partido, numero, bio } = candidato;

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition duration-300 ease-out hover:-translate-y-1 hover:border-papel-400 hover:shadow-lg focus-within:border-bronze-500/50 motion-reduce:hover:translate-y-0">
      <Retrato candidato={candidato} prioridade={prioridade} />

      {/* Número da urna: o único uso de bronze sólido no card. */}
      <span className="absolute top-3 right-3 rounded-lg bg-bronze-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-white shadow-sm">
        {numero}
      </span>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="rotulo text-bronze-500">{partido}</span>

        <h3 className="font-serif text-xl leading-tight text-tinta-900">
          {nome}
        </h3>

        {/* line-clamp-2 mantém a altura do bloco de texto constante. */}
        <p className="line-clamp-2 text-sm leading-relaxed text-tinta-500">
          {bio}
        </p>
      </div>

      {/*
        Botão esticado sobre o card inteiro. `inset-0` garante alvo de toque
        muito acima dos 44px recomendados em telas pequenas.
      */}
      <button
        type="button"
        onClick={() => onSelecionar(candidato)}
        className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
      >
        <span className="sr-only">
          {`Abrir perfil de ${nome}, ${partido}, número ${numero}`}
        </span>
      </button>
    </article>
  );
}
