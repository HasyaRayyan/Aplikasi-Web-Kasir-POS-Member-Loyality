<?php
// Load CodeIgniter
define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR);
$autoloader = 'vendor/autoload.php';
require_once $autoloader;

$db = \Config\Database::connect();

echo "--- USERS ---\n";
$users = $db->table('users')->limit(5)->get()->getResultArray();
print_r($users);

echo "\n--- MEMBERS ---\n";
$members = $db->table('members')->limit(5)->get()->getResultArray();
print_r($members);

echo "\n--- TRANSACTIONS ---\n";
$transactions = $db->table('transactions')->limit(5)->get()->getResultArray();
print_r($transactions);

echo "\n--- LEDGER ---\n";
$ledger = $db->table('member_point_ledger')->limit(5)->get()->getResultArray();
print_r($ledger);
