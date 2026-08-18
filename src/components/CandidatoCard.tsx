"use client";

import { Retrato } from "@/components/Retrato";
import type { Candidato } from "@/lib/types";

/**
 * Card de candidato.
 *
 * A diagramação é rigorosamente idêntica para todos: mesma proporção de foto,
 * mesma posição do número, mesmo espaço de bio (duas linhas fixas). Nenhum
 * card recebe destaque, tamanho ou cor diferente.
 */
export function CandidatoCard({
  candidato,
  onSelecionar,
}: {
  candidato: Candidato;
  onSelecionar: (candidato: Candidato) => void;
}) {
  const { nome, partido, numero, bio } = candidato;

  return (
    <button
      type="button"
      onClick={() => onSelecionar(candidato)}
      aria-label={`Abrir perfil de ${nome}, ${partido}, número ${numero}`}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg shadow-black/25 transition duration-300 ease-out hover:-translate-y-1 hover:border-latao-500/40 hover:shadow-xl hover:shadow-black/40"
    >
      <Retrato candidato={candidato} />

      {/* Número da urna: o único uso de latão sólido no card. */}
      <span className="absolute top-4 right-4 rounded-lg bg-latao-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-tinta-900 shadow-md shadow-black/30">
        {numero}
      </span>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="rotulo text-latao-500">{partido}</span>

        <h3 className="font-serif text-xl leading-tight text-foreground">
          {nome}
        </h3>

        {/* line-clamp-2 mantém a altura do bloco de texto constante. */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {bio}
        </p>
      </div>
    </button>
  );
}
