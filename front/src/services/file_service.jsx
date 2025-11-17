const API_URL = import.meta.env.VITE_API_URL;

export const file_service = {
    async obtenerEspacioRestante(token) {
        try {
            const response = await fetch(`${API_URL}/archivo/obtener_espacio_restante`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Error al obtener espacio restante:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    async encriptarArchivo(token, datos) {
        try {
            const formData = new FormData();
            formData.append("tipo", datos.tipo);
            formData.append("contraseña", datos.contraseña);
            formData.append("archivo", datos.archivo);

            const response = await fetch(`${API_URL}/archivo/encriptar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (datos.tipo === "Local") {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = datos.archivo.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return {success: true, message: "Archivo descargado correctamente"};
            }

            return await response.json();
        } catch (error) {
            console.error("Error al encriptar archivo:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    async desencriptarLocal(token, datos) {
        try {
            const formData = new FormData();
            formData.append("contraseña", datos.contraseña);
            formData.append("ID_File", datos.ID_File);
            formData.append("archivo", datos.archivo);

            const response = await fetch(`${API_URL}/archivo/desencriptar/local`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = datos.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return {success: true, message: "Archivo descargado correctamente"};
            }

            return await response.json();
        } catch (error) {
            console.error("Error al desencriptar archivo local:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    async desencriptarNube(token, datos) {
        try {
            const formData = new FormData();
            formData.append("contraseña", datos.contraseña);
            formData.append("ID_File", datos.ID_File);

            const response = await fetch(`${API_URL}/archivo/desencriptar/nube`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = datos.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                return {success: true, message: "Archivo descargado correctamente"};
            }

            return await response.json();
        } catch (error) {
            console.error("Error al desencriptar archivo de nube:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    async eliminarArchivo(token, ID_File) {
        try {
            const formData = new FormData();
            formData.append("ID_File", ID_File);

            const response = await fetch(`${API_URL}/archivo/eliminar`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            return await response.json();
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

    async listarArchivos(token) {
        try {
            const response = await fetch(`${API_URL}/archivo/listar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error("Error al listar archivos:", error);
            return {success: false, error: "Error de conexión"};
        }
    }
};