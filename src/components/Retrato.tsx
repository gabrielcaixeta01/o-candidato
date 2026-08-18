import Image from "next/image";
import { iniciaisDe } from "@/lib/candidatos";
import { cn } from "@/lib/utils";
import type { Candidato } from "@/lib/types";

/**
 * Retrato em 3:4. Preto-e-branco por padrão, colorido no hover do card.
 *
 * Sem foto, cai num placeholder de iniciais com a mesma proporção e o mesmo
 * peso visual — nenhum candidato fica com card menor ou mais pobre por falta
 * de imagem, o que quebraria a diagramação idêntica.
 */
export function Retrato({
  candidato,
  className,
  sizes = "(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw",
}: {
  candidato: Candidato;
  className?: string;
  sizes?: string;
}) {
  const { foto, nome } = candidato;

  return (
    <div
      className={cn(
        "relative aspect-3/4 w-full overflow-hidden bg-tinta-600",
        className,
      )}
    >
      {foto ? (
        <Image
          src={foto.url}
          alt={`Retrato de ${nome}`}
          fill
          sizes={sizes}
          className={cn(
            "object-cover object-top",
            "grayscale transition-[filter,transform] duration-500 ease-out",
            "group-hover:grayscale-0 group-hover:scale-[1.03]",
            "group-focus-visible:grayscale-0",
          )}
        />
      ) : (
        <PlaceholderIniciais nome={nome} />
      )}

      {/* Degradê de base: assenta o texto do card sobre a imagem. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-tinta-800 to-transparent"
      />
    </div>
  );
}

function PlaceholderIniciais({ nome }: { nome: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 grid place-items-center bg-linear-to-br from-tinta-600 to-tinta-700"
    >
      <span className="font-serif text-5xl font-normal text-latao-500/35 select-none sm:text-6xl">
        {iniciaisDe(nome)}
      </span>
    </div>
  );
}

/** Crédito da foto. Obrigatório quando há imagem — exigência de licença. */
export function CreditoFotoLinha({ candidato }: { candidato: Candidato }) {
  if (!candidato.foto) return null;

  const { credito, licenca, origem } = candidato.foto;
  const texto = `Foto: ${credito} · ${licenca}`;

  return (
    <p className="text-[0.6875rem] text-muted-foreground">
      {origem ? (
        <a
          href={origem}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2 hover:text-latao-400"
        >
          {texto}
        </a>
      ) : (
        texto
      )}
    </p>
  );
}
