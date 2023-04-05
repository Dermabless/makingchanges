
<?php
require __DIR__ . '/vendor/autoload.php';

use Telegram\Bot\Api;

// Set up webhook URL
$webhookUrl = 'https://makingchanges.prodev.app/telegram_webhook.php';

$telegram = new Api('6040310515:AAEpxRNBEmBiTld3N6Jid65efWRuQrnOvcc');

// Set up webhook
$response = $telegram->setWebhook([
    'url' => $webhookUrl
]);

if ($response->isOk()) {
    error_log('Webhook set up successfully!');
} else {
    error_log('Error setting up webhook: ' . $response->getDescription());
}

// Listen for webhook requests
$update = $telegram->getWebhookUpdate();
$message = $update->getMessage();
$text = $message->getText();

// Debug output
error_log('Received message: ' . $text);

// Send a message back to the user
$chatId = $message->getChat()->getId();
$response = $telegram->sendMessage([
    '-810583708' => $chatId,
    'text' => 'Hello, world!'
]);

// Debug output
if ($response->isOk()) {
    error_log('Message sent successfully!');
} else {
    error_log('Error sending message: ' . $response->getDescription());
}