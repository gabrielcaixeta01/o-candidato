import { CalendarioEleitoral } from "@/components/CalendarioEleitoral";
import type { EventoEleitoral } from "@/lib/types";

export function Hero({ calendario }: { calendario: EventoEleitoral[] }) {
  return (
    <header className="acima-do-grao mx-auto w-full max-w-6xl px-6 pt-14 pb-16 sm:pt-20">
      {/* Marca: placa institucional, não logotipo de campanha. */}
      <p className="rotulo mb-12 text-latao-500">O Candidato</p>

      <h1 className="max-w-3xl font-serif text-4xl leading-[1.1] text-balance text-foreground sm:text-5xl lg:text-6xl">
        Quem disputa a Presidência em{" "}
        <span className="text-latao-500">2026</span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground">
        Todos os candidatos registrados no TSE, em ordem alfabética e com a
        mesma diagramação. Apenas fatos verificáveis: partido, número, vice,
        idade e notícias com link para a fonte original. Sem análise, sem
        ranking e sem opinião.
      </p>

      <CalendarioEleitoral eventos={calendario} />
    </header>
  );
}
