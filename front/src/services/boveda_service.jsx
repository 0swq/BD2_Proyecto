

const API_URL = import.meta.env.VITE_API_URL;
export const boveda_service = {
    async ingresar(token, archivo) {
        try {
            const formData = new FormData();
            formData.append("file", archivo);

            const response = await fetch(`${API_URL}/boveda/ingresar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const resultado = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    usuario: resultado.usuario,
                    similitud: resultado.similitud,
                    coincide: resultado.coincide,
                };
            }

            return {
                success: false,
                error: resultado.detail || "Error en la autenticación",
            };

        } catch (error) {
            console.error("Error al enviar datos biométricos:", error);
            return {success: false, error: "Error de conexión"};
        }
    }
};
