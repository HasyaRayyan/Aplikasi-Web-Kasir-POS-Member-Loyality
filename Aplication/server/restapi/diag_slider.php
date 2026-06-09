<?php

// Diagnostic script for Slider Banner CRUD

require 'vendor/autoload.php';
require 'spark'; // This might not work as CLI depends on spark, let's use the framework init

try {
    $db = \Config\Database::connect();
    echo "Database Connected: " . $db->getDatabase() . "\n";
    
    // Check table existence
    if ($db->tableExists('banners')) {
        echo "Table 'banners' exists.\n";
        $fields = $db->getFieldNames('banners');
        echo "Fields: " . implode(", ", $fields) . "\n";
    } else {
        echo "Table 'banners' DOES NOT exist!\n";
    }

    // Check count
    $model = new \App\Models\BannerModel();
    echo "Banner count: " . $model->countAll() . "\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
