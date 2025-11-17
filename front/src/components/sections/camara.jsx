import React, {useState, useEffect, useRef} from 'react';
import Button from './/../ui/Button.jsx';
import {boveda_service} from '..//..//services/boveda_service.jsx'
import {authService} from "../../services/auth_service.jsx";
import {noti_util} from "../../utils/noti_util.jsx";
import {usuarios_service} from "../../services/usuarios_service.jsx";
import {useAppContext} from '../../context/AppProvider.jsx';

const BiometricVault = () => {
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const videoRef = useRef(null);
    const {bovedaAbierta, setBovedaAbierta} = useAppContext()
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {ideal: 1280},
                    height: {ideal: 720},
                    facingMode: "user"
                }
            });

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            setCameraError(null);
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };
    const handleSkip = async () => {
        setBovedaAbierta(true)
    }
    const handleProcess = async () => {
        if (!videoRef.current || procesando) {
            noti_util("advertencia", "Espera a que termine el proceso anterior");
            return;
        }

        setProcesando(true);
        const loadingToast = noti_util("cargando", "Procesando reconocimiento facial...");

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const base64 = canvas.toDataURL("image/jpeg", 0.9);
            const blob = await (await fetch(base64)).blob();
            const file = new File([blob], "rostro.jpg", {type: "image/jpeg"});

            const token = authService.obtenerToken();
            if (!token) {
                noti_util("error", "Sesión caducada. Inicia sesión nuevamente", loadingToast);
                return;
            }

            const resultado = await boveda_service.ingresar(token, file);

            console.log("Resultado biométrico:", resultado);

            if (resultado.success) {
                if (resultado.coincide) {
                    noti_util("exito", `Verificación exitosa. Similitud: ${resultado.similitud}%`, loadingToast);
                    setBovedaAbierta(true)
                    window.location.reload();

                } else {
                    const mensaje = resultado.similitud !== undefined
                        ? `Acceso denegado. Similitud: ${resultado.similitud}% (requiere 85%)`
                        : "No se detectó ningún rostro. Asegúrate de estar bien iluminado";
                    noti_util("error", mensaje, loadingToast);
                }
            } else {
                noti_util("error", resultado.error || "Error al procesar verificación", loadingToast);
            }

        } catch (error) {
            console.error("Error en verificación:", error);

            if (error.response?.status === 400) {
                noti_util("error", "No se detectó tu rostro. Mejora la iluminación y mira de frente", loadingToast);
            } else if (error.response?.status === 404) {
                noti_util("error", "No tienes vector biométrico registrado. Regístralo en tu perfil", loadingToast);
            } else {
                noti_util("error", "Error de conexión. Intenta nuevamente", loadingToast);
            }
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-black to-gray-900 min-h-screen">
            <div className="px-8 py-6">
                <h1
                    className="text-white text-4xl font-Quicksand tracking-wide"
                    style={{fontFamily: "Poppins, sans-serif"}}
                >
                    INGRESA A TU BÓVEDA CON BIOMETRIA
                </h1>
            </div>

            <div className="flex-1 flex items-center justify-center px-8">
                <div className="w-full max-w-xl">

                    <div
                        className="bg-gradient-to-br from-black backdrop-blur-sm rounded-[2.5rem] p-8 border text-green-500 shadow-2xl">

                        <div className="flex justify-center mb-6">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-green-500">
                                <circle cx="24" cy="24" r="4" fill="currentColor"/>
                                <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                                <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                            </svg>
                        </div>

                        <div className="relative bg-black rounded-2xl overflow-hidden mb-6"
                             style={{aspectRatio: "16/8"}}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {cameraError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                    <div className="text-center px-6">
                                        <p className="text-red-400 mb-4">{cameraError}</p>
                                        <button
                                            onClick={startCamera}
                                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                        >
                                            Intentar de nuevo
                                        </button>
                                    </div>
                                </div>
                            )}

                            {procesando && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <div className="text-center">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                                        <p className="text-green-500 font-semibold">Procesando...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-4">
                            <Button
                                variant="outlineLarge"
                                onClick={handleProcess}
                                disabled={procesando || cameraError}
                                className={procesando ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {procesando ? "PROCESANDO..." : "PROCESAR"}
                            </Button>
                            <Button variant="outlineLarge" onClick={handleSkip}>
                                pasar
                            </Button>
                        </div>

                        <div className="text-center space-y-2 mt-6">
                            <p className="text-green-500 font-semibold text-base">
                                ¡Sonríe a la cámara!
                            </p>
                            <p className="text-gray-300 text-sm leading-relaxed px-4">
                                Permite que la cámara escanee tu rostro para poder abrir la bóveda, esto se basa en la
                                foto registrada.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricVault;