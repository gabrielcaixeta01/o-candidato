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
    <section aria-labelledby="titulo-calendario" className="mt-14">
      <h2 id="titulo-calendario" className="rotulo mb-4">
        Calendário eleitoral
      </h2>

      {/* Rola horizontalmente em telas estreitas em vez de comprimir. */}
      <ol className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {eventos.map((evento) => {
          const passou = evento.data < hoje;
          const ativo = evento.data === proximo?.data;

          return (
            <li
              key={evento.data}
              aria-current={ativo ? "date" : undefined}
              className={cn(
                "min-w-[13rem] shrink-0 rounded-xl border px-4 py-3.5 transition-colors sm:min-w-0",
                ativo
                  ? "border-latao-500/45 bg-latao-500/[0.07]"
                  : "border-border bg-card",
                passou && "opacity-45",
              )}
            >
              <p
                className={cn(
                  "font-mono text-sm tabular-nums",
                  ativo ? "text-latao-400" : "text-muted-foreground",
                )}
              >
                <time dateTime={evento.data}>
                  {formatarDataCurta(evento.data)}
                </time>
              </p>
              <p className="mt-1.5 text-sm leading-snug text-foreground">
                {evento.rotulo}
              </p>
              {evento.detalhe && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
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
