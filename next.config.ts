import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
      Sem `remotePatterns`: as fotos dos candidatos são versionadas em
      `public/candidatos/` e servidas pelo próprio site. Carregá-las direto do
      Wikimedia fazia o otimizador tomar HTTP 429 em cache frio, e uma foto que
      some quebra a paridade visual entre as candidaturas.
      Ao adicionar uma foto de host externo, declare o host aqui.
    */

    /*
      Os arquivos de origem têm 800px de largura e o maior slot de exibição é
      o card em ~336px (672px em telas 2x). Os padrões do Next iam até 3840px,
      gerando variantes que nunca seriam usadas.
    */
    deviceSizes: [384, 640, 750, 828],
    imageSizes: [48, 64, 96, 128, 256],
  },
};

export default nextConfig;
