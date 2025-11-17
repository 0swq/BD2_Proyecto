import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import PreEncriptar from "../components/sections/PreEncriptar.jsx";
import {useAuth} from "../services/useAuth.jsx";

export default function Encriptar() {
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
            <PreEncriptar/>
        </div>
    )
}