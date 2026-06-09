<?php

$db = \Config\Database::connect();

$sql = "
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
";

$db->query($sql);

$check = $db->table('banners')->countAllResults();
if ($check == 0) {
    $db->query("
        // INSERT INTO `banners` (`id`, `title`, `image`, `is_active`) VALUES
        // (1, 'Promo Weekend Coffee', 'banner1.jpg', 1),
        // (2, 'New Merchandise Out Now!', 'banner2.jpg', 1),
        // (3, 'Buy 1 Get 1 Tuesday', 'banner3.jpg', 1);
    ");
}

echo "Database banners table checked and ready. Total rows: " . $db->table('banners')->countAllResults();
