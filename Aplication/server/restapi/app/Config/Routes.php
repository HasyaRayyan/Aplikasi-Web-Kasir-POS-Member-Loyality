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
$routes->post('auth/logout', 'Auth::logout');


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
    $routes->post('transaction', 'Kasir::transaction');
    $routes->get('history', 'Kasir::getHistory');
    $routes->post('kasir/claim/(:num)', 'Kasir::claimRedemption/$1');


    //point
    $routes->get('point-rule-active', 'PointController::active');
    $routes->get('point-rules', 'PointController::index');
    $routes->post('point-rules', 'PointController::create');
    $routes->put('point-rules/(:num)', 'PointController::update/$1');
    $routes->delete('point-rules/(:num)', 'PointController::delete/$1');
    $routes->post('point-rules/active/(:num)', 'PointController::setActive/$1');


});

$routes->group('api', function($routes){
    $routes->get('users', 'UserController::index');
    $routes->post('users', 'UserController::create');
    $routes->post('users/update/(:num)', 'UserController::update/$1');
    $routes->delete('users/(:num)', 'UserController::delete/$1');
    $routes->get('users/roles', 'UserController::roles');

});

$routes->group('api', function($routes) {
    $routes->get('dashboard/metrics', 'DashboardController::metrics');
    $routes->get('dashboard/chart', 'DashboardController::chart');
    $routes->get('dashboard/best-products', 'DashboardController::bestProducts');
    $routes->get('dashboard/recent-transactions', 'DashboardController::recentTransactions');
    
});


// $route->group('api', function($routes) {
//     $routes->get('home-member/(:num)', 'HomeMember::index/$1');
// });
$routes->get('api/home-member/(:num)', 'HomeMember::index/$1');
$routes->post('api/member/redeem', 'RedemptionController::redeem');
$routes->get('api/member/redemptions/(:num)', 'RedemptionController::history/$1');
$routes->get('api/member/exchangeable-products', 'RedemptionController::getExchangeableProducts');

$routes->get('api/riwayat-member/(:num)', 'RiwayatMember::index/$1');
 
$routes->get('api/profile/(:num)', 'ProfileMember::index/$1');
$routes->post('api/profile/update/(:num)', 'ProfileMember::update/$1');
$routes->post('api/profile/password/(:num)', 'ProfileMember::changePassword/$1');


$routes->group('api', function($routes) {
    $routes->resource('categories');
});
