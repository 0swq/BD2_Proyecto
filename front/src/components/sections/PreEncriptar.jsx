import React, {useRef, useState, useEffect} from "react";
import {Eye, EyeOff, Upload} from "lucide-react";
import {authService} from "../../services/auth_service.jsx";
import {noti_util} from "../../utils/noti_util.jsx";
import {file_service} from "../../services/file_service.jsx";
import Button from "../ui/Button.jsx";

const SubidaDiferida = () => {
    const refArchivo = useRef(null);
    const [archivo, setArchivo] = useState(null);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [nombre, setNombre] = useState("");
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [ubicacion, setUbicacion] = useState("LOCAL");
    const [fechaHora, setFechaHora] = useState("");
    const [espacioDisponible, setEspacioDisponible] = useState(null);

    useEffect(() => {
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString();
        const hora = ahora.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
        setFechaHora(`${fecha} / ${hora}`);
        cargarEspacioDisponible();
    }, []);

    useEffect(() => {
        if (archivo) {
            setNombre(archivo.name);
        }
    }, [archivo]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (archivo) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [archivo]);

    const cargarEspacioDisponible = async () => {
        const token = authService.obtenerToken();
        if (!token) return;

        try {
            const resultado = await file_service.obtenerEspacioRestante(token);
            if (resultado.success) {
                setEspacioDisponible(resultado);
            }
        } catch (error) {
            console.error("Error al obtener espacio:", error);
        }
    };

    const manejarSeleccion = (e) => {
        const seleccionado = e.target.files[0];
        if (!seleccionado) return;

        const ESPACIO_MAXIMO = 53687091200; // 50 GB
        if (espacioDisponible !== null && espacioDisponible + seleccionado.size > ESPACIO_MAXIMO) {
            const disponible = ((ESPACIO_MAXIMO - espacioDisponible) / (1024 * 1024 * 1024)).toFixed(2);
            const requerido = (seleccionado.size / (1024 * 1024 * 1024)).toFixed(2);
            noti_util('error', `Espacio insuficiente. Disponible: ${disponible} GB, Requerido: ${requerido} GB`);
            return;
        }

        setArchivo(seleccionado);
        setMostrarForm(true);
    };

    const cambiarUbicacion = () => {
        setUbicacion((prev) => (prev === "LOCAL" ? "NUBE" : "LOCAL"));
    };

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

    const manejarEncriptar = async (e) => {
        e.preventDefault();

        const errorPass = validarPassword(password);
        if (errorPass) {
            noti_util('advertencia', errorPass);
            return;
        }

        if (password !== confirmar) {
            noti_util('error', "Las contraseñas no coinciden");
            return;
        }

        const token = authService.obtenerToken();
        if (!token) {
            noti_util('error', "No estás autenticado");
            return;
        }

        const loadingNotificationId = noti_util('cargando', `Encriptando archivo "${archivo.name}"...`);

        try {
            const datos = {
                tipo: ubicacion === "LOCAL" ? "Local" : "Nube",
                contrasena: password,
                archivo: archivo
            };

            const resultado = await file_service.encriptarArchivo(token, datos);

            if (resultado.success) {
                noti_util('exito', resultado.message, loadingNotificationId);

                // Limpiar formulario
                setArchivo(null);
                setMostrarForm(false);
                setPassword("");
                setConfirmar("");

                // Recargar espacio disponible
                await cargarEspacioDisponible();
            } else {
                noti_util('error', resultado.error || "Error al encriptar el archivo", loadingNotificationId);
            }

        } catch (error) {
            console.error("Error completo:", error);
            noti_util('error', "Error al encriptar el archivo", loadingNotificationId);
        }
    };

    return (
        <div className="flex-1 w-full h-screen bg-gradient-to-br from-black to-gray-900 p-10 flex flex-col justify-center items-center">
            {!mostrarForm ? (
                <div className="text-center">
                    <h1 className="text-xl text-gray-300 mb-6">Sube un archivo para encriptar</h1>

                    <Upload
                        className="w-20 h-20 text-gray-500 cursor-pointer hover:text-gray-300 transition-colors mx-auto"
                        onClick={() => refArchivo.current.click()}
                    />
                    <input
                        type="file"
                        ref={refArchivo}
                        className="hidden"
                        onChange={manejarSeleccion}
                    />
                </div>
            ) : (
                <form
                    onSubmit={manejarEncriptar}
                    className="bg-gray-800 p-8 rounded-3xl shadow-lg w-full max-w-md border border-gray-700"
                >
                    <h2 className="text-white text-2xl font-quicksand mb-6 text-center">
                        Completa la información
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Nombre del archivo
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                disabled
                                required
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Mín. 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPass(!mostrarPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {mostrarPass ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={mostrarConfirmar ? "text" : "password"}
                                    value={confirmar}
                                    onChange={(e) => setConfirmar(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Repetir contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {mostrarConfirmar ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-white text-sm font-medium block mb-2 text-left">
                                Ubicación
                            </label>
                            <Button type="button" variant="outline" onClick={cambiarUbicacion} className="w-full">
                                {ubicacion}
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-6">
                        Encriptar
                    </Button>

                    <div className="flex justify-between mt-6 text-sm text-gray-400">
                        <span>Fecha - hora: {fechaHora}</span>
                        <span className="truncate ml-2">{archivo?.name}</span>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SubidaDiferida;