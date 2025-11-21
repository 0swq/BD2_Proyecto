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

            // El backend espera "datos" como string JSON y "archivo" como file
            const dataDict = {
                tipo: datos.tipo,
                contrasena: datos.contrasena
            };
            formData.append("datos", JSON.stringify(dataDict));
            formData.append("archivo", datos.archivo);

            const response = await fetch(`${API_URL}/archivo/encriptar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            // Si es Local, el backend devuelve un archivo para descargar
            if (datos.tipo === "Local") {
                const blob = await response.blob();
                const contentDisposition = response.headers.get("Content-Disposition");

                // El backend envía el nombre como "nombre_sin_extension.ficure"
                let filename = datos.archivo.name.replace(/\.[^/.]+$/, "") + ".ficure";

                if (contentDisposition) {
                    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                return {success: true, message: "Archivo encriptado y descargado correctamente"};
            }

            // Si es Nube, el backend devuelve JSON
            return await response.json();
        } catch (error) {
            console.error("Error al encriptar archivo:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

   async desencriptarLocal(token, datos) {
    try {
        const formData = new FormData();
        formData.append("datos", JSON.stringify({
            ID_File: datos.ID_File,
            contrasena: datos.contrasena
        }));
        formData.append("archivo", datos.archivo);

        const response = await fetch(`${API_URL}/archivo/desencriptar/local`, {
            method: "POST",
            headers: {"Authorization": `Bearer ${token}`},
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get("Content-Disposition");

            // ✅ Obtener el nombre del archivo del header Content-Disposition
            let filename = "archivo_desencriptado";

            if (contentDisposition) {
                // Buscar filename="..." o filename*=UTF-8''...
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);

                if (filenameStarMatch) {
                    filename = decodeURIComponent(filenameStarMatch[1]);
                } else if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;  // ✅ Usar el nombre del backend
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            return {success: true, message: "Archivo desencriptado correctamente"};
        }

        const errorData = await response.json();
        return {success: false, error: errorData.detail || "Error al desencriptar"};
    } catch (error) {
        console.error("Error:", error);
        return {success: false, error: "Error de conexión"};
    }
},

    async desencriptarNube(token, datos) {
        try {
            const response = await fetch(`${API_URL}/archivo/desencriptar/nube`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ID_File: datos.ID_File,
                    contrasena: datos.contrasena
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const contentDisposition = response.headers.get("Content-Disposition");
                let filename = "archivo_desencriptado";

                if (contentDisposition) {
                    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                return {success: true, message: "Archivo desencriptado correctamente"};
            }

            const errorData = await response.json();
            return {
                success: false,
                error: errorData.detail || "Error al desencriptar archivo de nube"
            };
        } catch (error) {
            console.error("Error al desencriptar archivo de nube:", error);
            return {success: false, error: "Error de conexión"};
        }
    },

     async eliminarArchivo(token, ID_File, contrasena) {
        try {
            const response = await fetch(`${API_URL}/archivo/eliminar`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ID_File: ID_File,
                    contrasena: contrasena
                })
            });

            const resultado = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    message: resultado.message || "Archivo eliminado correctamente"
                };
            }

            return {
                success: false,
                error: resultado.detail || "Error al eliminar archivo"
            };
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

            const resultado = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    archivos: resultado.archivos || []
                };
            }

            return {
                success: false,
                error: resultado.detail || "Error al listar archivos"
            };
        } catch (error) {
            console.error("Error al listar archivos:", error);
            return {success: false, error: "Error de conexión"};
        }
    }
};