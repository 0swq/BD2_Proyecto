import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './auth_service.jsx';
import { usuarios_service } from './usuarios_service.jsx';
import { noti_util } from "../utils/noti_util.jsx";
import { useAppContext } from "../context/AppProvider.jsx";

export const useAuth = () => {
    const navigate = useNavigate();
    const { setAdministrador } = useAppContext();
    useEffect(() => {
        const verificarAutenticacion = async () => {
            if (!authService.estaAutenticado()) {
                console.log("revisado, token invalido");
                noti_util("error", "Sesión caducada, vuelva a iniciar sesión");
                navigate('/login', { replace: true });
                return;
            }

            const token = authService.obtenerToken();
            const resultado = await usuarios_service.getUsuario(token);
            console.log("res: ",resultado.usuario.rol === "Admin");
            if (resultado.success && resultado.usuario) {
                const esAdmin = resultado.usuario.rol === "Admin";
                setAdministrador(esAdmin);

                if (esAdmin) {
                    console.log(true);
                }
            }
        };

        verificarAutenticacion();
    }, [navigate, setAdministrador]);
};