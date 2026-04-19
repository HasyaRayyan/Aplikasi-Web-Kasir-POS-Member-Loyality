<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'member_loyality1';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "--- ALTERING TABLES ---\n";

$sql1 = "ALTER TABLE member_point_ledger MODIFY earned_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP";
$sql2 = "ALTER TABLE member_point_ledger MODIFY expiry_date DATETIME NULL DEFAULT NULL";

if ($conn->query($sql1) === TRUE) {
    echo "earned_date updated to DATETIME\n";
} else {
    echo "Error updating earned_date: " . $conn->error . "\n";
}

if ($conn->query($sql2) === TRUE) {
    echo "expiry_date updated to DATETIME\n";
} else {
    echo "Error updating expiry_date: " . $conn->error . "\n";
}

$conn->close();
