<?php
/**
 * api_tts.php - Ponte segura para OpenAI TTS (Suporta Voz Única e Diálogo Multi-Vozes)
 * 4U.IA.BR
 */

require_once __DIR__ . '/../keepai/api/database.php';

header('Content-Type: application/json');

// Autenticação Unificada Keep AI via Bearer Token
$user = verifyAuthToken();

$api_key = OPENAI_API_KEY;

if (!$api_key) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'API Key não configurada ou .env inacessível']);
    exit;
}

// Receber dados do frontend
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$mode = $input['mode'] ?? 'single';
$speed = floatval($input['speed'] ?? 1.0);
$model = $input['model'] ?? 'tts-1';
$format = $input['format'] ?? 'mp3';
$isPreview = isset($input['preview']) && $input['preview'] === true;

// Verificar saldo de créditos unificados (1 crédito mínimo) se não for preview
if (!$isPreview && (int)$user['credits'] < 1) {
    http_response_code(402);
    echo json_encode(['success' => false, 'error' => 'Saldo insuficiente para usar IA. Por favor, recarregue seus créditos.']);
    exit;
}

if (!is_dir('tmp')) mkdir('tmp', 0755, true);

// =============================================
// MODO DIÁLOGO MULTI-VOZES (PODCAST)
// =============================================
if ($mode === 'dialogue' && !empty($input['blocks']) && is_array($input['blocks'])) {
    $blocks = $input['blocks'];
    $combinedAudio = '';
    $errors = [];

    foreach ($blocks as $idx => $blk) {
        $blkText = trim($blk['text'] ?? '');
        $blkVoice = trim($blk['voice'] ?? 'onyx');
        if (empty($blkText)) continue;

        $ch = curl_init('https://api.openai.com/v1/audio/speech');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'model' => $model,
            'input' => $blkText,
            'voice' => $blkVoice,
            'speed' => $speed,
            'response_format' => 'mp3'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json'
        ]);

        $partResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && !empty($partResponse)) {
            $combinedAudio .= $partResponse;
        } else {
            $err = json_decode($partResponse, true);
            $errors[] = "Fala " . ($idx + 1) . ": " . ($err['error']['message'] ?? 'Falha na síntese');
        }
    }

    if (empty($combinedAudio)) {
        echo json_encode(['success' => false, 'error' => 'Não foi possível gerar as falas do diálogo. ' . implode(', ', $errors)]);
        exit;
    }

    $filename = 'audio_dialogue_' . uniqid() . '.mp3';
    $filepath = 'tmp/' . $filename;
    file_put_contents($filepath, $combinedAudio);

    $pdo = Database::get();

    // Debitar 1 crédito unificado pelo diálogo completo
    if (!$isPreview) {
        $pdo->beginTransaction();
        try {
            $stmtU = $pdo->prepare("UPDATE users SET credits = credits - 1, updated_at = datetime('now') WHERE id = ?");
            $stmtU->execute([$user['id']]);

            $stmtT = $pdo->prepare("
                INSERT INTO transactions (user_id, mp_payment_id, package_label, amount_brl, credits_added, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmtT->execute([
                $user['id'],
                'TALK-DIAL-' . time() . '-' . rand(1000, 9999),
                'Consumo TalkMotion (Modo Diálogo Multi-Vozes)',
                0.00,
                -1,
                'approved'
            ]);

            $pdo->commit();
        } catch (Exception $eTx) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log("Erro ao debitar créditos unificados diálogo: " . $eTx->getMessage());
        }
    }

    $stmtC = $pdo->prepare("SELECT credits FROM users WHERE id = ?");
    $stmtC->execute([$user['id']]);
    $newCredits = (int)($stmtC->fetchColumn() ?? 0);

    echo json_encode([
        'success' => true,
        'audio_url' => $filepath,
        'credits_remaining' => $newCredits
    ]);
    exit;
}

// =============================================
// MODO VOZ ÚNICA (PADRÃO)
// =============================================
$text = $input['text'] ?? '';
$voice = $input['voice'] ?? 'onyx';

if (empty($text)) {
    echo json_encode(['success' => false, 'error' => 'Texto está vazio']);
    exit;
}

// Configurar chamada CURL para OpenAI
$ch = curl_init('https://api.openai.com/v1/audio/speech');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => $model,
    'input' => $text,
    'voice' => $voice,
    'speed' => $speed,
    'response_format' => $format
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $api_key,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $filename = 'audio_' . uniqid() . '.' . $format;
    $filepath = 'tmp/' . $filename;
    file_put_contents($filepath, $response);
    
    $pdo = Database::get();
    
    // Logar uso e descontar créditos no banco unificado do Keep AI se NÃO for preview
    if (!$isPreview) {
        $pdo->beginTransaction();
        try {
            $stmtU = $pdo->prepare("UPDATE users SET credits = credits - 1, updated_at = datetime('now') WHERE id = ?");
            $stmtU->execute([$user['id']]);

            $stmtT = $pdo->prepare("
                INSERT INTO transactions (user_id, mp_payment_id, package_label, amount_brl, credits_added, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmtT->execute([
                $user['id'],
                'TALK-' . time() . '-' . rand(1000, 9999),
                'Consumo TalkMotion',
                0.00,
                -1,
                'approved'
            ]);

            $pdo->commit();
        } catch (Exception $eTx) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log("Erro ao debitar créditos unificados: " . $eTx->getMessage());
        }
    }

    // Obter saldo final para retornar à UI
    $stmtC = $pdo->prepare("SELECT credits FROM users WHERE id = ?");
    $stmtC->execute([$user['id']]);
    $newCredits = (int)($stmtC->fetchColumn() ?? 0);

    echo json_encode([
        'success' => true, 
        'audio_url' => $filepath,
        'credits_remaining' => $newCredits
    ]);
} else {
    $err = json_decode($response, true);
    echo json_encode([
        'success' => false, 
        'error' => $err['error']['message'] ?? 'Erro na API da OpenAI'
    ]);
}
?>
