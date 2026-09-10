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
