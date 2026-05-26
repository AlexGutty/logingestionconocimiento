-- ============================================
-- Base de datos: gestion_conocimiento
-- ============================================

CREATE DATABASE IF NOT EXISTS gestion_conocimiento
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_conocimiento;

-- ============================================
-- Tabla de usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuario') DEFAULT 'usuario',
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
