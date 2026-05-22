-- MySQL database schema for Construction ERP Lite

CREATE DATABASE IF NOT EXISTS construction_erp_lite;
USE construction_erp_lite;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_name VARCHAR(200) NOT NULL,
  client_name VARCHAR(200) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  used_amount DECIMAL(12,2) NOT NULL,
  balance_amount DECIMAL(12,2) NOT NULL,
  instructions TEXT,
  start_date DATE NOT NULL,
  status ENUM('Planned','Active','Paused','Completed') NOT NULL DEFAULT 'Planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
