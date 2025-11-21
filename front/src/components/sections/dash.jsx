import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {noti_util} from "../../utils/noti_util.jsx";
import {authService} from "../../services/auth_service.jsx";
import {dashboard_service} from "../../services/dashboard_service.jsx";
import {useAppContext} from "../../context/AppProvider.jsx";
import {usuarios_service} from "../../services/usuarios_service.jsx";

export function Dash() {
    const navigate = useNavigate();
    const {usuario} = useAppContext();
    const [logs, setLogs] = useState([]);
    const [intentos, setIntentos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [datosBarras, setDatosBarras] = useState([]);
    const [datosPie, setDatosPie] = useState([]);
    const [espacioUsado, setEspacioUsado] = useState(0);
    const [registroBiometrico, setRegistroBiometrico] = useState(0);

    useEffect(() => {
        cargarDatos();
        cargarGraficas();
        cargarEspacioUsado();

    }, []);


    const cargarEspacioUsado = async () => {

        const token = authService.obtenerToken();
        const resultado = await dashboard_service.espacio_usado(token);
        console.log(resultado);
        if (resultado.success) {
            setEspacioUsado(resultado.total);

            console.log(espacioUsado)
        } else {
            noti_util('error', resultado.error);
        }
    };

    const formatearBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const valorFormateado = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return valorFormateado + ' ' + sizes[i];
    };

    const formatearFechaTimestamp = (timestamp) => {
        if (!timestamp) return 'No registrado';

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return "Fecha inválida";
        }

        const fecha = date.toLocaleDateString();
        const hora = date.toLocaleTimeString();

        return `${fecha} - ${hora}`;
    };

    const cargarGraficas = async () => {
        const token = authService.obtenerToken();

        const resumenMes = await dashboard_service.resumen_mes_lineas(token);
        if (resumenMes.success) {
            const barrasFormateadas = resumenMes.labels.map((label, index) => ({
                dia: `Día ${label}`,
                archivos: resumenMes.data[index]
            }));
            setDatosBarras(barrasFormateadas);
        } else {
            noti_util('error', resumenMes.error);
        }

        const resumenTipo = await dashboard_service.resumen_tipo_pie(token);
        if (resumenTipo.success) {
            const pieFormateado = Object.entries(resumenTipo.data).map(([extension, cantidad]) => ({
                name: extension,
                value: cantidad
            }));
            setDatosPie(pieFormateado);
        } else {
            noti_util('error', resumenTipo.error);
        }
    };

    const cargarDatos = async () => {
        setCargando(true);
        const token = authService.obtenerToken();

        const resultadoLogs = await dashboard_service.log_general(token);
        if (resultadoLogs.success) {
            setLogs(resultadoLogs.logs);
        } else {
            noti_util('error', resultadoLogs.error);
        }

        const resultadoIntentos = await dashboard_service.log_ingresos_boveda(token);
        if (resultadoIntentos.success) {
            setIntentos(resultadoIntentos.ingresos);
        } else {
            noti_util('error', resultadoIntentos.error);
        }
        setRegistroBiometrico((await usuarios_service.get_registro_biometrico(authService.obtenerToken())).ultimo_cambio)

        setCargando(false);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-black to-gray-900 p-8 overflow-y-auto">
            <h1 className="text-white text-3xl mb-8 font-quicksand text-left">Dashboard</h1>

            <div className="mb-10">
                <h2 className="text-white text-xl mb-4 font-quicksand text-left">Gráficas</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="backdrop-blur-sm rounded-3xl border border-gray-600 p-6 bg-gray-900/40">
                        <h3 className="text-white text-lg mb-4 font-quicksand">
                            Archivos encriptados este mes
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={datosBarras}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                <XAxis
                                    dataKey="dia"
                                    stroke="#9CA3AF"
                                    style={{fontSize: '12px'}}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    style={{fontSize: '12px'}}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{
                                        color: '#fff'
                                    }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend
                                    wrapperStyle={{color: '#9CA3AF'}}
                                />
                                <Bar
                                    dataKey="archivos"
                                    fill="#10B981"
                                    radius={[8, 8, 0, 0]}
                                    name="Archivos"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="backdrop-blur-sm rounded-3xl border border-gray-600 p-6 bg-gray-900/40">
                        <h3 className="text-white text-lg mb-4 font-quicksand">
                            Distribución por tipo de archivo
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={datosPie}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {datosPie.map((entry, index) => {
                                        const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];
                                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>;
                                    })}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{
                                        color: '#fff'
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{color: '#9CA3AF', fontSize: '12px'}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="backdrop-blur-sm rounded-3xl border border-gray-600 p-6 bg-gray-900/40">
                        <h3 className="text-white text-lg mb-4 font-quicksand">
                            Espacio usado
                        </h3>
                        <div className="rounded-3xl  border border-gray-600 p-14  w-38 mx-auto">
                            {formatearBytes(espacioUsado)} / 50 GB
                        </div>
                    </div>

                    <div className="backdrop-blur-sm rounded-3xl border border-gray-600 p-6 bg-gray-900/40">
                        <h3 className="text-white text-lg mb-3 font-quicksand">
                            Registro biometrico
                        </h3>
                        <div className="rounded-3xl  border border-gray-600 p-14  w-38 mx-auto">
                            Último cambio: {formatearFechaTimestamp(registroBiometrico)}
                        </div>

                    </div>


                </div>
            </div>

            <div className="mb-10">
                <h2 className="text-white text-xl mb-4 font-quicksand text-left">Historial de Actividad</h2>

                {cargando ? (
                    <div className="text-center text-gray-400 py-12">Cargando datos...</div>
                ) : (
                    <div className="backdrop-blur-sm rounded-3xl border border-gray-600 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-600 ">
                            <div className="col-span-2 text-gray-400 text-sm text-left">ID</div>
                            <div className="col-span-5 text-gray-400 text-sm text-left">Descripción</div>
                            <div className="col-span-3 text-gray-400 text-sm text-left">Fecha - Hora</div>
                            <div className="col-span-2 text-gray-400 text-sm text-left">Tipo</div>
                        </div>

                        <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                            {logs.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">
                                    No hay registros de actividad
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div
                                        key={log.ID_Log}
                                        className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-700/30 transition-colors"
                                    >
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
                                            <span
                                                className="px-2 py-1 rounded-full text-xs bg-teal-500/20 text-teal-400">
                                                {log.tipo}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-4 text-left text-gray-500 text-sm">
                    Total de registros: {logs.length}
                </div>
            </div>

            <div>
                <h2 className="text-white text-xl mb-4 font-quicksand text-left">Intentos de Acceso</h2>

                {cargando ? (
                    <div className="text-center text-gray-400 py-12">Cargando datos...</div>
                ) : (
                    <div className="backdrop-blur-sm rounded-3xl border border-gray-600 overflow-hidden">
                        <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-600">
                            <div className="col-span-2 text-gray-400 text-sm text-left">ID</div>
                            <div className="col-span-3 text-gray-400 text-sm text-left">Fecha - Hora</div>
                            <div className="col-span-3 text-gray-400 text-sm text-left">Aceptación</div>
                            <div className="col-span-4 text-gray-400 text-sm text-left">Resultado</div>
                        </div>

                        <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                            {intentos.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">
                                    No hay intentos de acceso registrados
                                </div>
                            ) : (
                                intentos.map((intento, index) => (
                                    <div
                                        key={intento.ID_Ingreso || index}
                                        className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-gray-700/30 transition-colors"
                                    >
                                        <div className="col-span-2 text-gray-300 text-sm flex items-center">
                                            {intento.ID_Ingreso_boveda.substring(0, 8)}...
                                        </div>
                                        <div className="col-span-3 text-gray-300 text-sm flex items-center">
                                            {new Date(intento.fecha_hora).toLocaleDateString()} - {new Date(intento.fecha_hora).toLocaleTimeString()}
                                        </div>
                                        <div className="col-span-3 text-gray-300 text-sm flex items-center">
                                            <span className={`px-3 py-1 rounded-full text-xs ${
                                                intento.aceptacion === "Aceptado" || intento.aceptacion === true
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}>
                                                {intento.aceptacion === true ? "Aceptado" : intento.aceptacion === false ? "Rechazado" : intento.aceptacion}
                                            </span>
                                        </div>
                                        <div className="col-span-4 text-gray-200 text-sm flex items-center">
                                            {intento.resultado || intento.metodo || "Sin resultado"}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-4 text-left text-gray-500 text-sm">
                    Total de intentos: {intentos.length}
                </div>
            </div>
        </div>
    );
}