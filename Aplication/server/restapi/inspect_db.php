<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'member_loyality1'; // Dengan 'i' sesuai .env

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "--- ANALYZING TABLES ---\n";

$tables = ['member_point_ledger', 'point_redemptions', 'transactions'];

foreach ($tables as $table) {
    echo "Table: $table\n";
    $result = $conn->query("DESCRIBE $table");
    while ($row = $result->fetch_assoc()) {
        echo "  Field: {$row['Field']} | Type: {$row['Type']}\n";
    }
}

$conn->close();
