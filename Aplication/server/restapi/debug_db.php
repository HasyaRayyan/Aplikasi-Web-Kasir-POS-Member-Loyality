<?php
$host = 'localhost';
$db   = 'member_loyality1';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

function dumpTable($conn, $table) {
    echo "--- TABLE: $table ---\n";
    $res = $conn->query("SELECT * FROM $table LIMIT 10");
    if ($res) {
        while($row = $res->fetch_assoc()) {
            print_r($row);
        }
    } else {
        echo "Error: " . $conn->error . "\n";
    }
    echo "\n";
}

dumpTable($conn, 'users');
dumpTable($conn, 'members');
dumpTable($conn, 'transactions');
dumpTable($conn, 'member_point_ledger');
