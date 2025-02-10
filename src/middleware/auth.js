import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send('No se recibió un token.');
    }

    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            console.error('Error al autenticar el token:', err);
            return res.status(500).send('Error al autenticar el token.');
        }
        req.userId = decoded.id;
        next();
    });
}
