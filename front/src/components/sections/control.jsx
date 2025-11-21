import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, History, ChevronDown, ChevronUp, EyeOff, Eye } from "lucide-react";
import Button from "../ui/Button.jsx";
import { noti_util } from "../../utils/noti_util.jsx";
import { authService } from "../../services/auth_service.jsx";
import { useAppContext } from "../../context/AppProvider.jsx";
import { usuarios_service } from "../../services/usuarios_service.jsx";
import { dashboard_service } from "../../services/dashboard_service.jsx";

export function Panel_control() {
    const navigate = useNavigate();
    const { setAdministrador } = useAppContext();
    const API_URL = import.meta.env.VITE_API_URL;

    const [usuarios, setUsuarios] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [editarModal, setEditarModal] = useState(false);
    const [historialModal, setHistorialModal] = useState(false);
    const [eliminarModal, setEliminarModal] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(false);

    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [correo, setCorreo] = useState("");
    const [rol, setRol] = useState("Usuario");
    const [estado, setEstado] = useState("Activo");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setCargando(true);
        const token = authService.obtenerToken();
        const resultado = await usuarios_service.listarTodos(token);

        if (resultado.success) {
            setUsuarios(resultado.usuarios);
        } else {
            noti_util('error', resultado.error || 'Error al cargar usuarios');
        }

        setCargando(false);
    };

    const handleEditar = (e, usuario) => {
        e.stopPropagation();
        setUsuarioSeleccionado(usuario);
        setNombres(usuario.nombres);
        setApellidos(usuario.apellidos);
        setCorreo(usuario.email || "");
        setRol(usuario.rol);
        setEstado(usuario.estado);
        setNuevaContrasena("");
        setOpenIndex(null);
        setEditarModal(true);
    };

    const handleHistorial = async (e, usuario) => {
        e.stopPropagation();
        setUsuarioSeleccionado(usuario);
        setOpenIndex(null);

        const token = authService.obtenerToken();
        const resultado = await dashboard_service.log_especifico(token, usuario.ID_Usuario);

        if (resultado.success) {
            setHistorial(resultado.logs);
        } else {
            noti_util('error', resultado.error || 'Error al cargar historial');
            setHistorial([]);
        }

        setHistorialModal(true);
    };

    const handleEliminar = (e, usuario) => {
        e.stopPropagation();
        setUsuarioSeleccionado(usuario);
        setOpenIndex(null);
        setEliminarModal(true);
    };

    const confirmarEditar = async () => {
        setCargando(true);
        const token = authService.obtenerToken();

        let datos = { id_usuario: usuarioSeleccionado.ID_Usuario };
        let cambios = 0;

        if (usuarioSeleccionado.nombres !== nombres) {
            datos["nombres"] = nombres;
            cambios++;
        }
        if (usuarioSeleccionado.apellidos !== apellidos) {
            datos["apellidos"] = apellidos;
            cambios++;
        }
        if (usuarioSeleccionado.email !== correo) {
            datos["email"] = correo;
            cambios++;
        }
        if (usuarioSeleccionado.rol !== rol) {
            datos["rol"] = rol;
            cambios++;
        }
        if (usuarioSeleccionado.estado !== estado) {
            datos["estado"] = estado;
            cambios++;
        }
        if (nuevaContrasena && nuevaContrasena.trim() !== "") {
            datos["nuevaContrasena"] = nuevaContrasena;
            cambios++;
        }

        if (cambios === 0) {
            noti_util('advertencia', 'Debe haber cambios para modificar');
            setCargando(false);
            return;
        }

        const resultado = await usuarios_service.actualizarUsuario(token, datos);

        if (resultado.success) {
            noti_util("exito", `Usuario "${nombres} ${apellidos}" actualizado correctamente`);
            cerrarModales();
            await cargarUsuarios();
        } else {
            noti_util("error", resultado.error || "Error al actualizar usuario");
        }

        setCargando(false);
    };

    const confirmarEliminar = async () => {
        setCargando(true);
        const token = authService.obtenerToken();
        const resultado = await usuarios_service.eliminarUsuario(token, usuarioSeleccionado.ID_Usuario);

        if (resultado.success) {
            noti_util("exito", `Usuario "${usuarioSeleccionado.nombres}" eliminado correctamente`);
            cerrarModales();
            await cargarUsuarios();
        } else {
            noti_util("error", resultado.error || "Error al eliminar usuario");
        }

        setCargando(false);
    };

    const toggleOpen = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const cerrarModales = () => {
        setEditarModal(false);
        setHistorialModal(false);
        setEliminarModal(false);
        setUsuarioSeleccionado(null);
        setNombres("");
        setApellidos("");
        setCorreo("");
        setRol("Usuario");
        setEstado("Activo");
        setNuevaContrasena("");
        setShowPassword(false);
        setHistorial([]);
    };



    const cambiarRol = () => {
        setRol((prev) => (prev === "Usuario" ? "Admin" : "Usuario"));
    };

    const cambiarEstado = () => {
        setEstado((prev) => (prev === "Activo" ? "Inactivo" : "Activo"));
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-black to-gray-900 p-8 overflow-y-auto">
            <h1 className="text-white text-3xl mb-8 font-quicksand text-left">Panel de Control - Usuarios</h1>

            {cargando && usuarios.length === 0 ? (
                <div className="text-center text-gray-400 py-12">Cargando usuarios...</div>
            ) : (
                <div className="backdrop-blur-sm rounded-3xl border border-gray-600 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-600">
                        <div className="col-span-1"></div>
                        <div className="col-span-1 text-gray-400 text-sm text-left">ID</div>
                        <div className="col-span-1 text-gray-400 text-sm text-left">Foto</div>
                        <div className="col-span-3 text-gray-400 text-sm text-left">Nombre Completo</div>
                        <div className="col-span-2 text-gray-400 text-sm text-left">Rol</div>
                        <div className="col-span-1 text-gray-400 text-sm text-left">Estado</div>
                        <div className="col-span-3 text-gray-400 text-sm text-center">Acciones</div>
                    </div>

                    <div className="divide-y divide-teal-700/20">
                        {usuarios.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                No hay usuarios registrados
                            </div>
                        ) : (
                            usuarios.map((usuario, index) => (
                                <div key={usuario.ID_Usuario}>
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

                                        <div className="col-span-1 text-gray-300 text-sm flex items-center">
                                            {usuario.ID_Usuario.substring(0, 8)}...
                                        </div>

                                        <div className="col-span-1 flex items-center">
                                            {usuario.foto_perfil ? (
                                                <img
                                                    src={`${API_URL}/fotos-perfil/${usuario.foto_perfil}`}
                                                    alt="Perfil"
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                                                    {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-3 text-gray-200 text-sm flex items-center">
                                            {usuario.nombres} {usuario.apellidos}
                                        </div>

                                        <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-xs ${
                                                usuario.rol === "Admin" 
                                                    ? "bg-purple-500/20 text-purple-400" 
                                                    : "bg-blue-500/20 text-blue-400"
                                            }`}>
                                                {usuario.rol}
                                            </span>
                                        </div>

                                        <div className="col-span-1 text-gray-300 text-sm flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-xs ${
                                                usuario.estado === "Activo" 
                                                    ? "bg-green-500/20 text-green-400" 
                                                    : "bg-red-500/20 text-red-400"
                                            }`}>
                                                {usuario.estado}
                                            </span>
                                        </div>

                                        <div className="col-span-3 flex items-center justify-center gap-3">
                                            <button
                                                className="text-gray-400 hover:text-blue-500 flex items-center gap-1 text-sm"
                                                onClick={(e) => handleEditar(e, usuario)}
                                            >
                                                <Edit className="w-4 h-4"/> Editar
                                            </button>

                                            <button
                                                className="text-gray-400 hover:text-yellow-500 flex items-center gap-1 text-sm"
                                                onClick={(e) => handleHistorial(e, usuario)}
                                            >
                                                <History className="w-4 h-4"/> Historial
                                            </button>

                                            <button
                                                className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm"
                                                onClick={(e) => handleEliminar(e, usuario)}
                                            >
                                                <Trash2 className="w-4 h-4"/> Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    {openIndex === index && (
                                        <div className="px-6 py-4 bg-gray-900/40 border-t border-teal-700/20">
                                            <div className="text-lg text-left font-quicksand text-white mb-2">
                                                Información Adicional
                                            </div>
                                            <div className="text-gray-200 text-left">
                                                <p>
                                                    <span className="text-green-500">Email:</span>{" "}
                                                    {usuario.email}
                                                </p>
                                                <p>
                                                    <span className="text-green-500">Fecha de registro:</span>{" "}
                                                    {new Date(usuario.fecha_registro).toLocaleDateString()} - {new Date(usuario.fecha_registro).toLocaleTimeString()}
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

            <div className="mt-4 text-left text-gray-500 text-sm">
                Total de usuarios: {usuarios.length}
            </div>

            {editarModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md border border-gray-700">
                        <h2 className="text-white text-2xl font-quicksand mb-6">
                            Editar Usuario: {usuarioSeleccionado?.nombres}
                        </h2>

                        <div className="space-y-1">
                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Nombres
                                </label>
                                <input
                                    type="text"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Correo
                                </label>
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Rol
                                </label>
                                <Button type="button" variant="outline" onClick={cambiarRol} className="w-full">
                                    {rol}
                                </Button>
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Estado
                                </label>
                                <Button type="button" variant="outline" onClick={cambiarEstado} className="w-full">
                                    {estado}
                                </Button>
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={nuevaContrasena}
                                        onChange={(e) => setNuevaContrasena(e.target.value)}
                                        className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        placeholder="Dejar vacío para no cambiar"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button variant="outline" className="flex-1" onClick={cerrarModales}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={confirmarEditar}
                                disabled={cargando}
                            >
                                {cargando ? "Actualizando..." : "Actualizar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {historialModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-3xl border border-gray-700">
                        <h2 className="text-white text-2xl font-quicksand mb-1">
                            Historial: {usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}
                        </h2>

                        <div className="backdrop-blur-sm rounded-2xl border border-gray-600 overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-600 bg-gray-900/50">
                                <div className="col-span-2 text-gray-400 text-sm">ID</div>
                                <div className="col-span-5 text-gray-400 text-sm">Descripción</div>
                                <div className="col-span-3 text-gray-400 text-sm">Fecha - Hora</div>
                                <div className="col-span-2 text-gray-400 text-sm">Tipo</div>
                            </div>

                            <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                                {historial.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        No hay registros en el historial
                                    </div>
                                ) : (
                                    historial.map((log) => (
                                        <div key={log.ID_Log} className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-700/30 transition-colors">
                                            <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                                {log.ID_Log.substring(0, 8)}...
                                            </div>
                                            <div className="col-span-5 text-gray-200 text-sm flex items-center">
                                                {log.descripcion}
                                            </div>
                                            <div className="col-span-3 text-gray-300 text-sm flex items-center">
                                                {new Date(log.fecha_hora).toLocaleDateString()} - {new Date(log.fecha_hora).toLocaleTimeString()}
                                            </div>
                                            <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                                <span className="px-2 py-1 rounded-full text-xs bg-teal-500/20 text-teal-400">
                                                    {log.tipo}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button variant="outline" onClick={cerrarModales}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {eliminarModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-3xl p-7 w-full max-w-md border border-gray-700">
                        <h2 className="text-white text-2xl font-quicksand mb-6">
                            Eliminar Usuario
                        </h2>

                        <p className="text-gray-300 mb-6">
                            ¿Estás seguro de que deseas eliminar al usuario <span className="text-white font-bold">{usuarioSeleccionado?.nombres} {usuarioSeleccionado?.apellidos}</span>? Esta acción no se puede deshacer.
                        </p>

                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={cerrarModales}>
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={confirmarEliminar}
                                disabled={cargando}
                            >
                                {cargando ? "Eliminando..." : "Eliminar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}