<!-- Main Component -->
<main class="max-w-4xl mx-auto px-4 pb-24 mt-6 flex-1">
    
    <!-- Mode Switcher Tabs -->
    <div class="flex items-center justify-center mb-6">
        <div class="glass p-1.5 rounded-2xl flex items-center gap-1 border border-white/5 bg-slate-950/60 shadow-lg">
            <button type="button" id="tabModeSingle" onclick="app.setMode('single')" class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-sky-500 text-white shadow-md shadow-sky-500/25 cursor-pointer">
                <span>🎙️</span> Voz Única (Narração)
            </button>
            <button type="button" id="tabModeDialogue" onclick="app.setMode('dialogue')" class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer">
                <span>🎭</span> Modo Diálogo (Multi-Vozes)
            </button>
        </div>
    </div>

    <!-- 1. Text Input Area (Single Voice Mode) -->
    <section id="singleVoiceInputSection" class="glass-strong rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden border border-sky-500/15 shadow-xl transition-all">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 class="text-lg font-bold text-white flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </div>
                Conteúdo para Locução
            </h2>
            <div class="flex items-center gap-2">
                <span id="readingTimeEstimate" class="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ⏱️ ~0s de fala
                </span>
                <div id="charCounter" class="text-xs font-mono text-sky-400 bg-black/40 px-3 py-1 rounded-full border border-sky-500/20">
                    0 / 4096
                </div>
            </div>
        </div>

        <!-- Drag & Drop container for text file upload -->
        <div id="dropZoneContainer" class="relative group">
            <textarea 
                id="textInput" 
                rows="6" 
                placeholder="Cole seu roteiro ou texto aqui para transformar em voz ultra-realista... (Você também pode arrastar um arquivo .txt, .md ou .srt aqui dentro)"
                class="w-full rounded-2xl p-5 text-sm md:text-base leading-relaxed resize-none transition-all placeholder:text-gray-500 bg-black/40 border border-white/10 focus:border-sky-500 outline-none"
                maxlength="4096"
            ></textarea>
            <input type="file" id="fileInput" accept=".txt,.md,.srt,.vtt" class="hidden" onchange="app.handleFileSelect(event)">
        </div>

        <!-- Quick Actions & Utilities -->
        <div class="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
            <div class="flex items-center gap-2 flex-wrap">
                <button type="button" onclick="app.clearText()" class="glass border-white/5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5">
                    <span>🧹</span> Limpar
                </button>
                <button type="button" onclick="app.insertSample()" class="glass border-white/5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5">
                    <span>💡</span> Exemplo
                </button>
                <button type="button" onclick="document.getElementById('fileInput').click()" class="glass border-sky-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all flex items-center gap-1.5">
                    <span>📁</span> Carregar Arquivo (.txt / .md)
                </button>
            </div>
            
            <button type="button" onclick="app.optimizeTextForSpeech()" class="glass bg-sky-500/10 border-sky-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold text-sky-300 hover:text-white hover:bg-sky-500/30 transition-all flex items-center gap-1.5 shadow-sm" title="Ajusta pontuações e pausas para o tom mais natural da IA">
                <span>✨</span> Otimizar para Locução
            </button>
        </div>
    </section>

    <!-- 2. Dialogue / Multi-Voice Mode Section (Initially Hidden) -->
    <section id="dialogueSection" class="glass-strong rounded-3xl p-6 md:p-8 mb-8 border border-sky-500/20 shadow-xl hidden">
        <div class="flex items-center justify-between mb-5">
            <div>
                <h2 class="text-lg font-bold text-white flex items-center gap-2">
                    <span>🎭</span> Roteiro em Diálogo (Podcast / Conversa)
                </h2>
                <p class="text-xs text-gray-400 mt-1">Defina diferentes personagens e vozes para cada fala.</p>
            </div>
            <button type="button" onclick="app.addDialogueBlock()" class="glass bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-sky-500/30">
                <span>+</span> Adicionar Fala
            </button>
        </div>

        <div id="dialogueBlocksList" class="space-y-4 mb-4">
            <!-- Injected via JS -->
        </div>
    </section>

    <!-- 3. Audio & Voice Settings Grid -->
    <div class="glass-strong rounded-3xl p-6 md:p-8 border border-white/5 mb-8 shadow-xl">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
            Configurações da Voz & Estúdio
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
            <!-- Speed -->
            <div>
                <div class="flex justify-between mb-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Velocidade</label>
                    <span id="speedVal" class="text-sky-400 font-mono text-xs font-bold">1.0x</span>
                </div>
                <input type="range" id="speedSlider" min="0.25" max="4.0" step="0.25" value="1.0" class="w-full h-2 bg-sky-950 rounded-lg appearance-none cursor-pointer accent-sky-500">
            </div>

            <!-- Output Format -->
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Formato de Saída</label>
                <select id="formatSelect" class="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-2.5 px-3.5 text-xs font-medium text-white focus:border-sky-500 outline-none">
                    <option value="mp3">MP3 (Universal)</option>
                    <option value="opus">Opus (Alta Qualidade)</option>
                    <option value="aac">AAC (Apple)</option>
                    <option value="flac">FLAC (Lossless)</option>
                </select>
            </div>

            <!-- AI Model -->
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Modelo de IA</label>
                <select id="modelSelect" class="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-2.5 px-3.5 text-xs font-medium text-white focus:border-sky-500 outline-none">
                    <option value="tts-1">Rápido (Padrão)</option>
                    <option value="tts-1-hd">HD (Voz Cristalina)</option>
                </select>
            </div>

            <!-- Background Music (BGM) -->
            <div>
                <div class="flex justify-between mb-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trilha de Fundo</label>
                    <span id="bgmVolumeVal" class="text-sky-400 font-mono text-[10px]">15%</span>
                </div>
                <select id="bgmSelect" class="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-2.5 px-3 text-xs font-medium text-white focus:border-sky-500 outline-none mb-2">
                    <option value="none">🔇 Sem Trilha</option>
                    <option value="lofi">☕ Lo-Fi Suave</option>
                    <option value="corporate">📈 Corporativo / Tech</option>
                    <option value="cinematic">🌌 Cinemático Suave</option>
                    <option value="meditation">🌿 Meditação / Zen</option>
                </select>
            </div>
        </div>
    </div>

    <!-- 4. Voices Grid (Single Voice Mode) -->
    <div id="voicesGridSection" class="space-y-4 mb-10">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <span class="text-sky-400">🎤</span> Vozes Disponíveis
            </h2>
            <span class="text-[11px] text-gray-400">Clique em <strong class="text-sky-400">▶</strong> para ouvir uma demonstração grátis</span>
        </div>
        <div id="voiceGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <!-- Voices injected via lib_app.js -->
        </div>
    </div>

    <!-- 5. Main Action Button -->
    <div class="flex justify-center mb-14">
        <button id="generateBtn" onclick="app.generateAudio()" class="w-full max-w-md py-5 rounded-3xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-700 text-white font-black text-base shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] cursor-pointer border border-sky-400/20">
            PRODUZIR ÁUDIO AGORA
        </button>
    </div>

    <!-- 6. Studio Audio Player & Waveform Section (Hidden until produced) -->
    <section id="outputContainer" class="hidden animate-in fade-in slide-in-from-bottom-5 duration-700 mb-14">
        <div class="glass-strong rounded-3xl p-6 md:p-8 border border-sky-500/30 shadow-2xl relative overflow-hidden bg-slate-950/80">
            
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                    <div class="flex items-center gap-2.5 mb-1">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h2 class="text-xl font-black text-white">Seu Áudio está Pronto!</h2>
                    </div>
                    <p class="text-xs text-gray-400">Ouça o resultado com o visualizador interativo ou faça o download.</p>
                </div>
                
                <a id="downloadLink" href="#" download class="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Baixar Arquivo
                </a>
            </div>

            <!-- Waveform Canvas Interactive Component -->
            <div class="relative bg-black/50 rounded-2xl p-4 border border-white/5 mb-6 group cursor-pointer" id="waveformWrapper">
                <canvas id="waveformCanvas" class="w-full h-24 block rounded-lg"></canvas>
                <div id="waveformHoverTime" class="absolute top-2 font-mono text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded shadow pointer-events-none hidden">00:00</div>
            </div>

            <!-- Studio Controls Bar -->
            <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                <div class="flex items-center gap-3">
                    <!-- Jump -5s -->
                    <button type="button" onclick="app.seekRelative(-5)" class="glass-btn p-2 rounded-xl text-gray-400 hover:text-white text-xs" title="Voltar 5 segundos">
                        ⏪ -5s
                    </button>
                    <!-- Play/Pause -->
                    <button type="button" id="btnPlayPause" onclick="app.togglePlayPause()" class="w-12 h-12 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 text-lg transition-transform active:scale-95 cursor-pointer">
                        ▶
                    </button>
                    <!-- Jump +5s -->
                    <button type="button" onclick="app.seekRelative(5)" class="glass-btn p-2 rounded-xl text-gray-400 hover:text-white text-xs" title="Avançar 5 segundos">
                        +5s ⏩
                    </button>
                    <!-- Time Display -->
                    <div class="font-mono text-xs text-gray-300 ml-2">
                        <span id="audioCurrentTime" class="text-sky-400 font-bold">00:00</span>
                        <span class="opacity-40">/</span>
                        <span id="audioTotalDuration">00:00</span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <!-- Speed Selector Pills -->
                    <div class="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button type="button" onclick="app.setPlaybackRate(1.0)" class="speed-pill active px-2 py-1 rounded-lg text-[10px] font-bold text-sky-400">1x</button>
                        <button type="button" onclick="app.setPlaybackRate(1.25)" class="speed-pill px-2 py-1 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white">1.25x</button>
                        <button type="button" onclick="app.setPlaybackRate(1.5)" class="speed-pill px-2 py-1 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white">1.5x</button>
                        <button type="button" onclick="app.setPlaybackRate(2.0)" class="speed-pill px-2 py-1 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white">2x</button>
                    </div>

                    <!-- Volume Toggle -->
                    <button type="button" id="btnMuteToggle" onclick="app.toggleMute()" class="glass-btn p-2 rounded-xl text-sm" title="Mudo">
                        🔊
                    </button>
                </div>
            </div>

            <!-- Native Audio element (hidden, controlled by custom player) -->
            <audio id="mainAudio" class="hidden"></audio>
        </div>
    </section>

    <!-- 7. Production History & Batch ZIP Export Section -->
    <section id="historySection" class="glass-strong rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl mb-12 hidden">
        <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
                <h2 class="text-base font-bold text-white flex items-center gap-2">
                    <span>📂</span> Histórico de Produções da Sessão (<span id="historyCount">0</span>)
                </h2>
                <p class="text-xs text-gray-400 mt-0.5">Acesse seus áudios recentes ou baixe tudo em um único arquivo compactado.</p>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="app.downloadAllZip()" class="glass bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-sky-500/30 flex items-center gap-1.5 shadow-sm">
                    <span>📦</span> Baixar Todos (.ZIP)
                </button>
                <button type="button" onclick="app.clearHistory()" class="glass border-white/5 text-gray-400 hover:text-red-400 px-3 py-2 rounded-xl text-xs font-semibold transition-all">
                    Limpar
                </button>
            </div>
        </div>

        <div id="historyList" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Audio history cards injected via lib_app.js -->
        </div>
    </section>
</main>

<!-- Modals & Overlays -->
<div id="modalOverlay" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] hidden flex items-center justify-center p-4">
    <!-- Login / PIX Payment modal content dynamically rendered here -->
</div>

<!-- Toast Notification Container -->
<div id="toastContainer" class="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 max-w-sm pointer-events-none"></div>
