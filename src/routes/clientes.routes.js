import express from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los clientes del usuario
router.get('/', verifyToken, (req, res) => {
    const usuarioId = req.userId;

    db.query('SELECT * FROM clientes WHERE usuario_id = ?', [usuarioId], (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.status(200).json(results);
    });
});

// Obtener un cliente específico
router.get('/:id', verifyToken, (req, res) => {
    const clienteId = req.params.id;
    const usuarioId = req.userId;

    db.query('SELECT * FROM clientes WHERE id = ? AND usuario_id = ?', [clienteId, usuarioId], (err, results) => {
        if (err) {
            console.error('Error al obtener cliente:', err);
            return res.status(500).send('Error en el servidor');
        }
        if (results.length === 0) {
            return res.status(404).send('Cliente no encontrado');
        }
        res.status(200).json(results[0]);
    });
});

// Crear un nuevo cliente
router.post('/', verifyToken, (req, res) => {
    const { empresa, numero, info, contacto, direccion, tipo } = req.body;
    const usuarioId = req.userId;

    const query = `
        INSERT INTO clientes (usuario_id, empresa, numero, info, contacto, direccion, tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [usuarioId, empresa, numero, info, contacto, direccion, tipo], (err, result) => {
        if (err) {
            console.error('Error al crear cliente:', err);
            return res.status(500).send('Error en el servidor');
        }
        res.status(201).send('Cliente creado exitosamente');
    });
});

// Eliminar un cliente
router.delete('/:id', verifyToken, (req, res) => {
    const clienteId = req.params.id;
    const usuarioId = req.userId; // Obtenido del token JWT

    const query = `
        DELETE FROM clientes 
        WHERE id = ? AND usuario_id = ?
    `;

    db.query(query, [clienteId, usuarioId], (err, result) => {
        if (err) {
            console.error('Error al eliminar cliente:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        res.status(200).send('Cliente eliminado exitosamente');
    });
});

// Editar un cliente
router.put('/:id', verifyToken, (req, res) => {
    const clienteId = req.params.id;
    const usuarioId = req.userId; // Obtenido del token JWT
    const { empresa, numero, info, contacto, direccion, tipo } = req.body;

    const query = `
        UPDATE clientes 
        SET empresa = ?, numero = ?, info = ?, contacto = ?, direccion = ?, tipo = ?
        WHERE id = ? AND usuario_id = ?
    `;

    db.query(query, [empresa, numero, info, contacto, direccion, tipo, clienteId, usuarioId], (err, result) => {
        if (err) {
            console.error('Error al editar cliente:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Cliente no encontrado');
        }

        res.status(200).send('Cliente actualizado exitosamente');
    });
});

export default router; 