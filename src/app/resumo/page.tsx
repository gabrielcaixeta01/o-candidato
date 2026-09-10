import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoEtapa } from "@/components/CabecalhoEtapa";
import { EtapaNav } from "@/components/EtapaNav";
import { Rodape } from "@/components/Rodape";
import {
  lerNoticias,
  listarCandidatos,
  listarGovernadores,
  listarSenadores,
} from "@/lib/candidatos";

export const metadata: Metadata = {
  title: "O que você vai votar no DF em 2026 — O Candidato",
  description:
    "Presidente, Governador e Senador: os cargos em disputa na urna do eleitor do Distrito Federal em 2026.",
};

interface ItemResumo {
  nome: string;
  partido: string;
  numero: number;
}

export default function PaginaResumo() {
  const presidente: ItemResumo[] = listarCandidatos();
  const governador: ItemResumo[] = listarGovernadores();
  const senador: ItemResumo[] = listarSenadores();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <CabecalhoEtapa
        atual="resumo"
        titulo="O que você vai votar no DF em 2026"
        descricao="Os cargos em disputa que aparecem na sua urna, com o total de candidaturas registradas em cada um."
      />

      <section className="acima-do-grao mx-auto w-full max-w-3xl px-5 pb-16 sm:px-6">
        <SecaoResumo titulo="Presidente" href="/" itens={presidente} />
        <SecaoResumo titulo="Governador" href="/governador" itens={governador} />
        <SecaoResumo titulo="Senador" href="/senador" itens={senador} />

        <EtapaNav atual="resumo" />
      </section>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}

function SecaoResumo({
  titulo,
  href,
  itens,
}: {
  titulo: string;
  href: string;
  itens: ItemResumo[];
}) {
  return (
    <section
      aria-labelledby={`titulo-resumo-${titulo}`}
      className="flex flex-col gap-4 border-b border-border/70 py-8 first:pt-0 last:border-0"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id={`titulo-resumo-${titulo}`}
          className="font-serif text-2xl text-tinta-900"
        >
          {titulo}
        </h2>
        <Link
          href={href}
          className="rotulo shrink-0 text-bronze-500 underline decoration-dotted underline-offset-4 hover:text-bronze-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-500"
        >
          Ver todos
        </Link>
      </div>

      <p className="rotulo text-tinta-400">
        {itens.length} {itens.length === 1 ? "candidatura" : "candidaturas"}
      </p>

      <ul className="flex flex-col gap-2">
        {itens.map((item) => (
          <li
            key={item.nome}
            className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 text-sm text-tinta-700 last:border-0"
          >
            <span className="truncate">{item.nome}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-tinta-400">
              {item.numero} · {item.partido}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
