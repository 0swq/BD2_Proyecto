import React from 'react';
import {Lock, FileText, ChartNoAxesCombined, ShieldCheck} from 'lucide-react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAppContext} from '../../context/AppProvider.jsx';
import User_card from "../ui/user.jsx"
import {usuarios_service} from "../../services/usuarios_service.jsx";
import {authService} from "../../services/auth_service.jsx";
import {noti_util} from "../../utils/noti_util.jsx";
import Logo from "../../assets/Logo.png";
import {useAuth} from "../../services/useAuth.jsx";

const Sidebar = () => {
    useAuth()
    const {administrador} = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItemsBase = [
        {id: 'boveda', label: 'Bóveda', icon: Lock, path: '/boveda'},
        {id: 'encriptar', label: 'Encriptar', icon: FileText, path: '/encriptar'},
        {id: 'dashboard', label: 'Dashboard', icon: ChartNoAxesCombined, path: '/dashboard'},
    ];

    const itemsFinales = administrador
        ? [...menuItemsBase, {id: 'control', label: 'Control', icon: ShieldCheck, path: '/control'}]
        : menuItemsBase;

    const verificarAccesoYNavegar = async (item) => {
        const token = authService.obtenerToken();
        const res = await usuarios_service.get_registro_biometrico(token);


        if (!res.success) {
            noti_util("error", "Error validando registro biométrico");
            return;
        }

        if (!res.existe) {
            noti_util("advertencia", "Debes registrar tu clave biométrica primero");
            navigate("/perfil");
            return;
        }

        navigate(item.path);
    };

    return (
        <div className="w-56 bg-gray-900 h-screen flex flex-col">
            <div className="px-7 py-14 border-b border-gray-700 flex items-center justify-center">
                <Link to="/" className="flex items-center">
                    <img src={Logo} alt="Logo FICURE" className="h-6 w-auto object-contain"/>
                </Link>
            </div>
            <nav className="flex-1 py-6">
                {itemsFinales.map((item) => {
                    const Icon = item.icon;
                    const esActivo = location.pathname === item.path;
                    const requiereControl = item.id === 'boveda' || item.id === 'encriptar';

                    return (
                        <button
                            key={item.id}
                            className={`w-full px-6 py-3 text-left text-sm font-quicksand transition-colors ${
                                esActivo
                                    ? 'text-white bg-gray-800 border-l-4 border-green-500'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                            onClick={
                                requiereControl
                                    ? () => verificarAccesoYNavegar(item)
                                    : () => navigate(item.path)
                            }
                        >
                            <Icon className="inline-block w-4 h-4 mr-2"/>
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <User_card/>
        </div>
    );
};

export default Sidebar;