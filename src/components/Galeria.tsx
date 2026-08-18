"use client";

import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CandidatoCard } from "@/components/CandidatoCard";
import { CandidatoSheet } from "@/components/CandidatoSheet";
import { filtrarCandidatos } from "@/lib/candidatos";
import type { Candidato, Noticia } from "@/lib/types";

/**
 * Busca + galeria + bottom sheet.
 *
 * Recebe a lista já ordenada alfabeticamente pelo servidor e nunca reordena:
 * o filtro apenas remove itens, preservando a ordem original.
 */
export function Galeria({
  candidatos,
  noticiasPorCandidato,
}: {
  candidatos: Candidato[];
  noticiasPorCandidato: Record<string, Noticia[]>;
}) {
  const [consulta, setConsulta] = useState("");
  const [selecionado, setSelecionado] = useState<Candidato | null>(null);

  const visiveis = useMemo(
    () => filtrarCandidatos(candidatos, consulta),
    [candidatos, consulta],
  );

  const fechar = useCallback(() => setSelecionado(null), []);

  const noticiasDoSelecionado = selecionado
    ? (noticiasPorCandidato[selecionado.nome] ?? [])
    : [];

  return (
    <section
      id="candidatos"
      aria-labelledby="titulo-candidatos"
      className="acima-do-grao mx-auto w-full max-w-6xl px-6 pb-24"
    >
      <h2 id="titulo-candidatos" className="sr-only">
        Candidatos
      </h2>

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={consulta}
            onChange={(evento) => setConsulta(evento.target.value)}
            placeholder="Buscar por nome, partido ou tema"
            aria-label="Buscar por nome, partido ou tema"
            className="w-full rounded-xl border border-border bg-card py-3 pr-4 pl-11 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-latao-500/50 focus:outline-none"
          />
        </div>

        <p
          aria-live="polite"
          className="rotulo shrink-0 text-muted-foreground sm:text-right"
        >
          {visiveis.length}{" "}
          {visiveis.length === 1 ? "candidatura" : "candidaturas"}
          {consulta && ` de ${candidatos.length}`}
        </p>
      </div>

      {visiveis.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((candidato) => (
            <li key={`${candidato.nome}-${candidato.numero}`}>
              <CandidatoCard
                candidato={candidato}
                onSelecionar={setSelecionado}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          Nenhuma candidatura corresponde a “{consulta}”.
        </p>
      )}

      <CandidatoSheet
        candidato={selecionado}
        noticias={noticiasDoSelecionado}
        onFechar={fechar}
      />
    </section>
  );
}
