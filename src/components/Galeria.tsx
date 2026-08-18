"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CandidatoCard } from "@/components/CandidatoCard";
import { CandidatoSheet } from "@/components/CandidatoSheet";
import { filtrarCandidatos } from "@/lib/candidatos";
import type { Candidato, Noticia } from "@/lib/types";

/**
 * Busca + galeria + folha de detalhes.
 *
 * Recebe a lista já ordenada alfabeticamente pelo servidor e nunca reordena:
 * o filtro apenas remove itens, preservando a ordem original. Ordenar por
 * relevância de busca criaria um ranking implícito.
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
      className="acima-do-grao mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6 sm:pb-28"
    >
      <h2 id="titulo-candidatos" className="sr-only">
        Candidatos
      </h2>

      {/* A busca acompanha a rolagem: com 13 cards, voltar ao topo para
          filtrar seria um vaivém constante no celular. */}
      <div className="sticky top-0 z-20 -mx-5 mb-8 border-b border-border/70 bg-background/85 px-5 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-tinta-400"
              aria-hidden
            />
            <input
              type="text"
              inputMode="search"
              value={consulta}
              onChange={(evento) => setConsulta(evento.target.value)}
              placeholder="Buscar por nome, partido ou tema"
              aria-label="Buscar por nome, partido ou tema"
              className="h-12 w-full rounded-xl border border-input bg-card pr-11 pl-11 text-base text-tinta-900 transition placeholder:text-tinta-400 focus:border-bronze-500/60 focus:outline-none sm:h-11 sm:text-sm"
            />
            {consulta && (
              <button
                type="button"
                onClick={() => setConsulta("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-tinta-400 transition hover:bg-papel-200 hover:text-tinta-900"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>

          <p aria-live="polite" className="rotulo shrink-0 sm:text-right">
            {visiveis.length}{" "}
            {visiveis.length === 1 ? "candidatura" : "candidaturas"}
            {consulta && ` de ${candidatos.length}`}
          </p>
        </div>
      </div>

      {visiveis.length > 0 ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {visiveis.map((candidato, indice) => (
            <li key={`${candidato.nome}-${candidato.numero}`} className="flex">
              <CandidatoCard
                candidato={candidato}
                onSelecionar={setSelecionado}
                prioridade={indice < 3}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-input px-6 py-16 text-center text-sm text-tinta-500">
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
