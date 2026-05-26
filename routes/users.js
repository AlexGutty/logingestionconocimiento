/**
 * Rutas de gestión de usuarios (protegidas)
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/users - Listar todos los usuarios (admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, email, rol, activo, fecha_creacion, fecha_actualizacion FROM usuarios ORDER BY fecha_creacion DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    // Solo admin puede cambiar rol/activo, o el propio usuario puede editar su perfil
    const isOwn = req.session.user.id === parseInt(id);
    const isAdmin = req.session.user.rol === 'admin';

    if (!isOwn && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para editar este usuario.' });
    }

    let query, params;

    if (isAdmin) {
      query = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?';
      params = [nombre, email, rol, activo, id];
    } else {
      query = 'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?';
      params = [nombre, email, id];
    }

    await pool.execute(query, params);

    // Actualizar sesión si es el propio usuario
    if (isOwn) {
      req.session.user.nombre = nombre;
      req.session.user.email = email;
    }

    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario.' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminarse a sí mismo
    if (req.session.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo.' });
    }

    await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

module.exports = router;
