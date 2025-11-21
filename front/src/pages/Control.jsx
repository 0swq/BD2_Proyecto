import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import {useAuth} from "../services/useAuth.jsx";
import {Panel_control} from "../components/sections/control.jsx";

export default function Control() {
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
            <Panel_control/>
        </div>
    )
}