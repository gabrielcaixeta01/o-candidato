import { formatarDataCurta } from "@/lib/candidatos";
import { cn } from "@/lib/utils";
import type { EventoEleitoral } from "@/lib/types";

/**
 * Datas-chave do calendário eleitoral do TSE.
 *
 * O marcador de "próxima data" é resolvido na renderização — como a página é
 * estática, ele acompanha o build. O commit semanal do cron de notícias
 * dispara um novo deploy, o que mantém o destaque em dia.
 */
export function CalendarioEleitoral({
  eventos,
}: {
  eventos: EventoEleitoral[];
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const proximo = eventos.find((evento) => evento.data >= hoje);

  return (
    <section aria-labelledby="titulo-calendario" className="mt-12 sm:mt-16">
      <h2 id="titulo-calendario" className="rotulo mb-4">
        Calendário eleitoral
      </h2>

      {/*
        Trilho rolável no celular e grade no desktop. Rolar preserva a leitura
        de cada data; comprimir cinco colunas numa tela de 380px não.
      */}
      <ol className="sem-barra -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {eventos.map((evento) => {
          const passou = evento.data < hoje;
          const ativo = evento.data === proximo?.data;

          return (
            <li
              key={evento.data}
              aria-current={ativo ? "date" : undefined}
              className={cn(
                "w-54 shrink-0 snap-start rounded-xl border px-4 py-3.5 transition-colors sm:w-auto",
                ativo
                  ? "border-bronze-500/40 bg-bronze-500/6"
                  : "border-border bg-card",
                passou && "opacity-55",
              )}
            >
              <p
                className={cn(
                  "font-mono text-sm tabular-nums",
                  ativo ? "font-semibold text-bronze-500" : "text-tinta-500",
                )}
              >
                <time dateTime={evento.data}>
                  {formatarDataCurta(evento.data)}
                </time>
              </p>
              <p className="mt-1.5 text-sm leading-snug font-medium text-tinta-900">
                {evento.rotulo}
              </p>
              {evento.detalhe && (
                <p className="mt-1 text-xs leading-relaxed text-tinta-500">
                  {evento.detalhe}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
