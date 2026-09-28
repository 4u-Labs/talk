    <footer class="footer-clean py-8 px-4 text-center border-t border-white/5 bg-slate-950/40 mt-auto">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div>
                &copy; <?php echo date('Y'); ?> <strong>TalkMotion</strong> &bull; Ecossistema <a href="https://4u.ia.br" target="_blank" class="hover:text-sky-400 font-bold transition-colors">4U.IA.BR</a>
            </div>

            <div class="flex items-center gap-3 flex-wrap justify-center text-[11px]">
                <a href="https://www.paypal.com/ncp/payment/L7YRCS984T33N" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1" title="Apoie o TalkMotion via PayPal">
                    ☕ Apoie
                </a>
                <span class="opacity-30">&bull;</span>
                <a href="https://github.com/4u-Labs/talk" target="_blank" rel="noopener noreferrer" class="hover:text-sky-400 transition-colors" title="Código-Fonte no GitHub">
                    GitHub
                </a>
                <span class="opacity-30">&bull;</span>
                <a href="privacidade.php" class="hover:text-sky-400 transition-colors">Privacidade</a>
                <span class="opacity-30">&bull;</span>
                <a href="termos.php" class="hover:text-sky-400 transition-colors">Termos</a>
                <span class="opacity-30">&bull;</span>
                <a href="suporte.php" class="hover:text-sky-400 transition-colors">Suporte</a>
            </div>
        </div>
    </footer>

    <!-- Bibliotecas Externas: JSZip & SweetAlert2 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Script Principal -->
    <script src="<?php echo get_asset('lib_app.js'); ?>"></script>
</body>
</html>
