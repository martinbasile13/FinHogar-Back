import express from 'express';
import db from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Crear transacción
router.post('/', verifyToken, (req, res) => {
    console.log('Intentando crear transacción para usuario ID:', req.userId);
    const { tipo, cantidad, descripcion, fecha } = req.body;
    const fechaTransaccion = fecha || new Date();

    db.query('INSERT INTO transacciones (usuario_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?)', [req.userId, tipo, cantidad, descripcion, fechaTransaccion], (err, result) => {
        if (err) {
            console.error('Error al crear transacción:', err);
            return res.status(500).send('Error en el servidor.');
        }
        console.log('Transacción creada con éxito para usuario ID:', req.userId);
        res.status(201).send('Transacción creada.');
    });
});

// Obtener todas las transacciones
router.get('/', verifyToken, (req, res) => {
    db.query('SELECT * FROM transacciones WHERE usuario_id = ?', [req.userId], (err, results) => {
        if (err) {
            console.error('Error al obtener transacciones:', err);
            return res.status(500).send('Error en el servidor.');
        }
        res.status(200).send(results);
    });
});

// Obtener una transacción específica
router.get('/:id', verifyToken, (req, res) => {
    const transaccionId = req.params.id;

    db.query('SELECT * FROM transacciones WHERE id = ? AND usuario_id = ?', [transaccionId, req.userId], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor.');
        if (results.length === 0) return res.status(404).send('Transacción no encontrada.');
        res.status(200).send(results[0]);
    });
});

// Eliminar una transacción
router.delete('/:id', verifyToken, (req, res) => {
    const transaccionId = req.params.id;
    const usuarioId = req.userId; // Obtenido del token JWT

    const query = `
        DELETE FROM transacciones 
        WHERE id = ? AND usuario_id = ?
    `;

    db.query(query, [transaccionId, usuarioId], (err, result) => {
        if (err) {
            console.error('Error al eliminar transacción:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Transacción no encontrada');
        }

        res.status(200).send('Transacción eliminada exitosamente');
    });
});

// Editar una transacción
router.put('/:id', verifyToken, (req, res) => {
    const transaccionId = req.params.id;
    const usuarioId = req.userId; // Obtenido del token JWT
    const { tipo, cantidad, descripcion } = req.body;

    // Validación de datos
    if (!tipo || !cantidad) {
        return res.status(400).send('Tipo y cantidad son requeridos');
    }

    if (tipo !== 'ingreso' && tipo !== 'gasto') {
        return res.status(400).send('El tipo debe ser "ingreso" o "gasto"');
    }

    if (cantidad <= 0) {
        return res.status(400).send('La cantidad debe ser mayor a 0');
    }

    const query = `
        UPDATE transacciones 
        SET tipo = ?, cantidad = ?, descripcion = ?
        WHERE id = ? AND usuario_id = ?
    `;

    db.query(query, [tipo, cantidad, descripcion, transaccionId, usuarioId], (err, result) => {
        if (err) {
            console.error('Error al editar transacción:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Transacción no encontrada');
        }

        res.status(200).send('Transacción actualizada exitosamente');
    });
});

export default router;