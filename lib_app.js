/**
 * TalkMotion 2.0 - Lógica Principal da Aplicação
 * IA de Voz e Vídeo Profissional & Estúdio de Locução
 * 4U.IA.BR
 */

window.appState = {
    credits: 0,
    user: null,
    selectedVoice: 'onyx',
    mode: 'single', // 'single' ou 'dialogue'
    isPlayingPreview: false,
    isGenerating: false,
    token: localStorage.getItem('keepai_token') || null,
    voices: [
        { id: 'onyx', name: 'Onyx', gender: 'male', tags: ['Grave', 'Sério'], desc: 'Voz autoritária e profunda' },
        { id: 'nova', name: 'Nova', gender: 'female', tags: ['Jovem', 'Energética'], desc: 'Voz radiante e moderna' },
        { id: 'shimmer', name: 'Shimmer', gender: 'female', tags: ['Clara', 'Doce'], desc: 'Voz suave e empática' },
        { id: 'alloy', name: 'Alloy', gender: 'neutral', tags: ['Neutro', 'Equilibrado'], desc: 'Voz versátil de uso geral' },
        { id: 'echo', name: 'Echo', gender: 'male', tags: ['Natural', 'Calmo'], desc: 'Voz realista para narração' },
        { id: 'fable', name: 'Fable', gender: 'male', tags: ['Expressivo', 'Contador'], desc: 'Voz dramática e envolvente' }
    ],
    dialogueBlocks: [
        { id: 1, voice: 'onyx', text: 'Olá e bem-vindo ao TalkMotion Studio!' },
        { id: 2, voice: 'nova', text: 'Aqui você pode criar podcasts e diálogos com múltiplas vozes neurais realistas.' }
    ],
    audioHistory: JSON.parse(localStorage.getItem('talkmotion_history') || '[]'),
    currentAudioUrl: null,
    currentAudioDuration: 0,
    playbackRate: 1.0,
    audioContext: null,
    audioBuffer: null,
    waveformPeaks: [],
    bgmNode: null,
    bgmGainNode: null
};

const app = {
    clickCount: 0,
    lastClickTime: 0,
    deferredPrompt: null,
    googleTokenClient: null,
    GOOGLE_CLIENT_ID: '569266864432-pd09jbb5no9ekdhdr018fj643nopp817.apps.googleusercontent.com',

    init() {
        this.renderVoices();
        this.renderDialogueBlocks();
        this.setupBindings();
        this.setupPwa();
        this.setupDragAndDrop();
        this.setupStudioPlayer();
        this.syncCredits();
        this.loadTheme();
        this.setupDevMode();
        this.renderHistory();
        this.initGoogleAuth();
        console.log('TalkMotion 2.0 Inicializado com Sucesso 🚀');
    },

    // =============================================
    // 1. GOOGLE IDENTITY SERVICES (GIS)
    // =============================================
    initGoogleAuth() {
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
            // Tentar novamente se o script ainda não carregou
            setTimeout(() => {
                if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                    this.initGoogleAuth();
                }
            }, 800);
            return;
        }

        try {
            this.googleTokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
                callback: async (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        try {
                            this.toast('Autenticando com o Google...', 'info');
                            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                            });
                            const googleUser = await res.json();
                            await this.handleGoogleLoginSuccess(googleUser);
                        } catch (err) {
                            console.error('Erro ao obter perfil Google:', err);
                            this.toast('Falha ao obter dados da conta Google', 'error');
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Falha ao inicializar Google Client:', e);
        }
    },

    loginWithGoogle() {
        if (!this.googleTokenClient) {
            this.initGoogleAuth();
        }
        if (this.googleTokenClient) {
            this.googleTokenClient.requestAccessToken({ prompt: 'select_account' });
        } else {
            this.toast('Aguarde o carregamento do serviço Google ou tente novamente.', 'info');
        }
    },

    async handleGoogleLoginSuccess(googleUser) {
        try {
            const resp = await fetch('../keepai/api/auth.php?action=google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: googleUser.email,
                    name: googleUser.name,
                    picture: googleUser.picture
                })
            });

            const data = await resp.json();
            if (data.success && data.token) {
                localStorage.setItem('keepai_token', data.token);
                window.appState.token = data.token;
                window.appState.credits = data.user.credits;
                window.appState.user = data.user;
                this.updateCreditsUI();
                this.closeModal();
                this.toast(`Bem-vindo, ${data.user.display_name || googleUser.name}! (${data.user.credits} créditos)`, 'success');
            } else {
                throw new Error(data.error || 'Erro na autenticação Google');
            }
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    // =============================================
    // 2. PWA SETUP
    // =============================================
    setupPwa() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('btnInstallPwa');
            if (btn) btn.style.display = 'inline-flex';
        });

        window.addEventListener('appinstalled', () => {
            const btn = document.getElementById('btnInstallPwa');
            if (btn) btn.style.display = 'none';
            this.toast('TalkMotion instalado na sua área de trabalho!', 'success');
        });

        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('SW reg error:', err);
            });
        }
    },

    installPwa() {
        if (!this.deferredPrompt) {
            this.toast('Aplicativo já instalado ou não compatível com instalação direta.', 'info');
            return;
        }
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                this.toast('TalkMotion instalado com sucesso!', 'success');
            }
            this.deferredPrompt = null;
            const btn = document.getElementById('btnInstallPwa');
            if (btn) btn.style.display = 'none';
        });
    },

    // =============================================
    // 3. MODO DE OPERAÇÃO: ÚNICO vs DIÁLOGO
    // =============================================
    setMode(mode) {
        window.appState.mode = mode;
        const btnSingle = document.getElementById('tabModeSingle');
        const btnDialogue = document.getElementById('tabModeDialogue');
        const secSingle = document.getElementById('singleVoiceInputSection');
        const secDialogue = document.getElementById('dialogueSection');
        const secVoicesGrid = document.getElementById('voicesGridSection');

        if (mode === 'single') {
            btnSingle.className = 'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-sky-500 text-white shadow-md shadow-sky-500/25 cursor-pointer';
            btnDialogue.className = 'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer';
            secSingle.classList.remove('hidden');
            secDialogue.classList.add('hidden');
            secVoicesGrid.classList.remove('hidden');
        } else {
            btnDialogue.className = 'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-sky-500 text-white shadow-md shadow-sky-500/25 cursor-pointer';
            btnSingle.className = 'px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer';
            secSingle.classList.add('hidden');
            secDialogue.classList.remove('hidden');
            secVoicesGrid.classList.add('hidden');
        }
    },

    renderDialogueBlocks() {
        const list = document.getElementById('dialogueBlocksList');
        if (!list) return;

        list.innerHTML = window.appState.dialogueBlocks.map((block, idx) => `
            <div class="dialogue-block rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-start md:items-center relative group" data-block-id="${block.id}">
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-mono text-xs font-bold flex items-center justify-center">${idx + 1}</span>
                    <select onchange="app.updateDialogueVoice(${block.id}, this.value)" class="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white outline-none">
                        ${window.appState.voices.map(v => `<option value="${v.id}" ${v.id === block.voice ? 'selected' : ''}>${v.name} (${v.gender === 'male' ? 'Masc' : 'Fem'})</option>`).join('')}
                    </select>
                </div>
                <input type="text" value="${this.escapeHtml(block.text)}" oninput="app.updateDialogueText(${block.id}, this.value)" placeholder="Fala deste personagem..." class="flex-1 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none w-full">
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button type="button" onclick="app.previewDialogueLine(${block.id})" class="glass-btn p-1.5 rounded-xl text-sky-400 hover:text-white text-xs" title="Ouvir teste desta fala">▶</button>
                    <button type="button" onclick="app.removeDialogueBlock(${block.id})" class="text-gray-400 hover:text-red-400 p-1.5 rounded transition-colors text-sm" title="Remover fala">✕</button>
                </div>
            </div>
        `).join('');
    },

    async previewDialogueLine(id) {
        if (!this.requireLogin()) return;
        const b = window.appState.dialogueBlocks.find(x => x.id === id);
        if (!b || !b.text.trim()) {
            this.toast('Digite o texto desta fala primeiro para ouvir o teste.', 'info');
            return;
        }

        const btn = event?.currentTarget;
        if (btn) btn.innerHTML = `<span class="spinner w-3 h-3 border-2" style="border-width: 1px;"></span>`;

        try {
            const resp = await fetch('api_tts.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`
                },
                body: JSON.stringify({
                    text: b.text.trim(),
                    voice: b.voice,
                    speed: parseFloat(document.getElementById('speedSlider')?.value || 1.0),
                    model: 'tts-1',
                    format: 'mp3',
                    preview: true
                })
            });

            const data = await resp.json();
            if (data.success && data.audio_url) {
                const a = new Audio(data.audio_url);
                a.play();
            } else {
                this.toast(data.error || 'Erro no preview', 'error');
            }
        } catch (e) {
            this.toast('Falha ao gerar teste de voz', 'error');
        } finally {
            if (btn) btn.innerHTML = '▶';
        }
    },

    addDialogueBlock() {
        const newId = Date.now();
        const availableVoices = ['onyx', 'nova', 'echo', 'shimmer', 'fable', 'alloy'];
        const currentCount = window.appState.dialogueBlocks.length;
        const voice = availableVoices[currentCount % availableVoices.length];
        window.appState.dialogueBlocks.push({ id: newId, voice, text: '' });
        this.renderDialogueBlocks();
    },

    removeDialogueBlock(id) {
        if (window.appState.dialogueBlocks.length <= 1) {
            this.toast('É necessário pelo menos uma fala no diálogo.', 'info');
            return;
        }
        window.appState.dialogueBlocks = window.appState.dialogueBlocks.filter(b => b.id !== id);
        this.renderDialogueBlocks();
    },

    updateDialogueVoice(id, voice) {
        const b = window.appState.dialogueBlocks.find(x => x.id === id);
        if (b) b.voice = voice;
    },

    updateDialogueText(id, text) {
        const b = window.appState.dialogueBlocks.find(x => x.id === id);
        if (b) b.text = text;
    },

    // =============================================
    // 4. TEXT UTILITIES & IMPORT
    // =============================================
    setupDragAndDrop() {
        const container = document.getElementById('dropZoneContainer');
        const input = document.getElementById('textInput');
        if (!container || !input) return;

        ['dragenter', 'dragover'].forEach(name => {
            container.addEventListener(name, (e) => {
                e.preventDefault();
                container.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            container.addEventListener(name, (e) => {
                e.preventDefault();
                container.classList.remove('dragover');
            });
        });

        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                this.readFile(files[0]);
            }
        });
    },

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.readFile(file);
            event.target.value = '';
        }
    },

    readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            let content = e.target.result || '';
            // Se for arquivo de legenda (.srt), limpa números e timestamps
            if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
                content = content.replace(/\d+\r?\n\d{2}:\d{2}:\d{2}[,\.]\d{3} --> \d{2}:\d{2}:\d{2}[,\.]\d{3}\r?\n/g, '')
                                 .replace(/^\d+$/gm, '')
                                 .replace(/\n\s*\n/g, '\n');
            }
            const input = document.getElementById('textInput');
            if (input) {
                input.value = content.trim();
                input.dispatchEvent(new Event('input'));
                this.toast(`Arquivo "${file.name}" carregado com sucesso!`, 'success');
            }
        };
        reader.onerror = () => {
            this.toast('Erro ao ler arquivo de texto.', 'error');
        };
        reader.readAsText(file);
    },

    updateReadingMetrics() {
        const text = document.getElementById('textInput')?.value || '';
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const speed = parseFloat(document.getElementById('speedSlider')?.value) || 1.0;
        
        // Média de fala: ~140 palavras por minuto em velocidade 1.0x
        const totalSeconds = Math.round((words / (140 * speed)) * 60);
        let timeStr = '~0s de fala';

        if (totalSeconds > 0) {
            if (totalSeconds < 60) {
                timeStr = `⏱️ ~${totalSeconds}s de fala`;
            } else {
                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                timeStr = `⏱️ ~${mins}m ${secs > 0 ? secs + 's' : ''} de fala`;
            }
        }

        const estimateEl = document.getElementById('readingTimeEstimate');
        if (estimateEl) estimateEl.textContent = timeStr;
    },

    optimizeTextForSpeech() {
        const input = document.getElementById('textInput');
        if (!input || !input.value.trim()) {
            this.toast('Digite ou cole um texto primeiro para otimizar.', 'info');
            return;
        }

        let txt = input.value;
        // 1. Expansão de abreviações comuns para pronúncia correta
        const abbrev = {
            '\\bvc\\b': 'você',
            '\\btb\\b': 'também',
            '\\btbm\\b': 'também',
            '\\bp/\\b': 'para',
            '\\bpq\\b': 'porque',
            '\\bqnd\\b': 'quando',
            '\\bmsg\\b': 'mensagem',
            '\\bex:\\b': 'por exemplo:',
            '\\bobs:\\b': 'observação:',
            '\\bapp\\b': 'aplicativo',
            '\\bia\\b': 'inteligência artificial'
        };

        for (const [k, v] of Object.entries(abbrev)) {
            txt = txt.replace(new RegExp(k, 'gi'), v);
        }

        // 2. Ajuste de pontuações duplicadas e respiração
        txt = txt.replace(/[ \t]+/g, ' ')
                 .replace(/\.{2,}/g, '...')
                 .replace(/([a-zA-Z0-9])\n([a-zA-Z0-9])/g, '$1. $2');

        input.value = txt.trim();
        input.dispatchEvent(new Event('input'));
        this.toast('Texto otimizado para entonação natural da IA! ✨', 'success');
    },

    // =============================================
    // 5. STUDIO AUDIO PLAYER & WAVEFORM
    // =============================================
    setupStudioPlayer() {
        const audio = document.getElementById('mainAudio');
        const canvas = document.getElementById('waveformCanvas');
        const wrapper = document.getElementById('waveformWrapper');
        if (!audio || !canvas || !wrapper) return;

        audio.addEventListener('timeupdate', () => {
            const curTime = audio.currentTime || 0;
            const dur = audio.duration || window.appState.currentAudioDuration || 0;
            document.getElementById('audioCurrentTime').textContent = this.formatTime(curTime);
            if (dur > 0) {
                document.getElementById('audioTotalDuration').textContent = this.formatTime(dur);
            }
            this.drawWaveform(curTime / (dur || 1));
        });

        audio.addEventListener('loadedmetadata', () => {
            const dur = audio.duration;
            window.appState.currentAudioDuration = dur;
            document.getElementById('audioTotalDuration').textContent = this.formatTime(dur);
            this.drawWaveform(0);
        });

        audio.addEventListener('ended', () => {
            document.getElementById('btnPlayPause').textContent = '▶';
            this.drawWaveform(0);
        });

        // Waveform click seeking
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const dur = audio.duration || window.appState.currentAudioDuration || 0;
            if (dur > 0) {
                audio.currentTime = pos * dur;
                this.drawWaveform(pos);
            }
        });

        // Hover tooltip time display
        const hoverTimeEl = document.getElementById('waveformHoverTime');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const dur = audio.duration || window.appState.currentAudioDuration || 0;
            if (dur > 0 && hoverTimeEl) {
                hoverTimeEl.style.left = `${Math.min(e.clientX - rect.left, rect.width - 45)}px`;
                hoverTimeEl.textContent = this.formatTime(pos * dur);
                hoverTimeEl.classList.remove('hidden');
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if (hoverTimeEl) hoverTimeEl.classList.add('hidden');
        });
    },

    togglePlayPause() {
        const audio = document.getElementById('mainAudio');
        const btn = document.getElementById('btnPlayPause');
        if (!audio) return;

        if (audio.paused) {
            audio.play().then(() => {
                if (btn) btn.textContent = '⏸';
            }).catch(err => {
                console.warn('Erro ao reproduzir:', err);
            });
        } else {
            audio.pause();
            if (btn) btn.textContent = '▶';
        }
    },

    seekRelative(seconds) {
        const audio = document.getElementById('mainAudio');
        if (!audio) return;
        const dur = audio.duration || window.appState.currentAudioDuration || 0;
        audio.currentTime = Math.max(0, Math.min(dur, audio.currentTime + seconds));
    },

    setPlaybackRate(rate) {
        const audio = document.getElementById('mainAudio');
        if (audio) audio.playbackRate = rate;
        window.appState.playbackRate = rate;

        document.querySelectorAll('.speed-pill').forEach(pill => {
            if (pill.textContent.trim() === `${rate}x`) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    },

    toggleMute() {
        const audio = document.getElementById('mainAudio');
        const btn = document.getElementById('btnMuteToggle');
        if (!audio || !btn) return;
        audio.muted = !audio.muted;
        btn.textContent = audio.muted ? '🔇' : '🔊';
    },

    generateWaveformPeaks(bufferLength = 70) {
        // Gera picos estéticos balanceados para renderização
        const peaks = [];
        for (let i = 0; i < bufferLength; i++) {
            const val = 0.2 + Math.abs(Math.sin(i * 0.25) * Math.cos(i * 0.15)) * 0.75 + (Math.random() * 0.15);
            peaks.push(Math.min(1.0, val));
        }
        window.appState.waveformPeaks = peaks;
    },

    drawWaveform(progress = 0) {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.parentElement.clientWidth;
        const height = canvas.height = 96;

        ctx.clearRect(0, 0, width, height);

        if (!window.appState.waveformPeaks || window.appState.waveformPeaks.length === 0) {
            this.generateWaveformPeaks();
        }

        const peaks = window.appState.waveformPeaks;
        const barWidth = Math.max(2, (width / peaks.length) - 2.5);
        const centerY = height / 2;

        peaks.forEach((peak, i) => {
            const x = i * (barWidth + 2.5);
            const barHeight = Math.max(4, peak * (height - 16));
            const y1 = centerY - barHeight / 2;
            const barProgress = i / peaks.length;

            if (barProgress <= progress) {
                // Barra já reproduzida (Degradê Sky Blue / Ciano)
                const grad = ctx.createLinearGradient(0, y1, 0, y1 + barHeight);
                grad.addColorStop(0, '#38bdf8');
                grad.addColorStop(1, '#0284c7');
                ctx.fillStyle = grad;
            } else {
                // Barra restante (Slate / Glass)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
            }

            // Desenhar barra com cantos arredondados
            ctx.beginPath();
            ctx.roundRect(x, y1, barWidth, barHeight, [barWidth / 2]);
            ctx.fill();
        });

        // Indicador Playhead
        const playheadX = progress * width;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fillRect(Math.max(0, playheadX - 1), 0, 2, height);
        ctx.shadowBlur = 0;
    },

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // =============================================
    // 6. PRODUÇÃO DE ÁUDIO (ÚNICO E DIÁLOGO)
    // =============================================
    async generateAudio() {
        if (!this.requireLogin()) return;

        if (window.appState.credits < 1) {
            this.toast('Saldo de créditos de IA insuficiente!', 'error');
            this.openRechargeModal();
            return;
        }

        if (window.appState.mode === 'dialogue') {
            await this.generateDialogueAudio();
        } else {
            await this.generateSingleAudio();
        }
    },

    async generateSingleAudio() {
        const text = document.getElementById('textInput').value.trim();
        if (!text) return this.toast('Digite um texto primeiro!', 'error');

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;

        let seconds = 0;
        const timer = setInterval(() => {
            seconds++;
            btn.innerHTML = `<span class="spinner inline-block mr-2" style="width: 14px; height: 14px; border-width: 2px; vertical-align: middle;"></span> PRODUZINDO ÁUDIO... (${seconds}s)`;
        }, 1000);

        try {
            const params = {
                text: text,
                voice: window.appState.selectedVoice,
                speed: parseFloat(document.getElementById('speedSlider').value),
                model: document.getElementById('modelSelect').value,
                format: document.getElementById('formatSelect').value
            };

            const response = await fetch('api_tts.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`
                },
                body: JSON.stringify(params)
            });

            if (response.status === 401) {
                clearInterval(timer);
                this.toast('Sessão expirada. Faça login novamente.', 'error');
                this.logout();
                return;
            }

            if (response.status === 402) {
                clearInterval(timer);
                this.toast('Saldo insuficiente!', 'error');
                this.openRechargeModal();
                return;
            }

            const result = await response.json();

            if (result.success) {
                clearInterval(timer);
                window.appState.credits = result.credits_remaining;
                this.updateCreditsUI();

                const audioUrl = result.audio_url;
                window.appState.currentAudioUrl = audioUrl;

                const audio = document.getElementById('mainAudio');
                audio.src = audioUrl;
                document.getElementById('downloadLink').href = audioUrl;
                document.getElementById('outputContainer').classList.remove('hidden');
                document.getElementById('outputContainer').scrollIntoView({ behavior: 'smooth' });

                this.generateWaveformPeaks();
                this.drawWaveform(0);

                // Salvar no histórico
                this.addToHistory({
                    id: Date.now(),
                    text: text.substring(0, 75) + (text.length > 75 ? '...' : ''),
                    voice: window.appState.selectedVoice,
                    format: params.format,
                    audioUrl: audioUrl,
                    date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                });

                this.toast('Áudio produzido com sucesso! (1 crédito utilizado)', 'success');
            } else {
                throw new Error(result.error || 'Erro desconhecido');
            }
        } catch (e) {
            clearInterval(timer);
            this.toast(e.message, 'error');
            console.error(e);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'PRODUZIR ÁUDIO AGORA';
        }
    },

    async generateDialogueAudio() {
        const blocks = window.appState.dialogueBlocks.filter(b => b.text.trim().length > 0);
        if (blocks.length === 0) {
            this.toast('Adicione o texto das falas no diálogo primeiro!', 'error');
            return;
        }

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;

        let seconds = 0;
        const timer = setInterval(() => {
            seconds++;
            btn.innerHTML = `<span class="spinner inline-block mr-2" style="width: 14px; height: 14px; border-width: 2px; vertical-align: middle;"></span> COMPILANDO DIÁLOGO... (${seconds}s)`;
        }, 1000);

        try {
            // Em modo diálogo, compila o texto indicando o locutor ou gera o primeiro bloco
            const params = {
                mode: 'dialogue',
                blocks: blocks.map(b => ({ voice: b.voice, text: b.text.trim() })),
                speed: parseFloat(document.getElementById('speedSlider')?.value || 1.0),
                model: document.getElementById('modelSelect')?.value || 'tts-1',
                format: document.getElementById('formatSelect')?.value || 'mp3'
            };

            const response = await fetch('api_tts.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`
                },
                body: JSON.stringify(params)
            });

            const result = await response.json();
            if (result.success) {
                clearInterval(timer);
                window.appState.credits = result.credits_remaining;
                this.updateCreditsUI();

                const audioUrl = result.audio_url;
                window.appState.currentAudioUrl = audioUrl;

                const audio = document.getElementById('mainAudio');
                audio.src = audioUrl;
                document.getElementById('downloadLink').href = audioUrl;
                document.getElementById('outputContainer').classList.remove('hidden');
                document.getElementById('outputContainer').scrollIntoView({ behavior: 'smooth' });

                this.generateWaveformPeaks();
                this.drawWaveform(0);

                this.addToHistory({
                    id: Date.now(),
                    text: `[Diálogo] ${blocks.length} falas (${blocks.map(b => b.voice).join(', ')})`,
                    voice: 'Multi-Vozes',
                    format: params.format,
                    audioUrl: audioUrl,
                    date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                });

                this.toast('Diálogo produzido com sucesso! (1 crédito utilizado)', 'success');
            } else {
                throw new Error(result.error || 'Erro na compilação do diálogo');
            }
        } catch (e) {
            clearInterval(timer);
            this.toast(e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'PRODUZIR ÁUDIO AGORA';
        }
    },

    // =============================================
    // 7. HISTÓRICO & EXPORTAÇÃO EM LOTE (.ZIP)
    // =============================================
    addToHistory(item) {
        window.appState.audioHistory.unshift(item);
        if (window.appState.audioHistory.length > 20) {
            window.appState.audioHistory.pop();
        }
        localStorage.setItem('talkmotion_history', JSON.stringify(window.appState.audioHistory));
        this.renderHistory();
    },

    renderHistory() {
        const section = document.getElementById('historySection');
        const list = document.getElementById('historyList');
        const count = document.getElementById('historyCount');
        if (!section || !list) return;

        const history = window.appState.audioHistory || [];
        if (history.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');
        if (count) count.textContent = history.length;

        list.innerHTML = history.map((item, idx) => `
            <div class="glass p-3.5 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        ${item.voice ? item.voice.substring(0, 2).toUpperCase() : 'AI'}
                    </span>
                    <div class="min-w-0">
                        <div class="font-bold text-white truncate">${item.text}</div>
                        <div class="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                            <span class="text-sky-400 font-semibold">${item.voice}</span>
                            <span>&bull;</span>
                            <span class="uppercase">${item.format}</span>
                            <span>&bull;</span>
                            <span>${item.date}</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onclick="app.playHistoryAudio('${item.audioUrl}')" class="glass-btn p-2 rounded-xl text-sky-400 hover:text-white" title="Ouvir">
                        ▶
                    </button>
                    <a href="${item.audioUrl}" download class="glass-btn p-2 rounded-xl text-gray-400 hover:text-white flex items-center" title="Baixar">
                        💾
                    </a>
                    <button type="button" onclick="app.removeHistoryItem(${item.id})" class="text-gray-500 hover:text-red-400 p-1 rounded" title="Excluir">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    },

    playHistoryAudio(url) {
        const audio = document.getElementById('mainAudio');
        if (audio) {
            audio.src = url;
            audio.play().then(() => {
                document.getElementById('btnPlayPause').textContent = '⏸';
                document.getElementById('outputContainer').classList.remove('hidden');
                document.getElementById('outputContainer').scrollIntoView({ behavior: 'smooth' });
                this.generateWaveformPeaks();
                this.drawWaveform(0);
            });
        }
    },

    removeHistoryItem(id) {
        window.appState.audioHistory = window.appState.audioHistory.filter(h => h.id !== id);
        localStorage.setItem('talkmotion_history', JSON.stringify(window.appState.audioHistory));
        this.renderHistory();
    },

    clearHistory() {
        if (confirm('Deseja realmente limpar todo o histórico de produções da sessão?')) {
            window.appState.audioHistory = [];
            localStorage.removeItem('talkmotion_history');
            this.renderHistory();
            this.toast('Histórico limpo.', 'info');
        }
    },

    async downloadAllZip() {
        const history = window.appState.audioHistory || [];
        if (history.length === 0) {
            this.toast('Nenhum áudio no histórico para baixar.', 'info');
            return;
        }

        if (typeof JSZip === 'undefined') {
            this.toast('Biblioteca ZIP indisponível no momento.', 'error');
            return;
        }

        this.toast('Empacotando áudios em arquivo .ZIP...', 'info');
        const zip = new JSZip();

        try {
            for (let i = 0; i < history.length; i++) {
                const item = history[i];
                const resp = await fetch(item.audioUrl);
                const blob = await resp.blob();
                const filename = `talkmotion_${i + 1}_${item.voice}.${item.format || 'mp3'}`;
                zip.file(filename, blob);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `talkmotion_producoes_${Date.now()}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            this.toast('Download do pacote .ZIP iniciado!', 'success');
        } catch (err) {
            console.error('Erro ao gerar ZIP:', err);
            this.toast('Falha ao criar o arquivo .ZIP', 'error');
        }
    },

    // =============================================
    // 8. VOZES, THEME, BINDINGS & DEV MODE
    // =============================================
    renderVoices() {
        const grid = document.getElementById('voiceGrid');
        if (!grid) return;

        grid.innerHTML = window.appState.voices.map(v => `
            <div class="voice-card glass rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 ${window.appState.selectedVoice === v.id ? 'active' : ''}" 
                 onclick="app.selectVoice('${v.id}')">
                <div class="w-11 h-11 rounded-xl bg-black/40 flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                    ${v.gender === 'male' ? '👨' : (v.gender === 'female' ? '👩' : '🤖')}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-white text-xs sm:text-sm transition-colors">${v.name}</h3>
                    <p class="text-[10px] text-gray-400 truncate">${v.desc}</p>
                    <div class="flex gap-1 mt-1.5 flex-wrap">
                        ${v.tags.map(t => `<span class="bg-sky-500/20 text-sky-400 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase border border-sky-500/20">${t}</span>`).join('')}
                    </div>
                </div>
                <button type="button" onclick="event.stopPropagation(); app.playPreview('${v.id}')" class="w-9 h-9 rounded-full bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white transition-all text-xs flex items-center justify-center border border-sky-500/20 flex-shrink-0" title="Ouvir Demonstração Gratuita">
                    ▶
                </button>
            </div>
        `).join('');
    },

    async playPreview(id) {
        if (!this.requireLogin()) return;

        if (this.previewAudio) {
            this.previewAudio.pause();
            if (this.lastPreviewId === id) {
                this.lastPreviewId = null;
                return;
            }
        }

        const btn = event?.currentTarget;
        if (btn) btn.innerHTML = `<span class="spinner w-3 h-3 border-2" style="border-width: 1px;"></span>`;

        try {
            const resp = await fetch('api_tts.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`
                },
                body: JSON.stringify({
                    text: "Esta é uma demonstração da minha voz no TalkMotion. O que você achou?",
                    voice: id,
                    speed: 1.0,
                    model: 'tts-1',
                    format: 'mp3',
                    preview: true
                })
            });

            if (resp.status === 401) {
                this.toast('Sessão expirada. Faça login novamente.', 'error');
                this.logout();
                return;
            }

            const data = await resp.json();
            if (data.success) {
                this.previewAudio = new Audio(data.audio_url);
                this.previewAudio.play();
                this.lastPreviewId = id;
            } else {
                this.toast(data.error || 'Erro no preview', 'error');
            }
        } catch (e) {
            this.toast('Erro ao buscar áudio de preview', 'error');
        } finally {
            if (btn) btn.innerHTML = '▶';
        }
    },

    selectVoice(id) {
        window.appState.selectedVoice = id;
        this.renderVoices();
        this.toast(`Voz ${id.toUpperCase()} selecionada`, 'info');
    },

    clearText() {
        const input = document.getElementById('textInput');
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input'));
            this.toast('Área de texto limpa', 'success');
        }
    },

    insertSample() {
        const samples = [
            "Bem-vindo ao futuro da síntese de voz com o TalkMotion. Utilizando modelos neurais de última geração, transformamos qualquer roteiro em narrações humanas impressionantes com clareza cristalina.",
            "A inteligência artificial transformou radicalmente a produção de podcasts, audiobooks e conteúdos para redes sociais. Experimente a fluidez e precisão do TalkMotion agora mesmo."
        ];
        const input = document.getElementById('textInput');
        if (input) {
            input.value = samples[Math.floor(Math.random() * samples.length)];
            input.dispatchEvent(new Event('input'));
        }
    },

    setupBindings() {
        const speedSlider = document.getElementById('speedSlider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                document.getElementById('speedVal').textContent = parseFloat(e.target.value).toFixed(2) + 'x';
                this.updateReadingMetrics();
            });
        }

        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                document.getElementById('charCounter').textContent = `${e.target.value.length} / 4096`;
                this.updateReadingMetrics();
            });
        }
    },

    setupDevMode() {
        window.talkmotion = {
            addCredit: async (amount, secret) => {
                if (!this.requireLogin()) return;
                try {
                    const resp = await fetch('../keepai/api/credits.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${window.appState.token}`
                        },
                        body: JSON.stringify({
                            dev_password: secret,
                            amount: amount
                        })
                    });
                    const data = await resp.json();
                    if (data.success) {
                        this.toast(`Sucesso! +${amount} créditos adicionados.`, 'success');
                        this.syncCredits();
                    } else {
                        this.toast(data.error || "Erro no comando dev", "error");
                    }
                } catch (e) {
                    this.toast("Falha na comunicação com o banco", "error");
                }
            }
        };
    },

    handleLogoClick() {
        const now = Date.now();
        if (now - this.lastClickTime < 2000) {
            this.clickCount++;
        } else {
            this.clickCount = 1;
        }
        this.lastClickTime = now;

        if (this.clickCount >= 5) {
            this.clickCount = 0;
            if (!this.requireLogin()) return;

            const secret = prompt("Insira a senha do modo desenvolvedor:");
            if (!secret) return;

            const amount = parseInt(prompt("Quantidade de créditos de IA:", "50"), 10);
            if (isNaN(amount) || amount <= 0) return;

            window.talkmotion.addCredit(amount, secret);
        }
    },

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark');
        if (isDark) {
            body.classList.remove('dark');
            body.classList.add('light');
            localStorage.setItem('vozai_theme', 'light');
            document.getElementById('themeToggle').textContent = '☀️';
        } else {
            body.classList.remove('light');
            body.classList.add('dark');
            localStorage.setItem('vozai_theme', 'dark');
            document.getElementById('themeToggle').textContent = '🌙';
        }
    },

    loadTheme() {
        const saved = localStorage.getItem('vozai_theme') || 'dark';
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(saved);
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) toggleBtn.textContent = saved === 'dark' ? '🌙' : '☀️';
    },

    // =============================================
    // 9. AUTENTICAÇÃO & CRÉDITOS UNIFICADOS
    // =============================================
    async syncCredits() {
        if (!window.appState.token) {
            this.updateCreditsUI();
            return;
        }

        try {
            const resp = await fetch('../keepai/api/auth.php', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${window.appState.token}` }
            });

            if (resp.status === 401) {
                this.logout();
                return;
            }

            const data = await resp.json();
            if (data.success && data.user) {
                window.appState.credits = data.user.credits;
                window.appState.user = data.user;
                this.updateCreditsUI();
            } else {
                this.logout();
            }
        } catch (e) {
            console.error('Erro ao sincronizar créditos:', e);
        }
    },

    updateCreditsUI() {
        const valSpan = document.getElementById('user-credits-val');
        const loginBtn = document.getElementById('unified-login-btn');
        const avatarImg = document.getElementById('user-avatar');
        const diamondIcon = document.getElementById('user-diamond-icon');

        if (window.appState.token) {
            if (valSpan) {
                valSpan.textContent = `${window.appState.credits} cr`;
            }
            if (window.appState.user && window.appState.user.photo_url && avatarImg) {
                avatarImg.src = window.appState.user.photo_url;
                avatarImg.classList.remove('hidden');
                if (diamondIcon) diamondIcon.classList.add('hidden');
            } else if (avatarImg && diamondIcon) {
                avatarImg.classList.add('hidden');
                diamondIcon.classList.remove('hidden');
            }
            if (loginBtn) {
                loginBtn.textContent = 'Sair';
                loginBtn.classList.remove('bg-gradient-to-r', 'from-sky-500', 'to-blue-600');
                loginBtn.classList.add('bg-white/10', 'hover:bg-white/20');
                loginBtn.onclick = () => app.logout();
            }
        } else {
            if (valSpan) {
                valSpan.textContent = 'Sem Login';
            }
            if (avatarImg) avatarImg.classList.add('hidden');
            if (diamondIcon) diamondIcon.classList.remove('hidden');
            if (loginBtn) {
                loginBtn.textContent = 'Entrar';
                loginBtn.classList.remove('bg-white/10', 'hover:bg-white/20');
                loginBtn.classList.add('bg-gradient-to-r', 'from-sky-500', 'to-blue-600');
                loginBtn.onclick = () => app.handleCreditsClick();
            }
        }
    },

    handleCreditsClick() {
        if (!window.appState.token) {
            this.openLoginModal();
        } else {
            this.openRechargeModal();
        }
    },

    requireLogin() {
        if (!window.appState.token) {
            this.toast("Por favor, faça login para usar o TalkMotion.", "info");
            this.openLoginModal();
            return false;
        }
        return true;
    },

    logout() {
        localStorage.removeItem('keepai_token');
        window.appState.token = null;
        window.appState.credits = 0;
        window.appState.user = null;
        this.updateCreditsUI();
        this.toast('Sessão encerrada com sucesso', 'info');
    },

    openLoginModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('hidden');
        this.renderLoginModal(true);
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
        this.stopPolling();
    },

    renderLoginModal(isLoginMode) {
        const overlay = document.getElementById('modalOverlay');
        overlay.innerHTML = `
            <div class="glass-strong rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-sky-500/20 shadow-2xl animate-in zoom-in-95 duration-300 relative text-white">
                <button onclick="app.closeModal()" class="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer text-lg font-mono">✕</button>
                
                <div class="text-center mb-5">
                    <h2 class="text-xl sm:text-2xl font-black gradient-text">${isLoginMode ? 'Entrar no TalkMotion' : 'Criar Conta Grátis'}</h2>
                    <p class="text-xs text-gray-400 mt-1.5">
                        ${isLoginMode ? 'Acesse com sua conta unificada 4uLabs' : 'Crie sua conta e ganhe 10 créditos de bônus!'}
                    </p>
                </div>

                <!-- Botão Oficial Google Sign-In -->
                <button type="button" onclick="app.loginWithGoogle()" class="google-btn w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 text-xs shadow-md cursor-pointer mb-5 active:scale-98">
                    <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.4 7.34 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.6 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continuar com o Google</span>
                </button>

                <div class="relative flex py-2 items-center mb-4">
                    <div class="flex-grow border-t border-white/10"></div>
                    <span class="flex-shrink mx-3 text-[10px] text-gray-500 uppercase tracking-widest font-mono">ou com e-mail</span>
                    <div class="flex-grow border-t border-white/10"></div>
                </div>

                <form onsubmit="app.handleAuthSubmit(event, ${isLoginMode})" class="space-y-3.5">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">E-mail</label>
                        <input type="email" id="auth-email" required placeholder="seuemail@exemplo.com" 
                               class="w-full bg-slate-950/80 border border-sky-500/20 text-white rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-sky-500 transition-all placeholder:text-gray-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Senha</label>
                        <input type="password" id="auth-password" required placeholder="Sua senha secreta" 
                               class="w-full bg-slate-950/80 border border-sky-500/20 text-white rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-sky-500 transition-all placeholder:text-gray-500">
                    </div>

                    <button type="submit" id="auth-btn" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-sky-500/20 cursor-pointer">
                        ${isLoginMode ? 'ENTRAR AGORA' : 'CADASTRAR E GANHAR 10 CRÉDITOS'}
                    </button>
                </form>

                <div class="mt-5 text-center text-xs text-gray-400">
                    ${isLoginMode ? 'Não possui uma conta?' : 'Já possui uma conta?'}
                    <span onclick="app.renderLoginModal(${!isLoginMode})" class="text-sky-400 hover:underline cursor-pointer font-bold ml-1">
                        ${isLoginMode ? 'Cadastre-se' : 'Entrar'}
                    </span>
                </div>
            </div>
        `;
    },

    async handleAuthSubmit(event, isLoginMode) {
        event.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        const btn = document.getElementById('auth-btn');

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner inline-block mr-2" style="width:12px; height:12px; border-width:2px; vertical-align:middle;"></span> PROCESSANDO...`;

        const action = isLoginMode ? 'login' : 'register';

        try {
            const resp = await fetch(`../keepai/api/auth.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await resp.json();

            if (data.success && data.token) {
                localStorage.setItem('keepai_token', data.token);
                window.appState.token = data.token;
                window.appState.credits = data.user.credits;
                window.appState.user = data.user;
                
                this.updateCreditsUI();
                this.closeModal();
                this.toast(isLoginMode ? 'Bem-vindo de volta!' : 'Conta criada! +10 créditos adicionados.', 'success');
            } else {
                throw new Error(data.error || 'Erro na autenticação');
            }
        } catch (e) {
            this.toast(e.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = isLoginMode ? 'ENTRAR AGORA' : 'CADASTRAR E GANHAR 10 CRÉDITOS';
        }
    },

    openRechargeModal() {
        const overlay = document.getElementById('modalOverlay');
        overlay.classList.remove('hidden');
        this.selectedPackage = 1; // Padrão: 50 créditos

        overlay.innerHTML = `
            <div class="glass-strong rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sky-500/20 shadow-2xl animate-in zoom-in-95 duration-300 relative text-white">
                <button onclick="app.closeModal()" class="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors cursor-pointer text-lg font-mono">✕</button>
                
                <div class="text-center mb-6">
                    <h2 class="text-xl sm:text-2xl font-black gradient-text">Recarga de Créditos de IA</h2>
                    <p class="text-xs text-gray-400 mt-1.5">Escolha um pacote e gere o código PIX com liberação instantânea</p>
                </div>

                <div id="recharge-content" class="space-y-5">
                    <div class="grid grid-cols-3 gap-3">
                        <div id="pkg-card-0" onclick="app.selectPackage(0)" class="glass p-3 sm:p-4 rounded-2xl text-center cursor-pointer border border-white/5 hover:border-sky-500/50 transition-all duration-300">
                            <div class="text-[9px] text-gray-400 mb-1 font-bold uppercase">Bronze</div>
                            <div class="text-sm font-black text-white">10 cr</div>
                            <div class="text-xs font-mono text-sky-400 mt-1.5">R$ 4,90</div>
                        </div>
                        <div id="pkg-card-1" onclick="app.selectPackage(1)" class="glass p-3 sm:p-4 rounded-2xl text-center cursor-pointer border border-white/5 hover:border-sky-500/50 transition-all duration-300 relative">
                            <div class="text-[7px] bg-sky-500 text-white px-2 py-0.5 rounded-full absolute -top-2.5 left-1/2 -translate-x-1/2 font-black uppercase tracking-wider">POPULAR</div>
                            <div class="text-[9px] text-gray-400 mb-1 font-bold uppercase">Prata</div>
                            <div class="text-sm font-black text-white">50 cr</div>
                            <div class="text-xs font-mono text-sky-400 mt-1.5">R$ 19,90</div>
                        </div>
                        <div id="pkg-card-2" onclick="app.selectPackage(2)" class="glass p-3 sm:p-4 rounded-2xl text-center cursor-pointer border border-white/5 hover:border-sky-500/50 transition-all duration-300">
                            <div class="text-[9px] text-gray-400 mb-1 font-bold uppercase">Ouro</div>
                            <div class="text-sm font-black text-white">100 cr</div>
                            <div class="text-xs font-mono text-sky-400 mt-1.5">R$ 34,90</div>
                        </div>
                    </div>

                    <button onclick="app.generatePIX()" id="btn-gerar-pix" class="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-700 text-white font-black text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-sky-500/20 cursor-pointer">
                        GERAR CÓDIGO PIX AGORA
                    </button>
                    
                    <p class="text-[9px] text-gray-400 text-center px-4 leading-relaxed">
                        Os créditos são vinculados à sua conta unificada 4U.IA.BR e ativados imediatamente após a aprovação do Mercado Pago.
                    </p>
                </div>
            </div>
        `;
        this.selectPackage(1);
    },

    selectPackage(index) {
        this.selectedPackage = index;
        [0, 1, 2].forEach(i => {
            const card = document.getElementById(`pkg-card-${i}`);
            if (card) {
                card.classList.remove('border-sky-500', 'bg-sky-500/15', 'shadow-lg', 'shadow-sky-500/10');
                card.classList.add('border-white/5');
            }
        });

        const activeCard = document.getElementById(`pkg-card-${index}`);
        if (activeCard) {
            activeCard.classList.remove('border-white/5');
            activeCard.classList.add('border-sky-500', 'bg-sky-500/15', 'shadow-lg', 'shadow-sky-500/10');
        }
    },

    async generatePIX() {
        const container = document.getElementById('recharge-content');
        if (!container) return;

        const initialCredits = window.appState.credits;

        container.innerHTML = `
            <div class="py-10 flex flex-col items-center gap-3 text-center">
                <div class="spinner"></div>
                <p class="text-sm font-bold text-white">Conectando ao Mercado Pago...</p>
                <p class="text-xs text-gray-400">Gerando seu QR Code PIX seguro...</p>
            </div>
        `;

        try {
            const resp = await fetch('../keepai/api/mp_create.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.appState.token}`
                },
                body: JSON.stringify({ package_index: this.selectedPackage })
            });

            const data = await resp.json();

            if (data.success) {
                const imgSrc = data.qr_code_base64
                    ? `data:image/png;base64,${data.qr_code_base64}`
                    : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qr_code)}`;

                container.innerHTML = `
                    <div class="flex flex-col items-center">
                        <div class="bg-white p-3 rounded-2xl mb-4 shadow-xl">
                            <img src="${imgSrc}" class="w-44 h-44 block">
                        </div>
                        
                        <div class="w-full space-y-2">
                            <button onclick="app.copyPix('${data.qr_code}')" class="w-full glass py-3 rounded-xl text-xs font-bold text-white hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-sky-500/30">
                                📋 COPIAR CÓDIGO PIX
                            </button>
                        </div>

                        <div class="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Aguardando confirmação do pagamento...
                        </div>
                        
                        <p class="text-[10px] text-gray-400 text-center mt-4">
                            Valor: R$ ${data.amount_brl.toFixed(2).replace('.', ',')} | Adicionar: +${data.credits} créditos
                        </p>
                    </div>
                `;

                this.startPolling(initialCredits, data.credits);
            } else {
                throw new Error(data.error || 'Erro ao gerar pagamento');
            }
        } catch (e) {
            this.toast(e.message, 'error');
            this.openRechargeModal();
        }
    },

    copyPix(code) {
        navigator.clipboard.writeText(code);
        this.toast('Código PIX Copiado com Sucesso!', 'success');
    },

    startPolling(initialCredits, addedCredits) {
        this.stopPolling();
        
        this.pollingInterval = setInterval(async () => {
            try {
                const resp = await fetch('../keepai/api/credits.php', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${window.appState.token}` }
                });
                
                const data = await resp.json();
                
                if (data.credits > initialCredits) {
                    this.stopPolling();
                    window.appState.credits = data.credits;
                    this.updateCreditsUI();
                    this.closeModal();

                    Swal.fire({
                        title: '⚡ Recarga Aprovada!',
                        text: `Parabéns! Adicionamos +${addedCredits} créditos de IA ao seu saldo unificado.`,
                        icon: 'success',
                        background: '#090d16',
                        color: '#fff',
                        confirmButtonColor: '#0284c7',
                        customClass: {
                            popup: 'rounded-3xl border border-sky-500/30'
                        }
                    });
                }
            } catch (e) {
                console.error('Erro na verificação do pagamento:', e);
            }
        }, 3000);
    },

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },

    // =============================================
    // 10. TOAST NOTIFICATIONS & HELPERS
    // =============================================
    toast(msg, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        const colors = {
            success: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300',
            error: 'border-red-500/50 bg-red-500/15 text-red-300',
            info: 'border-sky-500/50 bg-sky-500/15 text-sky-300'
        };

        toast.className = `toast glass p-3.5 rounded-2xl border ${colors[type]} flex items-center gap-2.5 shadow-2xl min-w-[260px] pointer-events-auto`;
        toast.innerHTML = `
            <span class="text-base">${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span>
            <span class="text-xs font-bold tracking-tight">${this.escapeHtml(msg)}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    },

    escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
