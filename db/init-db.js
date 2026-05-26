/**
 * Script para inicializar la base de datos y crear un usuario admin por defecto.
 * Ejecutar: npm run db:init
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initDB() {
  let connection;

  try {
    // Conexión sin base de datos para poder crearla
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL');

    // Leer y ejecutar el script SQL
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await connection.query(sql);
    console.log('✅ Base de datos y tablas creadas');

    // Crear usuario admin por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const insertAdmin = `
      INSERT IGNORE INTO gestion_conocimiento.usuarios (nombre, email, password, rol)
      VALUES (?, ?, ?, 'admin')
    `;
    const [result] = await connection.execute(insertAdmin, [
      'Administrador',
      'admin@demo.com',
      hashedPassword
    ]);

    if (result.affectedRows > 0) {
      console.log('✅ Usuario admin creado:');
      console.log('   Email: admin@demo.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  El usuario admin ya existe');
    }

    console.log('\n🚀 Base de datos lista. Ejecuta: npm run dev');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDB();
