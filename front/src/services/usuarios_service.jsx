const API_URL = import.meta.env.VITE_API_URL;

export const usuarios_service = {
    async getUsuario(token) {
        try {
            const response = await fetch(`${API_URL}/usuarios/perfil`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const resultado = await response.json();
            if (resultado.success && resultado.usuario) {
                return {success: true, usuario: resultado.usuario};
            }

            return {success: false, error: resultado.error || 'Fallo de autenticación'};
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            return {success: false, error: "Error de conexión"};
        }

    },
    async crear_log(token, datos) {
        try {
            const response = await fetch(`${API_URL}/usuarios/log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });
            const resultado = await response.json();
            if (resultado.success) {
                return {success: true};
            }
            return {success: false, error: resultado.error || 'Fallo de autenticación'};
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            return {success: false, error: "Error de conexión"};
        }


    },
    async actualizar(token, datos) {
        try {
            const response = await fetch(`${API_URL}/usuarios/actualizar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });
            const resultado = await response.json();
            if (resultado.success) {
                return {success: true, mensaje: resultado.mensaje};
            }
            return {success: false, error: resultado.error || 'Fallo de autenticación'};
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            return {success: false, error: "Error de conexión"};
        }

    },
    async cambiar_foto_perfil(token, archivo) {
        try {
            const formData = new FormData();
            formData.append("archivo", archivo);

            const response = await fetch(`${API_URL}/usuarios/cambiar_foto_perfil`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const resultado = await response.json();
            if (resultado.success) {
                return {success: true, mensaje: resultado.mensaje, ruta: resultado.ruta};
            }
            return {success: false, error: resultado.error || "Fallo de autenticación"};
        } catch (error) {
            console.error("Error al subir foto:", error);
            return {success: false, error: "Error de conexión"};
        }
    },
    async cambiar_contrasena(token, datos) {
        try {
            const response = await fetch(`${API_URL}/usuarios/cambiar_contrasena`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(datos),
            });
            const resultado = await response.json();
            if (resultado.success) {
                return {success: true};
            }
            return {success: false, error: resultado.error || 'Fallo de autenticación'};
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            return {success: false, error: "Error de conexión"};
        }


    },
    async registrar_biometrico(token, archivo) {
        try {
            const foto = new FormData();
            foto.append("foto", archivo);

            const response = await fetch(`${API_URL}/usuarios/registrar_biometrico`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: foto,
            });

            const resultado = await response.json();
            if (resultado.success) {
                return {success: true, mensaje: resultado.mensaje, ruta: resultado.ruta};
            }
            return {success: false, error: resultado.error || "Fallo de autenticación"};
        } catch (error) {
            console.error("Error al subir foto:", error);
            return {success: false, error: "Error de conexión"};
        }
    },
    async get_registro_biometrico(token) {
        try {
            const response = await fetch(`${API_URL}/usuarios/obtener_registro_biometrico`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
            const resultado = await response.json();
            if (resultado.success) {
                return {success: true, existe: resultado.existe, ultimo_cambio: resultado.ultimo_cambio};
            }
            return {success: false, error: resultado.error};
        } catch (error) {
            console.error("Error al obtener registro biometrico:", error);
            return {success: false, error: "Error de conexión"};
        }
    }

}


