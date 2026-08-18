import { Galeria } from "@/components/Galeria";
import { Hero } from "@/components/Hero";
import { Rodape } from "@/components/Rodape";
import {
  lerNoticias,
  listarCalendario,
  listarCandidatos,
} from "@/lib/candidatos";

export default function Home() {
  // Tudo vem de JSON versionado no repositório: a página é estática e o
  // conteúdo muda quando o cron semanal commita novos dados.
  const candidatos = listarCandidatos();
  const calendario = listarCalendario();
  const { atualizadoEm } = lerNoticias();

  return (
    <>
      <Hero calendario={calendario} totalCandidaturas={candidatos.length} />
      <Galeria candidatos={candidatos} />
      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
