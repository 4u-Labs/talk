<?php
/**
 * api_mp_check.php - Verificação de status do pagamento
 */

header('Content-Type: application/json');

$env = parse_ini_file('.env');
$access_token = $env['MP_ACCESS_TOKEN'] ?? null;

$payment_id = $_GET['id'] ?? null;

if (!$payment_id) {
    echo json_encode(['success' => false, 'error' => 'ID de pagamento ausente']);
    exit;
}

$ch = curl_init("https://api.mercadopago.com/v1/payments/$payment_id");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($http_code === 200) {
    echo json_encode([
        "success" => true,
        "status" => $result['status'], // 'approved', 'pending', etc
        "amount" => $result['transaction_amount']
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => "Não foi possível consultar o status"
    ]);
}
?>
