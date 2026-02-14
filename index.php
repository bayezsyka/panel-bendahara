<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
// Perhatikan: path 'storage' tidak perlu pakai '../' lagi
if (file_exists($maintenance = __DIR__ . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Perhatikan: path 'vendor' tidak perlu pakai '../' lagi
require __DIR__ . '/vendor/autoload.php';

// Perhatikan: path 'bootstrap' tidak perlu pakai '../' lagi
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
