<?php

namespace App\Config;

use CodeIgniter\Config\BaseConfig;
use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// CORS Options Pre-flight
$routes->options('(:any)', function () {
    return response()
        ->setStatusCode(200)
        ->setHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
        ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
});

// GLOBAL API GROUP
$routes->group('api', function ($routes) {
    
    // Auth Routes
    $routes->post('auth/login', 'Auth::login');
    $routes->post('auth/register', 'Auth::register');
    $routes->post('auth/check-phone', 'Auth::checkPhone');
    $routes->post('auth/send-otp', 'Auth::sendOTP');
    $routes->post('auth/logout', 'Auth::logout');
    $routes->post('auth/verify-password', 'Auth::verifyPassword');
    $routes->post('auth/reset-password/request', 'Auth::requestReset');
    $routes->post('auth/reset-password/verify', 'Auth::commitReset');

    // Product & Categories
    $routes->get('products', 'ProductController::index');
    $routes->post('products', 'ProductController::create');
    $routes->delete('products/(:num)', 'ProductController::delete/$1');
    $routes->get('generate-product-code', 'ProductController::generateCode');
    $routes->post('updateproduct/(:num)', 'ProductController::updates/$1');
    // categories are now handled by the Resource controller below

    // Addons
    $routes->get('addons', 'AddonController::index');
    $routes->post('addons', 'AddonController::create');
    $routes->post('addons/update/(:num)', 'AddonController::update/$1');
    $routes->delete('addons/(:num)', 'AddonController::delete/$1');

    // Kasir & Transactions
    $routes->get('kasir', 'Kasir::index');
    $routes->get('getmemberbyphone', 'Kasir::memberByPhone');
    $routes->post('transaction', 'Kasir::transaction');
    $routes->get('history', 'Kasir::getHistory');
    $routes->post('kasir/claim/(:num)', 'Kasir::claimRedemption/$1');

    // Point Rules
    $routes->get('point-rule-active', 'PointController::active');
    $routes->get('point-rules', 'PointController::index');
    $routes->post('point-rules', 'PointController::create');
    $routes->put('point-rules/(:num)', 'PointController::update/$1');
    $routes->delete('point-rules/(:num)', 'PointController::delete/$1');
    $routes->post('point-rules/active/(:num)', 'PointController::setActive/$1');

    // User Management
    $routes->get('users', 'UserController::index');
    $routes->post('users', 'UserController::create');
    $routes->post('users/update/(:num)', 'UserController::update/$1');
    $routes->delete('users/(:num)', 'UserController::delete/$1');
    $routes->get('users/roles', 'UserController::roles');

    // Dashboard Metrics
    $routes->get('dashboard/metrics', 'DashboardController::metrics');
    $routes->get('dashboard/chart', 'DashboardController::chart');
    $routes->get('dashboard/best-products', 'DashboardController::bestProducts');
    $routes->get('dashboard/recent-transactions', 'DashboardController::recentTransactions');

    // Member Specifics
    $routes->get('home-member/(:num)', 'HomeMember::index/$1');
    $routes->get('debug-data/(:num)', 'HomeMember::debugData/$1');
    $routes->post('member/redeem', 'RedemptionController::redeem');
    $routes->get('member/redemptions/(:num)', 'RedemptionController::history/$1');
    $routes->get('member/points-history/(:num)', 'PointMember::history/$1');
    $routes->get('member/exchangeable-products', 'RedemptionController::getExchangeableProducts');
    
    $routes->get('riwayat-member/(:num)', 'RiwayatMember::index/$1');
    $routes->get('profile/(:num)', 'ProfileMember::index/$1');
    $routes->post('profile/update/(:num)', 'ProfileMember::update/$1');
    $routes->post('profile/password/(:num)', 'ProfileMember::changePassword/$1');

    // Resource Route for Categories - Fixed Controller Name
    $routes->resource('categories', ['controller' => 'Category']);
});
