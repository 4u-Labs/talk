<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();
$msgSent = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = htmlspecialchars(trim($_POST['nome'] ?? ''));
    $email = htmlspecialchars(trim($_POST['email'] ?? ''));
    $msg = htmlspecialchars(trim($_POST['mensagem'] ?? ''));
    if ($email && $msg) {
        $msgSent = true;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Central de Suporte — TalkMotion</title>
  <meta name="description" content="Central de Ajuda e Suporte do TalkMotion. Tire dúvidas sobre vozes, créditos, pagamentos PIX e integrações no ecossistema 4uLabs.">
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
        <span class="text-3xl">💬</span>
        <h1 class="text-2xl md:text-3xl font-black text-white">Central de Ajuda & Suporte</h1>
      </div>
      <p class="text-xs text-sky-400 font-mono mb-8">Atendimento rápido e perguntas frequentes sobre o TalkMotion</p>

      <!-- FAQ Section -->
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-sky-400">❓</span> Perguntas Frequentes (FAQ)
      </h2>

      <div class="space-y-4 mb-10">
        <details class="glass p-4 rounded-2xl border border-white/5 group cursor-pointer">
          <summary class="font-bold text-sm text-white flex justify-between items-center list-none">
            <span>Como funciona o saldo de créditos?</span>
            <span class="text-sky-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p class="text-xs text-gray-400 mt-3 leading-relaxed">
            Cada geração completa de áudio consome 1 crédito. Ao se cadastrar, você ganha 10 créditos grátis. Você pode recarregar novos pacotes via PIX instantâneo no botão de créditos no topo.
          </p>
        </details>

        <details class="glass p-4 rounded-2xl border border-white/5 group cursor-pointer">
          <summary class="font-bold text-sm text-white flex justify-between items-center list-none">
            <span>Ouvir as amostras (previews) gasta créditos?</span>
            <span class="text-sky-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p class="text-xs text-gray-400 mt-3 leading-relaxed">
            Não! Você pode clicar no botão ▶ de qualquer uma das vozes para ouvir uma demonstração gratuita quantas vezes quiser.
          </p>
        </details>

        <details class="glass p-4 rounded-2xl border border-white/5 group cursor-pointer">
          <summary class="font-bold text-sm text-white flex justify-between items-center list-none">
            <span>Posso usar os áudios no YouTube, TikTok e anúncios?</span>
            <span class="text-sky-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p class="text-xs text-gray-400 mt-3 leading-relaxed">
            Sim! Os arquivos gerados possuem licença livre para uso pessoal e comercial sem restrições ou royalties adicionais.
          </p>
        </details>

        <details class="glass p-4 rounded-2xl border border-white/5 group cursor-pointer">
          <summary class="font-bold text-sm text-white flex justify-between items-center list-none">
            <span>Como funciona o Login com Conta Google?</span>
            <span class="text-sky-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p class="text-xs text-gray-400 mt-3 leading-relaxed">
            Basta clicar em "Entrar com o Google" na janela de login. Sua conta unificada 4uLabs é criada instantaneamente com 10 créditos de bônus e você não precisa decorar senhas.
          </p>
        </details>
      </div>

      <!-- Contact Form -->
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-sky-400">✉️</span> Enviar uma Mensagem
      </h2>

      <?php if ($msgSent): ?>
        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6 flex items-center gap-3">
          <span>✅</span> Mensagem enviada com sucesso! Nossa equipe retornará no seu e-mail em breve.
        </div>
      <?php endif; ?>

      <form method="POST" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Seu Nome</label>
          <input type="text" name="nome" required placeholder="Como podemos te chamar?" class="w-full bg-slate-950/80 border border-sky-500/20 text-white rounded-2xl py-3 px-4 outline-none focus:border-sky-500 transition-all text-xs">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Seu E-mail</label>
          <input type="email" name="email" required placeholder="seuemail@exemplo.com" class="w-full bg-slate-950/80 border border-sky-500/20 text-white rounded-2xl py-3 px-4 outline-none focus:border-sky-500 transition-all text-xs">
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Mensagem ou Dúvida</label>
          <textarea name="mensagem" rows="4" required placeholder="Descreva sua dúvida, sugestão ou solicitação de suporte..." class="w-full bg-slate-950/80 border border-sky-500/20 text-white rounded-2xl p-4 outline-none focus:border-sky-500 transition-all text-xs resize-none"></textarea>
        </div>
        <button type="submit" class="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-sky-500/20 cursor-pointer">
          Enviar Mensagem
        </button>
      </form>
    </div>
  </main>

  <footer class="py-6 text-center text-gray-500 text-xs border-t border-white/5">
    &copy; <?php echo date('Y'); ?> TalkMotion &bull; Desenvolvido por <a href="https://4u.ia.br" class="text-sky-400 hover:underline">4U.IA.BR</a>
  </footer>
</body>
</html>
