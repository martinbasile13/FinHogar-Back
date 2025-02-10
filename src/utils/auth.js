export const verifyToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return false;
    }
    
    try {
        // Aquí puedes agregar lógica adicional para verificar el token si es necesario
        return true;
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return false;
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
}; 