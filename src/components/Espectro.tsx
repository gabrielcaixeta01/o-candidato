import { Info } from "lucide-react";
import type { FonteEspectro } from "@/lib/types";

/**
 * Posicionamento do PARTIDO no espectro esquerda-direita.
 *
 * Três decisões que sustentam a neutralidade desta seção:
 *
 * 1. Classifica o partido, nunca a pessoa. Ninguém aqui recebe um rótulo
 *    ideológico pessoal — o site não tem como apurar isso.
 * 2. Nada é afirmado na voz do site. Cada rótulo aparece colado ao nome e ao
 *    ano da fonte que o publicou, reproduzido na redação original.
 * 3. As divergências ficam à vista. Quando duas fontes discordam (o PSD
 *    aparece como "centro" e como "direita"), mostrar as duas informa mais do
 *    que escolher uma — e escolher seria justamente emitir opinião.
 */
export function Espectro({
  classificacoes,
  partido,
  fontes,
  compilacao,
}: {
  classificacoes: { fonte: FonteEspectro; rotulo: string }[];
  partido: string;
  fontes: FonteEspectro[];
  compilacao: string;
}) {
  if (classificacoes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-input px-5 py-6 text-sm leading-relaxed text-tinta-500">
        Nenhum dos levantamentos consultados classifica o {partido}. Os
        levantamentos são de {menorAno(fontes)}–{maiorAno(fontes)} e não
        alcançam partidos registrados depois disso.
      </p>
    );
  }

  const divergem = new Set(classificacoes.map((c) => c.rotulo)).size > 1;

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-2.5">
        {classificacoes.map(({ fonte, rotulo }) => (
          <li
            key={fonte.id}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/70 pb-2.5 last:border-0 last:pb-0"
          >
            <span className="text-[0.9375rem] text-tinta-900">
              <span className="capitalize">{rotulo}</span>
            </span>
            <a
              href={fonte.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-tinta-500 underline decoration-dotted underline-offset-2 transition hover:text-bronze-500"
            >
              {fonte.nome}, {fonte.ano}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex gap-3 rounded-xl bg-papel-200 px-4 py-3.5 text-xs leading-relaxed text-tinta-500">
        <Info className="mt-0.5 size-4 shrink-0 text-bronze-500" aria-hidden />
        <p>
          Classificações sobre o <strong className="font-medium">partido</strong>
          , não sobre a pessoa candidata. Não existe classificação oficial: o TSE
          não registra posicionamento ideológico.{" "}
          {divergem && "As fontes divergem entre si — todas aparecem acima. "}
          Rótulos reproduzidos como cada levantamento publicou, a partir da{" "}
          <a
            href={compilacao}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-bronze-500"
          >
            compilação da Wikipédia
          </a>
          .
        </p>
      </div>
    </div>
  );
}

const menorAno = (f: FonteEspectro[]) => Math.min(...f.map((x) => x.ano));
const maiorAno = (f: FonteEspectro[]) => Math.max(...f.map((x) => x.ano));
