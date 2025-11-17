const API_URL = import.meta.env.VITE_API_URL;
import {usuarios_service} from "./usuarios_service.jsx";
import {noti_util} from "../utils/noti_util.jsx";

export const authService = {

    async login(datos) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            const resultado = await response.json();
            if (resultado.success && resultado.token) {
                localStorage.setItem('token', resultado.token);
                return {success: true, token: resultado.token};
            }

            return {success: false, error: resultado.error};
        } catch (error) {
            console.error("Error en login:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    async registro(datos) {
        try {
            const response = await fetch(`${API_URL}/auth/registro`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            const resultado = await response.json();
            return resultado;
        } catch (error) {
            console.error("Error en registro:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    estaAutenticado() {
        const token = localStorage.getItem('token');
        if (!token) {
            return false;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiracion = payload.exp * 1000;
            const ahora = Date.now();

            if (ahora >= expiracion) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error al decodificar token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            return false;
        }
    },

    obtenerToken() {
        return localStorage.getItem('token');
    },

    logout() {
        const token = localStorage.getItem('token');

        let tokenValido = false;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiracion = payload.exp * 1000;
                tokenValido = Date.now() < expiracion;
            } catch (error) {
                tokenValido = false;
            }
        }

        if (tokenValido) {
            try {
                usuarios_service.crear_log(token, {
                    desc: "Se cerró sesión",
                    tipo: "Sesion"
                });
            } catch (error) {
                console.error("Error al crear log:", error);
            }
        }

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = "/login";
    },

    async peticionAutenticada(endpoint, options = {}) {
        if (!this.estaAutenticado()) {
            noti_util("error", "Sesión caducada, vuelva a iniciar sesión");
            window.location.href = '/login';
            return null;
        }

        const token = this.obtenerToken();

        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                console.log('Token inválido según el servidor');
                this.logout();
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error("Error en petición:", error);
            throw error;
        }
    }
};