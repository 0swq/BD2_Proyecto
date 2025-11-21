import React, {useEffect, useState} from 'react';
import {Upload, Eye, EyeOff} from 'lucide-react';
import Button from "../ui/Button.jsx";
import {useAppContext} from "../../context/AppProvider.jsx";
import {usuarios_service} from "../../services/usuarios_service.jsx";
import {authService} from "../../services/auth_service.jsx";
import {noti_util} from "../../utils/noti_util.jsx";

export function Perfil_user() {
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [correo, setCorreo] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const {actualizarFotoPerfil, recargarUsuario} = useAppContext();
    const {usuario, setUsuario} = useAppContext();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!usuario) return;
        console.log("Perfil actual:", usuario);
        setNombres(usuario.nombres || '');
        setApellidos(usuario.apellidos || '');
        setCorreo(usuario.email || '');
        if (usuario.foto_perfil) {
            setImagePreview(`${API_URL}/fotos-perfil/${usuario.foto_perfil}`);
        }
    }, [usuario]);

    if (!usuario) {
        return null;
    }
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image/(png|jpg|jpeg)')) {
                noti_util('advertencia', 'Solo se permiten archivos PNG, JPG o JPEG');
                return;
            }
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const previewUrl = reader.result;

                setImagePreview(previewUrl);
                actualizarFotoPerfil(previewUrl);
            };
            reader.readAsDataURL(file);

            try {
                const token = authService.obtenerToken();
                const resultado = await usuarios_service.cambiar_foto_perfil(token, file);

                if (!resultado.success) {
                    noti_util("error", resultado.error || "Error al actualizar foto");

                    if (usuario.foto_perfil) {
                        const urlAnterior = `${API_URL}/fotos-perfil/${usuario.foto_perfil}`;
                        setImagePreview(urlAnterior);
                        actualizarFotoPerfil(urlAnterior);
                        await recargarUsuario();
                    }
                } else {
                    noti_util("exito", "Foto actualizada correctamente");
                    if (resultado.ruta) {
                        const nuevaUrl = `${API_URL}/fotos-perfil/${resultado.ruta}`;
                        setImagePreview(nuevaUrl);
                        actualizarFotoPerfil(nuevaUrl);
                        await recargarUsuario();
                    }
                }
            } catch (error) {
                console.error("Error al cambiar foto:", error);
                noti_util("error", "Error de conexión");
                if (usuario.foto_perfil) {
                    const urlAnterior = `${API_URL}/fotos-perfil/${usuario.foto_perfil}`;
                    setImagePreview(urlAnterior);
                    actualizarFotoPerfil(urlAnterior);
                } else {
                    setImagePreview(null);
                    actualizarFotoPerfil(null);
                }
            }
        }
    };

    const handleBiometricUpload = async (e) => {
        const file = e.target.files[0];
        e.target.value = null;
        if (!file) return;
        if (!file.type.match('image/(png|jpg|jpeg)')) {
            noti_util("advertencia", 'Solo se permiten archivos PNG, JPG o JPEG');
            return;
        }

        try {
            const token = authService.obtenerToken();
            const viejo_biometrico = await usuarios_service.get_registro_biometrico(token);
            if (!viejo_biometrico.success) {
                noti_util("error", "Hubo un error se solucionara pronto");
                return;
            }
            console.log("viejo_biometrico: ", viejo_biometrico);
            const dif = 2592000000;
            if (viejo_biometrico.success && viejo_biometrico.existe && viejo_biometrico.ultimo_cambio) {
                const ultima_fecha = viejo_biometrico.ultimo_cambio;
                const ahora_ms = Date.now();
                const diferencia_ms = ahora_ms - ultima_fecha;

                if (diferencia_ms >= dif) {
                    const resultado = await usuarios_service.registrar_biometrico(token, file);
                    if (resultado.success) {
                        noti_util("exito", "Vector biométrico actualizado correctamente");
                    } else {
                        noti_util("error", resultado.error || "Error al actualizar vector biométrico");
                    }
                } else {
                    const diasRestantes = Math.ceil((dif - diferencia_ms) / (1000 * 60 * 60 * 24));
                    noti_util("advertencia", `Solo puedes cambiar la foto de registro una vez cada 30 días. Faltan ${diasRestantes} días.`);
                }
            } else {
                const resultado = await usuarios_service.registrar_biometrico(token, file);
                if (resultado.success) {

                    noti_util("exito", "Vector biométrico registrado correctamente");
                } else {
                    noti_util("error", resultado.error || "Error al registrar vector biométrico");
                }
            }
        } catch (error) {
            console.error("Error al registrar biométrico:", error);
            noti_util("error", "Error de conexión");
        }
    };
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            noti_util('advertencia', 'Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            noti_util('advertencia', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const datos = {
                "contrasena_vieja": currentPassword,
                "contrasena_nueva": newPassword
            }
            console.log("datos contra nueva: ", datos)
            const token = authService.obtenerToken();
            const resultado = await usuarios_service.cambiar_contrasena(token, datos);

            if (resultado.success) {
                noti_util('exito', 'Contraseña actualizada correctamente');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(false);
            } else {
                noti_util('error', resultado.error || 'No se pudo cambiar la contraseña');
            }
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            noti_util('error', 'Error de conexión');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = authService.obtenerToken();
            let datos = {};
            let diferentes = 0
            if (usuario.nombres !== nombres) {
                datos["nombres"] = nombres
                diferentes += 1
            }
            if (usuario.apellidos !== apellidos) {
                datos["apellidos"] = apellidos
                diferentes += 1
            }
            if (usuario.email !== correo) {
                datos["email"] = correo
                diferentes += 1
            }
            if (diferentes === 0) {
                noti_util('advertencia', 'Debe haber cambios para modificar');
                return;
            }

            console.log("Datos para actualizar : ", datos)
            const resultado = await usuarios_service.actualizar(token, datos);

            if (resultado.success) {
                noti_util('exito', 'Perfil actualizado correctamente');
                await recargarUsuario();
            } else {
                noti_util('error', resultado.error || 'No se pudo actualizar el perfil');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            noti_util('error', 'Error de conexión');
        }
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-black to-gray-900 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 mb-3">
                    <label
                        className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-blue-500 cursor-pointer group flex-shrink-0">
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                        ) : (
                            <img src="https://placehold.co/40x40/A0A0A0/FFFFFF?text=X"
                                 className="w-full h-full rounded-full object-cover"/>
                        )}
                        <div
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-gray-900"
                                >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                    <path d="m15 5 4 4"/>
                                </svg>
                            </div>
                        </div>
                    </label>
                    <div className="text-center sm:text-left">
                        <h1 className="text-white text-2xl sm:text-3xl font-bold">{usuario.nombres + " " + usuario.apellidos}</h1>
                        <p className="text-lime-400 text-lg sm:text-xl break-all">{usuario.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-700">
                        <div className="space-y-3">
                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Nombres
                                </label>
                                <input
                                    type="text"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">
                                    Contraseña
                                </label>
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    Cambiar
                                </Button>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleUpdateProfile}
                            >
                                Actualizar perfil
                            </Button>
                        </div>
                    </div>

                    <div
                        className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-700 flex flex-col items-center justify-center">
                        <p className="text-gray-400 text-center mb-6">
                            Subir foto para generar nuevo vector biométrico
                        </p>

                        <label className="cursor-pointer group">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleBiometricUpload}
                                className="hidden"
                            />
                            <div
                                className="w-36 h-36 sm:w-48 sm:h-48 border-4 border-dashed border-gray-600 rounded-3xl flex items-center justify-center group-hover:border-lime-400 transition-all duration-300">
                                <Upload className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 group-hover:text-lime-400 transition-colors"
                                        strokeWidth={1.5}/>
                            </div>
                        </label>

                        <p className="text-gray-500 text-sm mt-4">PNG, JPG o JPEG</p>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-md border border-gray-700">
                        <h2 className="text-white text-xl sm:text-2xl font-quicksand mb-6">Cambiar Contraseña</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">Contraseña
                                    actual</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Contraseña actual"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showCurrentPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">Nueva
                                    contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Nueva contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showNewPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium block mb-2 text-left">Confirmar
                                    contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white text-black rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Confirmar contraseña"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handlePasswordChange}
                            >
                                Cambiar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}