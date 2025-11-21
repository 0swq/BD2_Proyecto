const API_URL = import.meta.env.VITE_API_URL;

export const dashboard_service = {
    async resumen_mes_lineas(token) {
        try {
            const response = await fetch(`${API_URL}/dashboard/resumen_mes_lineas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.labels && resultado.data) {
                return {
                    success: true,
                    labels: resultado.labels,
                    data: resultado.data
                };
            }

            return {
                success: false,
                error: resultado.error || "Error al obtener resumen del mes"
            };
        } catch (error) {
            console.error("Error al obtener resumen mes líneas:", error);
            return {
                success: false,
                error: error.message || "Error de conexión"
            };
        }
    },

    async resumen_tipo_pie(token) {
        try {
            const response = await fetch(`${API_URL}/dashboard/resumen_tipo_pie`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();

            if (typeof resultado === 'object' && !resultado.error) {
                return {
                    success: true,
                    data: resultado
                };
            }

            return {
                success: false,
                error: resultado.error || "Error al obtener resumen por tipo"
            };
        } catch (error) {
            console.error("Error al obtener resumen tipo pie:", error);
            return {
                success: false,
                error: error.message || "Error de conexión"
            };
        }
    },

    async log_general(token) {
        try {
            const response = await fetch(`${API_URL}/dashboard/log_general`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.success && resultado.logs) {
                return {
                    success: true,
                    logs: resultado.logs
                };
            }

            return {
                success: false,
                error: resultado.error || "Error al obtener logs generales"
            };
        } catch (error) {
            console.error("Error al obtener log general:", error);
            return {
                success: false,
                error: error.message || "Error de conexión"
            };
        }
    },

    async log_ingresos_boveda(token) {
        try {
            const response = await fetch(`${API_URL}/dashboard/log_ingresos_boveda`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error ${response.status}: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.success && Array.isArray(resultado.ingresos)) {
                return {
                    success: true,
                    ingresos: resultado.ingresos
                };
            }

            return {
                success: false,
                error: resultado.error || "Error al obtener logs de ingresos"
            };
        } catch (error) {
            console.error("Error al obtener log ingresos bóveda:", error);
            return {
                success: false,
                error: error.message || "Error de conexión"
            };
        }
    },

    async log_especifico(token, id_solicitado) {
        try {
            const response = await fetch(`${API_URL}/dashboard/log_especifico?id_solicitado=${id_solicitado}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.success && resultado.logs) {
                return {
                    success: true,
                    logs: resultado.logs
                };
            }

            return {
                success: false,
                error: resultado.error || "Error al obtener logs específicos"
            };
        } catch (error) {
            console.error("Error al obtener log específico:", error);
            return {
                success: false,
                error: error.message || "Error de conexión"
            };
        }
    },

    async espacio_usado(token) {
        try {
            const response = await fetch(`${API_URL}/dashboard/espacio_usado`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.success && typeof resultado.total === 'number') {
                return {
                    success: true,
                    total: resultado.total
                };
            }

            return {
                success: false,
                error: resultado.error || "Error al obtener espacio usado"
            };
        } catch (error) {
            console.error("Error al obtener espacio usado:", error);
            return {
                success: false,
                error: error.message || "Error de conexión"
            };
        }
    }
};