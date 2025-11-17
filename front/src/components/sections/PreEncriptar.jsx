import React, {useRef, useState, useEffect} from "react";
import {Eye, EyeOff, Upload} from "lucide-react";
import Button from "../ui/Button.jsx";
import {authService} from "../../services/auth_service.jsx";
import {noti_util} from "../../utils/noti_util.jsx";

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/archivo/obtener_espacio_restante`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const resultado = await response.json();
            if (resultado.success) {
                setEspacioDisponible(resultado.espacio_usado);
            }
        } catch (error) {
            console.error("Error al obtener espacio:", error);
        }
    };

    const manejarSeleccion = (e) => {
        const seleccionado = e.target.files[0];
        if (!seleccionado) return;

        const ESPACIO_MAXIMO = 53687091200;
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
            const formData = new FormData();
            formData.append("tipo", ubicacion === "LOCAL" ? "Local" : "Nube");
            formData.append("contraseña", password);
            formData.append("archivo", archivo);

            console.log("🔹 Enviando petición:");
            console.log("   - tipo:", ubicacion === "LOCAL" ? "Local" : "Nube");
            console.log("   - archivo:", archivo.name);
            console.log("   - tamaño archivo:", archivo.size, "bytes");

            const response = await fetch(`${import.meta.env.VITE_API_URL}/archivo/encriptar`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            console.log("🔹 Respuesta recibida:");
            console.log("   - status:", response.status);
            console.log("   - headers:", [...response.headers.entries()]);

            const contentDisposition = response.headers.get('content-disposition');
            console.log("   - Content-Disposition:", contentDisposition);

            if (ubicacion === "LOCAL") {
                const blob = await response.blob();
                console.log("🔹 Blob recibido:");
                console.log("   - tamaño:", blob.size, "bytes");
                console.log("   - tipo:", blob.type);

                const arrayBuffer = await blob.slice(0, 100).arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                const hex = Array.from(uint8Array.slice(0, 20))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                console.log("   - Primeros 20 bytes (hex):", hex);

                const isMP3 = uint8Array[0] === 0xFF ||
                             (uint8Array[0] === 0x49 && uint8Array[1] === 0x44 && uint8Array[2] === 0x33);
                console.log("   - ¿Parece MP3 sin encriptar?:", isMP3);

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                let filename = archivo.name + ".ficure";
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }

                console.log("   - Nombre del archivo a descargar:", filename);

                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                noti_util('exito', "Archivo encriptado y descargado correctamente", loadingNotificationId);
            } else {
                const resultado = await response.json();
                console.log("🔹 Respuesta JSON:", resultado);

                if (resultado.success) {
                    noti_util('exito', resultado.message || "Archivo encriptado en la nube", loadingNotificationId);
                } else {
                    noti_util('error', resultado.error || "Error al encriptar el archivo", loadingNotificationId);
                }
            }

            setArchivo(null);
            setMostrarForm(false);
            setPassword("");
            setConfirmar("");
            await cargarEspacioDisponible();

        } catch (error) {
            console.error("Error completo:", error);
            noti_util('error', "Error al encriptar el archivo", loadingNotificationId);
        }
    };

    return (
        <div className="flex-1 w-full h-screen bg-gray-900/50 p-10 flex flex-col justify-center items-center">
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
                    className="bg-gray-900/50 p-8 rounded-3xl shadow-lg w-full max-w-md text-center border border-gray-700"
                >
                    <h2 className="text-2xl mb-8 font-semibold">Completa la información</h2>

                    <div className="flex items-center justify-between mb-4">
                        <label className="w-1/3 text-left">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            disabled
                            required
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <label className="w-1/3 text-left">Contraseña</label>
                        <div className="relative w-2/3">
                            <input
                                type={mostrarPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Mín. 8 caracteres"
                            />
                            <div
                                className="absolute right-3 top-2.5 cursor-pointer text-gray-700"
                                onClick={() => setMostrarPass(!mostrarPass)}
                            >
                                {mostrarPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <label className="w-1/3 text-left">Confirmar</label>
                        <div className="relative w-2/3">
                            <input
                                type={mostrarConfirmar ? "text" : "password"}
                                value={confirmar}
                                onChange={(e) => setConfirmar(e.target.value)}
                                required
                                minLength={8}
                                className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Repetir contraseña"
                            />
                            <div
                                className="absolute right-3 top-2.5 cursor-pointer text-gray-700"
                                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                            >
                                {mostrarConfirmar ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <label className="w-1/3 text-left">Ubicación</label>
                        <Button type="button" variant="outline" onClick={cambiarUbicacion}>
                            {ubicacion}
                        </Button>
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-2">
                        Encriptar
                    </Button>

                    <div className="flex justify-between mt-6 text-sm text-gray-400">
                        <span>Fecha - hora: {fechaHora}</span>
                        <span>{archivo?.name}</span>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SubidaDiferida;