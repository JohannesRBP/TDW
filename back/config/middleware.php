<?php

use Psr\Container\ContainerInterface;
use Selective\Config\Configuration;
use Slim\App;
use Slim\Handlers\ErrorHandler;
use TDW\ACiencia\Handler\{ HtmlErrorRenderer, JsonErrorRenderer };
use TDW\ACiencia\Middleware\CorsMiddleware;

return function (App $app) {

    // Middleware CORS
    $app->add(function ($request, $handler) {
        $response = $handler->handle($request);

        $origin = $request->getHeaderLine('Origin');
        $allowedOrigins = ['http://localhost:63342']; // Puedes añadir más orígenes si es necesario

        if (in_array($origin, $allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }

        return $response
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    });

    // Permitir peticiones OPTIONS (preflight)
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        return $response;
    });


    /** @var ContainerInterface $container */
    $container = $app->getContainer();

    // Parse json, form data and xml
    $app->addBodyParsingMiddleware();


    $app->addRoutingMiddleware();
    // $app->add(BasePathMiddleware::class);

    // Error handler
    $settings = $container->get(Configuration::class)->getArray('error_handler_middleware');
    $displayErrorDetails = (bool) $settings['display_error_details'];
    $logErrors = (bool) $settings['log_errors'];
    $logErrorDetails = (bool) $settings['log_error_details'];

    $errorMiddleware = $app->addErrorMiddleware($displayErrorDetails, $logErrors, $logErrorDetails);

    /** @var ErrorHandler $errorHandler */
    $errorHandler = $errorMiddleware->getDefaultErrorHandler();
    $errorHandler->registerErrorRenderer('text/html', HtmlErrorRenderer::class);
    $errorHandler->registerErrorRenderer('application/json', JsonErrorRenderer::class);
};
