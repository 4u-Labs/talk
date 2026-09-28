<?php
/**
 * api_mp_create.php - Criação de pagamento PIX no Mercado Pago
 */

header('Content-Type: application/json');

$env = parse_ini_file('.env');
$access_token = $env['MP_ACCESS_TOKEN'] ?? null;

if (!$access_token) {
    echo json_encode(['success' => false, 'error' => 'Mercado Pago não configurado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$amount = floatval($input['amount'] ?? 10.00);

if ($amount < 1.00) {
    echo json_encode(['success' => false, 'error' => 'Valor mínimo R$ 1,00']);
    exit;
}

$payment_data = [
    "transaction_amount" => $amount,
    "description" => "Créditos VozAI Premium",
    "payment_method_id" => "pix",
    "payer" => [
        "email" => "cliente@vozai.com.br", // Email fixo para teste ou coletado do form
        "first_name" => "Cliente",
        "last_name" => "VozAI"
    ]
];

$ch = curl_init('https://api.mercadopago.com/v1/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payment_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $access_token,
    'Content-Type: application/json',
    'X-Idempotency-Key: ' . uniqid()
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($http_code === 201) {
    echo json_encode([
        "success" => true,
        "payment_id" => $result['id'],
        "qr_code" => $result['point_of_interaction']['transaction_data']['qr_code'],
        "qr_code_base64" => $result['point_of_interaction']['transaction_data']['qr_code_base64']
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error" => $result['message'] ?? 'Erro ao criar pagamento'
    ]);
}
?>
