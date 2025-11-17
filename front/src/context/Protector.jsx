import React from "react";
import {Navigate} from "react-router-dom";
import {useAppContext} from "/AppProvider.jsx";

export default function ProtectedRoute({children, adminOnly = false}) {
    const {logeado, administrador} = useAppContext();


    if (!logeado) {
        return <Navigate to="/login" replace/>;
    }


    if (adminOnly && !administrador) {
        return <Navigate to="/no-autorizado" replace/>;
    }

    return children;
}
