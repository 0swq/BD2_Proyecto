import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import {useAuth} from "../services/useAuth.jsx";

export default function Control() {
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
        </div>
    )
}