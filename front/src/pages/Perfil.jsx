import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import {useAuth} from "../services/useAuth.jsx";
import {Perfil_user} from "../components/sections/Perfil.jsx";
export default function Perfil() {
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
            <Perfil_user/>
        </div>
    )
}