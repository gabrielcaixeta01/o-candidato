import type { Metadata } from "next";
import { CabecalhoEtapa } from "@/components/CabecalhoEtapa";
import { CargoCard } from "@/components/CargoCard";
import { EtapaNav } from "@/components/EtapaNav";
import { Rodape } from "@/components/Rodape";
import { lerNoticias, listarGovernadores } from "@/lib/candidatos";

export const metadata: Metadata = {
  title: "Governador do DF em 2026 — O Candidato",
  description:
    "Quem disputa o Governo do Distrito Federal em 2026, em ordem alfabética e com o registro oficial no TSE.",
};

export default function PaginaGovernador() {
  const candidatos = listarGovernadores();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <CabecalhoEtapa
        atual="governador"
        titulo="Quem disputa o Governo do DF em 2026"
        descricao={`${candidatos.length} candidaturas registradas no TSE para o Governo do Distrito Federal, em ordem alfabética. Sem ranking e sem opinião — só o registro oficial.`}
      />

      <section
        aria-labelledby="titulo-governador"
        className="acima-do-grao mx-auto w-full max-w-6xl px-5 pb-12 sm:px-6"
      >
        <h2 id="titulo-governador" className="sr-only">
          Candidatos a Governador do DF
        </h2>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {candidatos.map((candidato) => (
            <li key={candidato.nome} className="flex">
              <CargoCard
                candidato={candidato}
                linhaSecundaria={
                  candidato.vice ? `Vice: ${candidato.vice}` : undefined
                }
              />
            </li>
          ))}
        </ul>

        <EtapaNav atual="governador" />
      </section>

      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
