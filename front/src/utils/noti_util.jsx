import { toast } from 'react-toastify';
export const noti_util = (tipo, mensaje, id_notificacion = null) => {
    const iconos = {
        exito: '✅',
        error: '❌',
        advertencia: '⚠️',
        info: 'ℹ️',
        cargando: '⏳'
    };

    const icono = iconos[tipo] || '';
    const mensajeCompleto = icono ? `${icono} ${mensaje}` : mensaje;

    if (id_notificacion) {
        let toastType;

        switch (tipo) {
            case 'exito':
                toastType = 'success';
                break;
            case 'error':
                toastType = 'error';
                break;
            case 'advertencia':
                toastType = 'warning';
                break;
            case 'info':
                toastType = 'info';
                break;
            default:
                toastType = 'default';
        }

        toast.update(id_notificacion, {
            render: mensajeCompleto,
            type: toastType,
            isLoading: false,
            autoClose: 5000
        });
        return;
    }

    switch (tipo) {
        case 'exito':
            toast.success(mensajeCompleto);
            break;
        case 'error':
            toast.error(mensajeCompleto);
            break;
        case 'advertencia':
            toast.warning(mensajeCompleto);
            break;
        case 'info':
            toast.info(mensajeCompleto);
            break;
        case 'cargando':
            return toast.loading(mensajeCompleto);
        default:
            toast(mensajeCompleto);
    }
};
