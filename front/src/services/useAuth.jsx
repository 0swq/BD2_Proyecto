
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './auth_service.jsx';
import {noti_util} from "../utils/noti_util.jsx";

export const useAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!authService.estaAutenticado()) {
            console.log("revisado, token invalido")
            noti_util("error","Sesión caducada, vuelva a iniciar sesión")
            console.log(window.location.namespace);
            navigate('/login', { replace: true });

        }
    }, [navigate]);


};
