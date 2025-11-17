import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Eye, EyeOff} from 'lucide-react';
import {authService} from "../../services/auth_service.jsx";
import {useAppContext} from "../../context/AppProvider.jsx";
import {noti_util} from "../../utils/noti_util.jsx";
import {toast} from "react-toastify";

const LoginForm = () => {
    const navigate = useNavigate();
    const {login} = useAppContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (authService.estaAutenticado && authService.estaAutenticado()) {
            navigate('/dashboard', {replace: true});
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            noti_util("advertencia", "Por favor ingresa un email válido");
            return;
        }

        if (password.trim().length === 0) {
            noti_util("advertencia", "Por favor ingresa tu contraseña");
            return;
        }

        const datos = {
            email: email,
            contrasena: password
        };
        setCargando(true);
        const toastId = noti_util('cargando', 'Iniciando sesión...');

        try {
            const resultado = await authService.login(datos);

            toast.dismiss(toastId);

            if (!resultado.success) {
                throw new Error(
                    resultado.message || `Error al iniciar sesión: ${resultado.error || "Desconocido"}`
                );
            }
            login(resultado.token);
            console.log("Inicio de sesión exitoso:", resultado.success);
            noti_util("exito", "Sesión iniciada correctamente");
            navigate('/dashboard');

        } catch (error) {
            toast.dismiss(toastId);
            console.error("Error en el inicio de sesión:", error);
            noti_util("error", "Email o contraseña incorrectos");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">

                    <h1 className="text-white text-3xl font-bold text-center mb-8">
                        Iniciar Sesión
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={cargando}
                                className="w-full bg-white text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="tucorreo@ejemplo.com"
                            />
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={cargando}
                                    className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Tu contraseña"
                                />
                                <div
                                    className="absolute right-4 top-3.5 cursor-pointer text-gray-600 hover:text-gray-800"
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                >
                                    {mostrarPass ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {cargando ? "Iniciando..." : "Iniciar Sesión"}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-sm">
                                ¿No tienes cuenta?{' '}
                                <Link
                                    to="/registro"
                                    className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                                >
                                    Regístrate
                                </Link>
                            </p>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default LoginForm;