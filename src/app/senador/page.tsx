import type { Metadata } from "next";
import { CabecalhoEtapa } from "@/components/CabecalhoEtapa";
import { CargoCard } from "@/components/CargoCard";
import { EtapaNav } from "@/components/EtapaNav";
import { Rodape } from "@/components/Rodape";
import { lerNoticias, listarSenadores } from "@/lib/candidatos";

export const metadata: Metadata = {
  title: "Senador pelo DF em 2026 — O Candidato",
  description:
    "Quem disputa as vagas de Senador pelo Distrito Federal em 2026, em ordem alfabética e com o registro oficial no TSE.",
};

export default function PaginaSenador() {
  const candidatos = listarSenadores();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <CabecalhoEtapa
        atual="senador"
        titulo="Quem disputa o Senado pelo DF em 2026"
        descricao={`${candidatos.length} candidaturas disputam as 2 vagas de Senador pelo Distrito Federal em 2026, em ordem alfabética. Cada chapa tem 2 suplentes, que assumem o mandato se o titular se afastar.`}
      />

      <section
        aria-labelledby="titulo-senador"
        className="acima-do-grao mx-auto w-full max-w-6xl px-5 pb-12 sm:px-6"
      >
        <h2 id="titulo-senador" className="sr-only">
          Candidatos a Senador pelo DF
        </h2>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {candidatos.map((candidato) => (
            <li key={candidato.nome} className="flex">
              <CargoCard
                candidato={candidato}
                linhaSecundaria={
                  candidato.suplentes
                    ? `Suplentes: ${candidato.suplentes.join(", ")}`
                    : undefined
                }
              />
            </li>
          ))}
        </ul>

        <EtapaNav atual="senador" />
      </section>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
