import React, {useState, useEffect} from "react";
import {Trash2, Unlock, ChevronDown, ChevronUp, EyeOff, Eye, Upload, Search} from "lucide-react";
import Button from "../ui/Button.jsx";
import {noti_util} from "../../utils/noti_util.jsx";
import {authService} from "../../services/auth_service.jsx";
import {file_service} from "../../services/file_service.jsx"

const BovedaReal = () => {
    const [files, setFiles] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [eliminarModal, setEliminarModal] = useState(false);
    const [desencriptarModal, setDesencriptarModal] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [archivoSubido, setArchivoSubido] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [filtroUbicacion, setFiltroUbicacion] = useState("Todos");

    useEffect(() => {
        cargarArchivos();
    }, []);

    const cargarArchivos = async () => {
        setCargando(true);
        const token = authService.obtenerToken();
        const resultado = await file_service.listarArchivos(token);

        if (resultado.success) {
            setFiles(resultado.archivos);
        } else {
            noti_util("error", resultado.error || "Error al cargar archivos");
        }
        setCargando(false);
    };

    const archivosFiltrados = files.filter(file => {
        const coincideBusqueda = file.filename.toLowerCase().includes(busqueda.toLowerCase()) ||
                                 file.ID_File.toLowerCase().includes(busqueda.toLowerCase());

        const coincideUbicacion = filtroUbicacion === "Todos" || file.ubicacion === filtroUbicacion;

        return coincideBusqueda && coincideUbicacion;
    });

    const confirmarDesencriptar = async () => {
        if (!password) {
            noti_util("advertencia", "Ingresa la contraseña del archivo");
            return;
        }

        if (archivoSeleccionado?.ubicacion === "Local" && !archivoSubido) {
            noti_util("advertencia", "Debes subir el archivo .ficure");
            return;
        }

        setCargando(true);
        const token = authService.obtenerToken();
        let resultado;

        const datosDesencriptacion = {
            ID_File: archivoSeleccionado.ID_File,
            contrasena: password,
            archivo: archivoSubido
        };

        if (archivoSeleccionado.ubicacion === "Local") {
            resultado = await file_service.desencriptarLocal(
                token,
                datosDesencriptacion
            );
        } else {
            resultado = await file_service.desencriptarNube(
                token,
                datosDesencriptacion
            );
        }

        setCargando(false);

        if (resultado.success) {
            noti_util("exito", `Archivo "${archivoSeleccionado.filename}" desencriptado correctamente`);
            cerrarModal();
        } else {
            noti_util("error", resultado.error || "Error al desencriptar");
        }
    };

    const confirmarEliminar = async () => {
        if (!password) {
            noti_util("advertencia", "Ingresa la contraseña del archivo");
            return;
        }

        setCargando(true);
        const token = authService.obtenerToken();
        const resultado = await file_service.eliminarArchivo(
            token,
            archivoSeleccionado.ID_File,
            password
        );

        setCargando(false);

        if (resultado.success) {
            noti_util("exito", `Archivo "${archivoSeleccionado.filename}" eliminado correctamente`);
            cerrarModal();
            await cargarArchivos();
        } else {
            noti_util("error", resultado.error || "Error al eliminar archivo");
        }
    };

    const handleEliminar = (e, file) => {
        e.stopPropagation();
        setArchivoSeleccionado(file);
        setOpenIndex(null);
        setEliminarModal(true);
    };

    const handleDesencriptar = (e, file) => {
        e.stopPropagation();
        setArchivoSeleccionado(file);
        setOpenIndex(null);
        setDesencriptarModal(true);
    };

    const toggleOpen = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const cerrarModal = () => {
        setEliminarModal(false);
        setDesencriptarModal(false);
        setArchivoSeleccionado(null);
        setPassword("");
        setShowPassword(false);
        setArchivoSubido(null);
    };

    const formatearTamano = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    return (
        <div className="flex-1 bg-black p-8 overflow-y-auto">
            <h1 className="text-white text-3xl mb-8 font-quicksand text-left">Tu bóveda actual…</h1>

            {cargando && files.length === 0 ? (
                <div className="text-center text-gray-400 py-12">Cargando archivos...</div>
            ) : (
                <div className="backdrop-blur-sm rounded-3xl border border-gray-600 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-600">
                        <div className="col-span-1"></div>
                        <div className="col-span-2 text-gray-400 text-sm text-left">ID</div>
                        <div className="col-span-4 text-gray-400 text-sm text-left">Nombre</div>
                        <div className="col-span-2 text-gray-400 text-sm text-left">Ubicación</div>
                        <div className="col-span-3 text-gray-400 text-sm text-center">Acciones</div>
                    </div>

                    <div className="divide-y divide-teal-700/20">
                        {archivosFiltrados.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                {busqueda || filtroUbicacion !== "Todos"
                                    ? "No se encontraron archivos"
                                    : "No tienes archivos en tu bóveda"}
                            </div>
                        ) : (
                            archivosFiltrados.map((file, index) => (
                                <div key={file.ID_File}>
                                    <div
                                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-teal-900/20 cursor-pointer transition-colors"
                                        onClick={() => toggleOpen(index)}
                                    >
                                        <div className="flex items-center">
                                            {openIndex === index ? (
                                                <ChevronUp className="text-green-500"/>
                                            ) : (
                                                <ChevronDown className="text-green-500"/>
                                            )}
                                        </div>

                                        <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                            {file.ID_File.substring(0, 8)}...
                                        </div>

                                        <div className="col-span-4 text-gray-200 text-sm flex items-center">
                                            {file.filename}
                                        </div>

                                        <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-xs ${
                                                file.ubicacion === "Local"
                                                    ? "bg-purple-500/20 text-purple-400"
                                                    : "bg-blue-500/20 text-blue-400"
                                            }`}>
                                                {file.ubicacion}
                                            </span>
                                        </div>
                                        <div className="col-span-3 flex items-center justify-center gap-4">
                                            <button
                                                className="text-gray-400 hover:text-green-500 flex items-center gap-1"
                                                onClick={(e) => handleDesencriptar(e, file)}
                                            >
                                                <Unlock className="w-4 h-4"/> Desencriptar
                                            </button>

                                            <button
                                                className="text-gray-400 hover:text-red-500 flex items-center gap-1"
                                                onClick={(e) => handleEliminar(e, file)}
                                            >
                                                <Trash2 className="w-4 h-4"/> Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    {openIndex === index && (
                                        <div className="px-6 py-4 bg-gray-900/40 border-t border-teal-700/20">
                                            <div className="text-lg text-left font-quicksand text-white mb-2">
                                                Información
                                            </div>
                                            <div className="text-gray-200 text-left">
                                                <p>
                                                    <span className="text-green-500">Tamaño:</span>{" "}
                                                    {formatearTamano(file.tamano)}
                                                </p>
                                                <p>
                                                    <span className="text-green-500">Fecha subida:</span>{" "}
                                                    {new Date(file.fecha_subida).toLocaleDateString()}
                                                </p>
                                                <p>
                                                    <span className="text-green-500">Extensión:</span>{" "}
                                                    {file.tipo_medio}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="mt-4 flex justify-between items-center">
                <span className="text-gray-500 text-sm">
                    Total de archivos: {archivosFiltrados.length}
                </span>

                <div className="flex gap-3 items-center">
                    <select
                        value={filtroUbicacion}
                        onChange={(e) => setFiltroUbicacion(e.target.value)}
                        className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-green-500"
                    >
                        <option value="Todos">Todos</option>
                        <option value="Local">Local</option>
                        <option value="Nube">Nube</option>
                    </select>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar..."
                            className="bg-gray-800 text-white text-sm rounded-lg pl-9 pr-4 py-2 w-48 outline-none border border-gray-700 focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {eliminarModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md border border-gray-700">
                        <h2 className="text-white text-2xl font-quicksand mb-6">
                            Eliminar: {archivoSeleccionado?.filename}
                        </h2>

                        <p className="text-gray-300 mb-6">
                            ¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede
                            deshacer.
                        </p>

                        <label className="text-white text-sm font-medium block mb-2 text-left">
                            Contraseña del archivo
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="Contraseña del archivo"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" className="flex-1" onClick={cerrarModal}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={confirmarEliminar}
                                disabled={cargando}
                            >
                                {cargando ? "Eliminando..." : "Eliminar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {desencriptarModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md border border-gray-700">
                        <h2 className="text-white text-2xl font-quicksand mb-6">
                            Desencriptar: {archivoSeleccionado?.filename}
                        </h2>

                        <div className="space-y-4">
                            {archivoSeleccionado?.ubicacion === "Local" && (
                                <div>
                                    <label className="text-white text-sm font-medium block mb-2 text-left">
                                        Subir archivo encriptado
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById("file-upload").click()}
                                    >
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2"/>
                                        <p className="text-gray-400 text-sm">
                                            {archivoSubido
                                                ? archivoSubido.name
                                                : "Click para subir archivo .ficure"}
                                        </p>
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".ficure"
                                        className="hidden"
                                        onChange={(e) => setArchivoSubido(e.target.files[0])}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Contraseña del archivo
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        placeholder="Contraseña del archivo"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" className="flex-1" onClick={cerrarModal}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={confirmarDesencriptar}
                                disabled={cargando}
                            >
                                {cargando ? "Desencriptando..." : "Desencriptar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BovedaReal;