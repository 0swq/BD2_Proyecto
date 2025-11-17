import React, {createContext, useState, useContext, useEffect} from "react";
import {authService} from "../services/auth_service";
import {usuarios_service} from "../services/usuarios_service.jsx";

const AppContext = createContext();

export function AppProvider({children}) {
    const [usuario, setUsuario] = useState(null);
    const [bovedaAbierta, setBovedaAbierta] = useState(false);
    const [cargandoUsuario, setCargandoUsuario] = useState(true);
    const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);

    useEffect(() => {
        const cargarUsuario = async () => {
            if (authService.estaAutenticado()) {
                const token = authService.obtenerToken();
                const resultado = await usuarios_service.getUsuario(token);
                if (resultado.success) {
                    setUsuario(resultado.usuario);
                } else {
                    console.error('Error al cargar usuario:', resultado.error);
                    authService.logout();
                }
            }
            setCargandoUsuario(false);
        };

        cargarUsuario();
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);

        const resultado = await usuarios_service.getUsuario(token);
        if (resultado.success) {
            setUsuario(resultado.usuario);
        }
    };

    const logout = () => {
        authService.logout();
        setUsuario(null);
        setBovedaAbierta(false);
        setFotoPerfilUrl(null);
    };

    const actualizarFotoPerfil = (nuevaUrl) => {
        setFotoPerfilUrl(nuevaUrl);
    };
    const recargarUsuario = async () => {
        if (authService.estaAutenticado()) {
            const token = authService.obtenerToken();
            const resultado = await usuarios_service.getUsuario(token);
            if (resultado.success) {
                setUsuario(resultado.usuario);
                return resultado.usuario;
            } else {
                console.error('Error al recargar usuario:', resultado.error);
                return null;
            }
        }
        return null;
    };

    const logeado = authService.estaAutenticado();
    const administrador = usuario?.rol === 'Administrador';
    const token = authService.obtenerToken();

    return (
        <AppContext.Provider
            value={{
                usuario,
                setUsuario,
                bovedaAbierta,
                setBovedaAbierta,
                logeado,
                administrador,
                token,
                login,
                logout,
                cargandoUsuario,
                fotoPerfilUrl,
                actualizarFotoPerfil,
                recargarUsuario
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}