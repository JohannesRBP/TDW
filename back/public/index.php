<?php

/**
 * public/index.php
 *
 * @license https://opensource.org/licenses/MIT MIT License
 * @link    https://www.etsisi.upm.es/ ETS de Ingeniería de Sistemas Informáticos
 *
 * @link    https://www.slimframework.com/docs/v4/concepts/life-cycle.html
 */

use TDW\ACiencia\Utility\Utils;

$proyectBaseDir = dirname(__DIR__);
require_once $proyectBaseDir . '/vendor/autoload.php';

header("Access-Control-Allow-Origin: http://localhost:5500");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Para peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// 1. Create DI Container + Instantiation
Utils::loadEnv($proyectBaseDir);
(require $proyectBaseDir . '/config/bootstrap.php')->run();
