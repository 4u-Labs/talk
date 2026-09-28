<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Política de Privacidade — TalkMotion</title>
  <meta name="description" content="Política de Privacidade do TalkMotion. Transparência, criptografia e proteção de dados no ecossistema 4uLabs.">
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
        <span class="text-3xl">🛡️</span>
        <h1 class="text-2xl md:text-3xl font-black text-white">Política de Privacidade</h1>
      </div>
      <p class="text-xs text-sky-400 font-mono mb-8">Última atualização: <?php echo date('d/m/Y'); ?> &bull; Conformidade LGPD & GDPR</p>

      <div class="space-y-6 text-sm text-gray-300 leading-relaxed">
        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">1.</span> Compromisso com a Privacidade</h2>
          <p>O <strong>TalkMotion</strong> (desenvolvido no ecossistema <strong>4U.IA.BR</strong>) valoriza e respeita rigorosamente a privacidade dos seus usuários. Esta política descreve como tratamos informações e arquivos gerados pela nossa tecnologia de síntese de áudio com inteligência artificial.</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">2.</span> Dados Coletados</h2>
          <p>Coletamos exclusivamente as informações mínimas necessárias para a prestação do serviço:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-gray-400">
            <li><strong>Autenticação Unificada:</strong> Endereço de e-mail e nome público fornecidos via cadastro próprio ou autenticação Google OAuth 2.0 (Google Identity Services).</li>
            <li><strong>Textos Submetidos:</strong> Os textos inseridos na interface são transmitidos de forma criptografada para a API segura de conversão de voz e não são utilizados para treinamento de modelos de terceiros.</li>
            <li><strong>Controle de Saldo:</strong> Registro de transações de recarga de créditos (via Mercado Pago / PIX) e contagem de áudios gerados.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">3.</span> Retenção e Segurança dos Áudios</h2>
          <p>Os arquivos de áudio produzidos são armazenados temporariamente na pasta de cache do servidor para permitir download imediato e audição no player. O usuário pode salvar seus áudios diretamente no dispositivo ou no histórico local do navegador (localStorage).</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">4.</span> Login com Conta Google</h2>
          <p>Ao optar por entrar via <strong>Google Sign-In</strong>, acessamos apenas os dados básicos de perfil público (nome, e-mail e foto de perfil). Não temos acesso a contatos, mensagens, arquivos do Drive ou senhas da sua conta Google.</p>
        </section>

        <section>
          <h2 class="text-base font-bold text-white mb-2 flex items-center gap-2"><span class="text-sky-400">5.</span> Direitos do Usuário (LGPD)</h2>
          <p>Você tem o direito de solicitar a qualquer momento a exclusão completa da sua conta, histórico e dados armazenados, enviando uma solicitação através da nossa <a href="suporte.php" class="text-sky-400 hover:underline">Central de Suporte</a>.</p>
        </section>
      </div>
    </div>
  </main>

  <footer class="py-6 text-center text-gray-500 text-xs border-t border-white/5">
    &copy; <?php echo date('Y'); ?> TalkMotion &bull; Desenvolvido por <a href="https://4u.ia.br" class="text-sky-400 hover:underline">4U.IA.BR</a>
  </footer>
</body>
</html>
