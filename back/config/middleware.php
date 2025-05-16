<?php

use Psr\Container\ContainerInterface;
use Selective\Config\Configuration;
use Slim\App;
use Slim\Handlers\ErrorHandler;
use TDW\ACiencia\Handler\{ HtmlErrorRenderer, JsonErrorRenderer };

return function (App $app) {
    // ===========================================================
    // 1. MIDDLEWARE CORS (PRIMERA CAPA - SE EJECUTA EN TODAS LAS PETICIONES)
    // ===========================================================
    $app->add(function ($request, $handler) {
        // Orígenes permitidos (ajusta a tus necesidades)
        $allowedOrigins = [
            'http://localhost:5500',      // Frontend local
            'http://127.0.0.1:5500',       // Alternativa IPv4
            'http://[::1]:5500'           // Alternativa IPv6
        ];
        
        // Obtener origen de la solicitud
        $origin = $request->getHeaderLine('Origin');
        
        // Determinar origen permitido (sin usar wildcard '*' si hay credenciales)
        $allowOrigin = in_array($origin, $allowedOrigins) 
            ? $origin 
            : $allowedOrigins[0]; // Opción: rechazar peticiones no listadas

        // Manejar la solicitud y modificar la respuesta
        $response = $handler->handle($request);
        
        // Añadir cabeceras CORS a TODAS las respuestas
        return $response
            ->withHeader('Access-Control-Allow-Origin', $allowOrigin)
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader(
                'Access-Control-Allow-Headers',
                'Content-Type, Accept, Origin, Authorization, X-Requested-With'
            )
            ->withHeader(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            );
    });

    // ===========================================================
    // 2. RUTA PREFLIGHT OPTIONS (PARA SOLICITUDES CORS COMPLEJAS)
    // ===========================================================
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        // Respuesta vacía con código 200 y cabeceras CORS
        // ¡Las cabeceras ya fueron añadidas por el middleware anterior!
        return $response;
    });

    // ===========================================================
    // 3. MIDDLEWARES DE SLIM (PROCESAMIENTO DEL CUERPO DE PETICIONES)
    // ===========================================================
    $app->addBodyParsingMiddleware();  // Parsea JSON, XML, form-data
    $app->addRoutingMiddleware();      // Habilita el sistema de rutas

    // ===========================================================
    // 4. MANEJO DE ERRORES (ÚLTIMA CAPA - CAPTURA EXCEPCIONES)
    // ===========================================================
    /** @var ContainerInterface $container */
    $container = $app->getContainer();
    
    // Configuración desde archivo
    $settings = $container->get(Configuration::class)->getArray('error_handler_middleware');

    // Middleware de errores con 3 parámetros:
    $errorMiddleware = $app->addErrorMiddleware(
        $settings['display_error_details'],  // Mostrar detalles en entorno dev
        $settings['log_errors'],             // Registrar errores
        $settings['log_error_details']       // Registrar detalles técnicos
    );

    // Renderizadores personalizados para diferentes formatos
    /** @var ErrorHandler $errorHandler */
    $errorHandler = $errorMiddleware->getDefaultErrorHandler();
    $errorHandler->registerErrorRenderer('text/html', HtmlErrorRenderer::class);
    $errorHandler->registerErrorRenderer('application/json', JsonErrorRenderer::class);
};