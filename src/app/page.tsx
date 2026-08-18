import { Galeria } from "@/components/Galeria";
import { Hero } from "@/components/Hero";
import { Rodape } from "@/components/Rodape";
import { listarCalendario, listarCandidatos, lerNoticias } from "@/lib/candidatos";

export default function Home() {
  // Tudo vem de JSON versionado no repositório: a página é estática e o
  // conteúdo muda quando o cron semanal commita novos dados.
  const candidatos = listarCandidatos();
  const calendario = listarCalendario();
  const { atualizadoEm, porCandidato } = lerNoticias();

  return (
    <>
      <Hero calendario={calendario} />
      <Galeria candidatos={candidatos} noticiasPorCandidato={porCandidato} />
      <Rodape atualizadoEm={atualizadoEm} />
    </>
  );
}
