<?php

use CodeIgniter\Router\RouteCollection;

$routes->options('(:any)', function () {
    return response()
        ->setStatusCode(200)
        ->setHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
        ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
});


/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('auth', 'Auth::index');
$routes->post('auth/login', 'Auth::login');

$routes->group('api', function ($routes) {
    $routes->get('products', 'ProductController::index');
    // $routes->get('addons', 'ProductController::addons');
    $routes->post('products', 'ProductController::create');
    $routes->get('categories', 'ProductController::categories');
    $routes->delete('products/(:num)', 'ProductController::delete/$1');
    $routes->get('generate-product-code', 'ProductController::generateCode');
    $routes->post('updateproduct/(:num)', 'ProductController::updates/$1');

    $routes->get('addons', 'AddonController::index');
    $routes->post('addons', 'AddonController::create');
    $routes->post('addons/update/(:num)', 'AddonController::update/$1');
    $routes->delete('addons/(:num)', 'AddonController::delete/$1');

    $routes->get('kasir', 'Kasir::index');
    $routes->get('getmemberbyphone', 'Kasir::memberByPhone');

});


