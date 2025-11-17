import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import Biometria from "../components/sections/camara.jsx";
import BovedaReal from "../components/sections/BovedaReal.jsx";
import {useAppContext} from "../context/AppProvider.jsx";
import {useAuth} from "../services/useAuth.jsx";

export default function Boveda() {

    const {bovedaAbierta} = useAppContext();
    const siguiente = bovedaAbierta ? <BovedaReal/> : <Biometria/>;
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
            {siguiente}
        </div>
    )
}
