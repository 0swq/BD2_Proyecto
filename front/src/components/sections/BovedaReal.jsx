import React, {useState, useEffect} from "react";
import {Trash2, Unlock, ChevronDown, ChevronUp, EyeOff, Eye,Upload} from "lucide-react";
import Button from "../ui/Button.jsx";
import {noti_util} from "../../utils/noti_util.jsx";

const BovedaReal = () => {
    const ejemplo = [
        {
            ID_File: "file_0001",
            filename: "Proyecto_Finanzas_2025.xlsx",
            ubicacion: "Nube",
            path: "/files/proyecto.xlsx",
            tamano: 223344,
            fecha_subida: "2025-01-20",
            tipo_medio: "xlsx"
        },
        {
            ID_File: "file_0002",
            filename: "Contratos_Clientes_Activos.pdf",
            ubicacion: "Local",
            path: "/files/contratos.pdf",
            tamano: 120034,
            fecha_subida: "2025-01-19",
            tipo_medio: "pdf"
        },
        {
            ID_File: "file_0003",
            filename: "Backup_Teleconsulta.zip",
            ubicacion: "Nube",
            path: "/files/backups.zip",
            tamano: 550331,
            fecha_subida: "2025-01-10",
            tipo_medio: "zip"
        }
    ];

    const [files, setFiles] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [eliminarModal, setEliminarModal] = useState(false);
    const [desencriptarModal, setDesencriptarModal] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [archivoSubido, setArchivoSubido] = useState(null);
    useEffect(() => {
        setFiles(ejemplo);
    }, []);

    const confirmarDesencriptar = () => {
        if (!password) {
            noti_util("advertencia", "Ingresa la contraseña del archivo");
            return;
        }

        if (archivoSeleccionado?.ubicacion === "Local" && !archivoSubido) {
            noti_util("advertencia", "Debes subir el archivo .ficure");
            return;
        }

        console.log("Desencriptar archivo:", archivoSeleccionado.ID_File);
        noti_util("exito", `Archivo "${archivoSeleccionado.filename}" desencriptado correctamente`);
        cerrarModal();
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

    const confirmarEliminar = () => {
        if (!password) {
            noti_util("advertencia", "Ingresa la contraseña del archivo");
            return;
        }


        console.log("Eliminar archivo:", archivoSeleccionado.ID_File);
        noti_util("exito", `Archivo "${archivoSeleccionado.filename}" eliminado correctamente`);
        cerrarModal();
    };

    return (
        <div className="flex-1 bg-black p-8 overflow-y-auto">
            <h1 className="text-white text-3xl mb-8 font-quicksand">Tu bóveda actual…</h1>

            <div className="backdrop-blur-sm rounded-3xl border border-gray-600 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-600">
                    <div className="col-span-1"></div>
                    <div className="col-span-2 text-gray-400 text-sm">ID</div>
                    <div className="col-span-4 text-gray-400 text-sm">Nombre</div>
                    <div className="col-span-2 text-gray-400 text-sm">Ubicación</div>
                    <div className="col-span-3 text-gray-400 text-sm text-center">Acciones</div>
                </div>

                <div className="divide-y divide-teal-700/20">
                    {files.map((file, index) => (
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
                                    {file.ID_File}
                                </div>

                                <div className="col-span-4 text-gray-200 text-sm flex items-center">
                                    {file.filename}
                                </div>

                                <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                    {file.ubicacion}
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
                                    <div className="text-lg text-left font-quicksand text-white mb-2">Información</div>
                                    <div className="text-gray-200 text-left">
                                        <p><span className="text-green-500">Tamaño:</span> {file.tamano} bytes</p>
                                        <p><span className="text-green-500">Fecha subida:</span> {file.fecha_subida}</p>
                                        <p><span className="text-green-500">Extensión:</span> {file.tipo_medio}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 text-left text-gray-500 text-sm">
                Total de archivos: {files.length}
            </div>

            {eliminarModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md border border-gray-700">
                        <h2 className="text-white text-2xl font-quicksand mb-6">
                            Eliminar: {archivoSeleccionado?.filename}
                        </h2>

                        <div className="space-y-4">
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
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={cerrarModal}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={confirmarEliminar}
                            >
                                Eliminar
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
                            {/* Solo mostrar si es Local */}
                            {archivoSeleccionado?.ubicacion === "Local" && (
                                <div>
                                    <label className="text-white text-sm font-medium block mb-2 text-left">
                                        Subir archivo encriptado
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2"/>
                                        <p className="text-gray-400 text-sm">
                                            {archivoSubido ? archivoSubido.name : "Click para subir archivo .ficure"}
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
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={cerrarModal}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={confirmarDesencriptar}
                            >
                                Desencriptar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BovedaReal;