import React from 'react';
import {User} from "lucide-react";
import {useAppContext} from "../../context/AppProvider.jsx";
import Button from "./Button.jsx";
import {useNavigate} from "react-router-dom";
import {authService} from "../../services/auth_service.jsx"

export default function User_card() {
    const { usuario, fotoPerfilUrl } = useAppContext();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    
    if (!usuario) {
        return null;
    }

    function cerrar_sesion() {
        authService.logout();
        console.log("Sesion cerrada3");
        window.location.reload();
    }
    const urlFoto = fotoPerfilUrl || (usuario.foto_perfil ? `${API_URL}/fotos-perfil/${usuario.foto_perfil}` : null);
    
    const fotoComponent = urlFoto ? (
        <img 
            src={urlFoto} 
            alt="Foto de perfil del usuario" 
            className="w-full bg-black/50 h-full rounded-full object-cover"
        />
    ) : (
        <User className="w-6 h-6 text-gray-500"/>
    );

    return (
        <div className="p-4 rounded-lg shadow-md flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <p className="text-white text-base font-semibold">
                    {usuario.nombres + " " + usuario.apellidos}
                </p>
                <Button variant="small_1" onClick={cerrar_sesion}>
                    Cerrar Sesion
                </Button>
            </div>
            <div
                onClick={() => navigate('/perfil')}
                className="w-14 h-14 rounded-full flex items-center justify-center
                           border-2 border-blue-500 overflow-hidden bg-black/50 cursor-pointer"
            >
                {fotoComponent}
            </div>
        </div>
    );
}