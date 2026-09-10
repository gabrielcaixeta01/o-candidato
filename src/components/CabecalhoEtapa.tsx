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
