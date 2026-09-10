import { iniciaisDe } from "@/lib/candidatos";
import type { CandidatoCargo } from "@/lib/types";

/**
 * Card resumido para cargos sem ficha dedicada (Governador, Senador).
 *
 * Mesma diagramação para todos os candidatos do cargo. Sempre usa o
 * placeholder de iniciais — não há curadoria de fotos para além de
 * Presidente neste corte — para não misturar candidaturas com e sem foto na
 * mesma grade.
 */
export function CargoCard({
  candidato,
  linhaSecundaria,
}: {
  candidato: CandidatoCargo;
  /** Ex.: "Vice: Fulano (PT)" ou "Suplentes: Fulano (PT), Beltrana (PV)". */
  linhaSecundaria?: string;
}) {
  const { nome, partido, numero, situacaoRegistro } = candidato;

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden bg-linear-to-br from-papel-200 to-papel-400">
        <span
          aria-hidden
          className="font-serif text-5xl text-bronze-500/30 select-none sm:text-6xl"
        >
          {iniciaisDe(nome)}
        </span>

        <span className="absolute top-3 right-3 rounded-lg bg-bronze-500 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-white shadow-sm">
          {numero}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="rotulo text-bronze-500">{partido}</span>

        <h3 className="font-serif text-xl leading-tight text-tinta-900">
          {nome}
        </h3>

        {linhaSecundaria && (
          <p className="text-sm leading-relaxed text-tinta-500">
            {linhaSecundaria}
          </p>
        )}

        <p className="mt-auto pt-2 text-xs text-tinta-400">
          {situacaoRegistro}
        </p>
      </div>
    </article>
  );
}
