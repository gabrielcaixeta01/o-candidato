import { CalendarioEleitoral } from "@/components/CalendarioEleitoral";
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

      <h1 className="max-w-3xl font-serif text-[2.125rem] leading-[1.08] tracking-[-0.015em] text-balance text-tinta-900 sm:text-5xl lg:text-[3.75rem]">
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
