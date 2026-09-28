<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Termos de Uso — TalkMotion</title>
  <meta name="description" content="Termos de Uso e Condições de Serviço do TalkMotion. Licença de uso de vozes e responsabilidade no ecossistema 4uLabs.">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style_main.css?v=<?php echo $assetVersion; ?>">
</head>
<body class="dark bg-grid min-h-screen flex flex-col text-slate-200">
  <header class="py-6 px-4 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <a href="index.php" class="flex items-center gap-3 group text-decoration-none">
        <img src="icon-192.png?v=<?php echo $assetVersion; ?>" alt="TalkMotion" class="w-10 h-10 rounded-xl shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
        <div>
          <h1 class="text-xl font-bold gradient-text">TalkMotion</h1>
          <p class="text-[10px] text-gray-400 tracking-widest uppercase">IA de Voz e Vídeo Professional</p>
        </div>
      </a>
      <a href="index.php" class="glass px-4 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:text-white transition-all flex items-center gap-2">
        <span>←</span> Voltar ao App
      </a>
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 py-12 flex-1">
    <div class="glass-strong rounded-3xl p-8 md:p-12 border border-sky-500/20 shadow-2xl">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-3xl">📜</span>
        <h1 class="text-2xl md:text-3xl font-black text-white">Termos de Uso</h1>
      </div>
      <p class="text-xs text-sky-400 font-mono mb-8">Última atualização: <?php echo date('d/m/Y'); ?> &bull; Ecossistema 4U.IA.BR</p>

      <div class="space-y-6 text-sm text-gray-300 leading-relaxed">
        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">1.</span> Aceitação dos Termos</h2>
          <p>Ao utilizar o <strong>TalkMotion</strong>, você concorda expressamente com os presentes Termos de Uso. Caso não concorde com qualquer cláusula, solicitamos a descontinuação imediata do uso do serviço.</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">2.</span> Direitos sobre o Conteúdo Produzido</h2>
          <p>Você retém a titularidade total sobre os textos submetidos e recebe licença irrestrita de uso comercial e pessoal sobre os arquivos de áudio gerados através dos seus créditos (vídeos no YouTube, TikTok, anúncios publicitários, audiolivros, podcasts e cursos).</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">3.</span> Uso Proibido e Ética</h2>
          <p>É estritamente proibido utilizar o TalkMotion para:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-400">
            <li>Fraudes, golpes, spoofing ou simulação da voz de pessoas reais sem consentimento explícito (deepfake malicioso).</li>
            <li>Disseminação de discurso de ódio, assédio, difamação ou desinformação eleitoral.</li>
            <li>Violação de direitos autorais de terceiros.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">4.</span> Créditos de IA e Pagamentos</h2>
          <p>A produção de áudios é tarifada por créditos de IA. As recargas realizadas via PIX são processadas pelo Mercado Pago e creditadas imediatamente. Os créditos não possuem prazo de validade estipulado e são cumulativos.</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">5.</span> Disponibilidade do Serviço</h2>
          <p>Nos empenhamos para manter o TalkMotion disponível 24 horas por dia, 7 dias por semana. No entanto, por depender de conexões de rede e APIs neurais de parceiros globais, interrupções temporárias programadas para manutenção podem ocorrer.</p>
        </section>
      </div>
    </div>
  </main>

  <footer class="py-6 text-center text-gray-500 text-xs border-t border-white/5">
    &copy; <?php echo date('Y'); ?> TalkMotion &bull; Desenvolvido por <a href="https://4u.ia.br" class="text-sky-400 hover:underline">4U.IA.BR</a>
  </footer>
</body>
</html>
