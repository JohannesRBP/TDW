<?php

use Psr\Container\ContainerInterface;
use Selective\Config\Configuration;
use Slim\App;
use Slim\Handlers\ErrorHandler;
use TDW\ACiencia\Handler\{ HtmlErrorRenderer, JsonErrorRenderer };

return function (App $app) {
    $app->add(function ($request, $handler) {
        // Orígenes permitidos
        $allowedOrigins = [
            'http://localhost:5500',   
            'http://127.0.0.1:5500',      
            'http://[::1]:5500'          
        ];
        
        // Obtener origen de la solicitud
        $origin = $request->getHeaderLine('Origin');
        
        // Determinar origen permitido 
        $allowOrigin = in_array($origin, $allowedOrigins) 
            ? $origin 
            : $allowedOrigins[0]; 

        // Manejar la solicitud y modificar la respuesta
        $response = $handler->handle($request);
        
        // Añadir cabeceras CORS a TODAS las respuestas
        return $response
            ->withHeader('Access-Control-Allow-Origin', $allowOrigin)
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader(
                'Access-Control-Allow-Headers',
                'Content-Type, Accept, Origin, Authorization, X-Requested-With, If-Match'
            )
            ->withHeader(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            )
            ->withHeader('Access-Control-Expose-Headers', 'ETag');
    });


    $app->options('/{routes:.+}', function ($request, $response, $args) {
        return $response;
    });


    $app->addBodyParsingMiddleware(); 
    $app->addRoutingMiddleware();      

    /** @var ContainerInterface $container */
    $container = $app->getContainer();
    

    $settings = $container->get(Configuration::class)->getArray('error_handler_middleware');

    $errorMiddleware = $app->addErrorMiddleware(
        $settings['display_error_details'],  
        $settings['log_errors'],           
        $settings['log_error_details']     
    );


    /** @var ErrorHandler $errorHandler */
    $errorHandler = $errorMiddleware->getDefaultErrorHandler();
    $errorHandler->registerErrorRenderer('text/html', HtmlErrorRenderer::class);
    $errorHandler->registerErrorRenderer('application/json', JsonErrorRenderer::class);
};