<?php

// Script to initialize and fix banner directory and placeholders

$publicPath = __DIR__ . '/public/';
$bannerPath = $publicPath . 'uploads/banners/';

echo "Checking banner directory: $bannerPath\n";

if (!is_dir($bannerPath)) {
    if (mkdir($bannerPath, 0777, true)) {
        echo "Successfully created banner directory.\n";
    } else {
        die("Failed to create banner directory.\n");
    }
} else {
    echo "Banner directory already exists.\n";
}

// Ensure it's writable
chmod($bannerPath, 0777);

// Try to create a dummy placeholder if it doesn't exist
$placeholderFiles = ['banner1.jpg', 'banner2.jpg', 'banner3.jpg'];
$sampleProductImg = null;

// Find a sample product image to use as placeholder
$productDir = $publicPath . 'uploads/products/';
if (is_dir($productDir)) {
    $files = scandir($productDir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..' && @getimagesize($productDir . $file)) {
            $sampleProductImg = $productDir . $file;
            break;
        }
    }
}

foreach ($placeholderFiles as $pfile) {
    $target = $bannerPath . $pfile;
    if (!file_exists($target)) {
        if ($sampleProductImg) {
            copy($sampleProductImg, $target);
            echo "Copied sample image to $pfile\n";
        } else {
            // Create a simple colored JPEG if no sample image
            $img = imagecreatetruecolor(800, 450);
            $bg = imagecolorallocate($img, 34, 197, 94); // Emerald color
            imagefill($img, 0, 0, $bg);
            imagestring($img, 5, 300, 200, "THE 44 PROMO - $pfile", imagecolorallocate($img, 255, 255, 255));
            imagejpeg($img, $target);
            imagedestroy($img);
            echo "Created generated placeholder for $pfile\n";
        }
    } else {
        echo "$pfile already exists.\n";
    }
}

echo "Banners directory fix complete.\n";
