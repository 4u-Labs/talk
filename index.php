<?php
/**
 * TalkMotion - Conversor de Texto em Áudio com IA
 * Entrada Principal com Anti-Cache
 * 4U.IA.BR
 */
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

function get_asset($path) {
    if (file_exists($path)) {
        return $path . "?v=" . filemtime($path);
    }
    return $path;
}

include 'ui_header.php';
include 'ui_main.php';
include 'ui_footer.php';
?>
