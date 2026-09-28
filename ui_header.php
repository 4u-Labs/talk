<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>TalkMotion — Vozes Profissionais com IA</title>
    
    <!-- PWA & Favicons -->
    <link rel="manifest" href="manifest.json?v=<?php echo time(); ?>">
    <meta name="theme-color" content="#070a14">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" type="image/svg+xml" href="<?php echo get_asset('favicon.svg'); ?>">
    <link rel="icon" type="image/x-icon" href="<?php echo get_asset('favicon.ico'); ?>">
    <link rel="icon" type="image/png" sizes="32x32" href="<?php echo get_asset('favicon-32x32.png'); ?>">
    <link rel="apple-touch-icon" sizes="192x192" href="<?php echo get_asset('icon-192.png'); ?>">

    <!-- Google Identity Services (GIS) para Login Google -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- CSS (Tailwind + Custom) -->
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="stylesheet" href="<?php echo get_asset('style_main.css'); ?>">
</head>
<body class="dark bg-grid overflow-x-hidden min-h-screen flex flex-col text-slate-100">
    <!-- Header Component -->
    <header class="py-5 px-4 backdrop-blur-md sticky top-0 z-50 transition-all border-b border-white/5 bg-slate-950/70">
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div id="logo-link" class="flex items-center gap-3 group cursor-pointer select-none" onclick="app.handleLogoClick()" title="TalkMotion Studio">
                <img src="<?php echo get_asset('icon-192.png'); ?>" alt="TalkMotion" class="w-10 h-10 rounded-xl shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform object-cover">
                <div>
                    <h1 class="text-xl font-bold gradient-text">TalkMotion</h1>
                    <p class="text-[10px] text-gray-400 tracking-widest uppercase font-mono">IA de Voz e Vídeo Professional</p>
                </div>
            </div>
            
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- PWA Install Button (hidden until eligible) -->
                <button id="btnInstallPwa" onclick="app.installPwa()" style="display:none;" class="glass px-3 py-2 rounded-xl text-xs font-bold text-sky-400 hover:text-white border border-sky-500/25 hover:border-sky-400 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                    <span>📥</span>
                    <span class="hidden sm:inline">Instalar App</span>
                </button>

                <!-- Theme Toggle -->
                <button id="themeToggle" onclick="app.toggleTheme()" class="glass-btn p-2 rounded-xl w-9 h-9 flex items-center justify-center hover:bg-white/10 transition-colors text-sm" title="Alternar Tema">
                    🌙
                </button>
                
                <!-- User Status / Credits Unificados -->
                <div id="unified-credits-badge" onclick="app.handleCreditsClick()" title="Clique para recarregar créditos" class="glass px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/5 hover:border-sky-500/30 cursor-pointer flex items-center gap-2 transition-all">
                    <img id="user-avatar" src="" alt="Avatar" class="w-5 h-5 rounded-full object-cover hidden border border-sky-400">
                    <span id="user-diamond-icon">💎</span>
                    <span id="user-credits-val" class="font-mono">...</span>
                </div>
                
                <button id="unified-login-btn" onclick="app.handleCreditsClick()" class="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer">
                    Entrar
                </button>
            </div>
        </div>
    </header>
