import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth.js';
import db from '../config/db.js';

const router = express.Router();

// Registro de usuario
router.post('/register', (req, res) => {
    const { nombre, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [nombre, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).send('Error en el servidor.');
        res.status(201).send('Usuario registrado.');
    });
});

// Autenticación de usuario
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor.');
        if (results.length === 0) return res.status(404).send('Usuario no encontrado.');

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) return res.status(401).send('Contraseña incorrecta.');

        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 });
        res.status(200).send({ auth: true, token });
    });
});

// Obtener todos los usuarios (requiere privilegios de administrador)
router.get('/', verifyToken, (req, res) => {
    // Aquí podrías verificar si el usuario tiene privilegios de administrador
    db.query('SELECT id, nombre, email FROM usuarios', (err, results) => {
        if (err) return res.status(500).send('Error en el servidor.');
        res.status(200).send(results);
    });
});

// Obtener un usuario específico
router.get('/:id', verifyToken, (req, res) => {
    const userId = req.params.id;

    // Asegúrate de que el usuario solo pueda ver su propio perfil
    if (req.userId !== parseInt(userId)) {
        return res.status(403).send('Acceso denegado.');
    }

    db.query('SELECT id, nombre, email FROM usuarios WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).send('Error en el servidor.');
        if (results.length === 0) return res.status(404).send('Usuario no encontrado.');
        res.status(200).send(results[0]);
    });
});

// Eliminar un usuario
router.delete('/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    console.log('Intentando eliminar usuario con ID:', userId);

    if (req.userId !== parseInt(userId)) {
        console.warn('Acceso denegado para eliminar usuario con ID:', userId);
        return res.status(403).send('Acceso denegado.');
    }

    db.query('DELETE FROM usuarios WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).send('Error en el servidor.');
        }
        if (result.affectedRows === 0) {
            console.warn('Usuario no encontrado para eliminación con ID:', userId);
            return res.status(404).send('Usuario no encontrado.');
        }
        console.log('Usuario eliminado con éxito con ID:', userId);
        res.status(200).send('Usuario eliminado.');
    });
});

// Obtener el usuario actual usando el token JWT
router.get('/id', verifyToken, (req, res) => {
    console.log('Obteniendo usuario del token, ID:', req.userId);

    const query = `
        SELECT id, nombre, email
        FROM usuarios
        WHERE id = ?
    `;

    db.query(query, [req.userId], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        console.log('Usuario obtenido con éxito');
        res.status(200).json(results[0]);
    });
});

export default router;