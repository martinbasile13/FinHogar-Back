import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const router = express.Router();

// Registro de usuario
router.post('/register', (req, res) => {
    const { nombre, email, password } = req.body;

    // Validación de datos
    if (!nombre || !email || !password) {
        return res.status(400).send('Todos los campos son obligatorios.');
    }

    // Verificar si el correo electrónico ya existe
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo electrónico:', err);
            return res.status(500).send('Error en el servidor.');
        }

        if (results.length > 0) {
            return res.status(409).send('El correo electrónico ya está registrado.');
        }

        // Si el correo no existe, procede a registrar el usuario
        const hashedPassword = bcrypt.hashSync(password, 8);

        db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [nombre, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).send('Error en el servidor.');
            }
            console.log('Usuario registrado con éxito:', email);

            // Generar el token JWT
            const token = jwt.sign({ id: result.insertId }, 'secret', { expiresIn: 86400 }); // 24 horas

            // Enviar el token y el ID del usuario
            res.status(201).send({
                auth: true,
                token: token,
                userId: result.insertId
            });
        });
    });
});

// Autenticación de usuario
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Intentando iniciar sesión para:', email);

    // Validación de campos
    if (!email || !password) {
        return res.status(400).send('Email y contraseña son requeridos');
    }

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send('Error en el servidor');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send('Contraseña incorrecta');
        }

        // Generar el token JWT
        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 }); // 24 horas

        // Enviar el token y el ID del usuario
        res.status(200).send({
            auth: true,
            token: token,
            userId: user.id
        });
    });
});

export default router; 