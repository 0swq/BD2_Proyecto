import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Eye, EyeOff} from 'lucide-react';
import {toast} from 'react-toastify';
import {authService} from "../../services/auth_service.jsx";
import {noti_util} from "../../utils/noti_util.jsx";

const RegistroForm = () => {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [apellido, setapellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [cargando, setCargando] = useState(false);

    const validarPassword = (pass) => {
        if (pass.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres";
        }
        if (!/[A-Z]/.test(pass)) {
            return "Debe contener al menos una mayúscula";
        }
        if (!/[0-9]/.test(pass)) {
            return "Debe contener al menos un número";
        }
        return "";
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            noti_util("advertencia", "Por favor ingresa un email válido");
            return;
        }

        const errorPass = validarPassword(password);
        if (errorPass) {
            noti_util("advertencia", errorPass);
            return;
        }

        if (password !== confirmar) {
            noti_util("error", "Las contraseñas no coinciden");
            return;
        }

        const datos = {
            nombres: nombre,
            apellidos: apellido,
            email: email,
            contrasena: password
        };

        setCargando(true);
        const toastId = noti_util('cargando', 'Registrando usuario...');

        try {
            const resultado = await authService.registro(datos);

            toast.dismiss(toastId);

            if (!resultado.success) {
                throw new Error(
                    resultado.message || `Error al registrar usuario: ${resultado.error || "Desconocido"}`
                );
            }
            console.log("Usuario registrado:", resultado.success);
            noti_util("exito", "Usuario registrado correctamente");

            setNombre("");
            setapellido("");
            setEmail("");
            setPassword("");
            setConfirmar("");
            setMostrarPass(false);
            setMostrarConfirmar(false);
            navigate('/login');
        } catch (error) {
            toast.dismiss(toastId);
            console.error("Error en el registro:", error);
            noti_util("error", "Ocurrió un error al registrar. Intenta nuevamente.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl">

                    <h1 className="text-white text-3xl font-quicksand text-center mb-8">
                        Registrarse
                    </h1>

                    <form onSubmit={handleRegister} className="space-y-1">

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                disabled={cargando}
                                className="w-full bg-white text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Apellidos
                            </label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={(e) => setapellido(e.target.value)}
                                required
                                disabled={cargando}
                                className="w-full bg-white text-black rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Tus apellidos"
                            />
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Correo
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
                                    minLength={8}
                                    disabled={cargando}
                                    className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Mín. 8 caracteres"
                                />
                                <div
                                    className="absolute right-4 top-3.5 cursor-pointer text-gray-600 hover:text-gray-800"
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                >
                                    {mostrarPass ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left ">
                                Confirmar contraseña
                            </label>
                            <div className="relative ">
                                <input
                                    type={mostrarConfirmar ? "text" : "password"}
                                    value={confirmar}
                                    onChange={(e) => setConfirmar(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={cargando}
                                    className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Repetir contraseña"
                                />
                                <div
                                    className="absolute right-4 top-3.5 cursor-pointer text-gray-600 hover:text-gray-800"
                                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                >
                                    {mostrarConfirmar ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {cargando ? "Registrando..." : "Registrarse"}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-400 text-sm">
                                ¿Ya tienes cuenta?{' '}
                                <Link
                                    to="/login"
                                    className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                                >
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default RegistroForm;