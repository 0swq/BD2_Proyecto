import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import {useAuth} from "../services/useAuth.jsx";

export default function Dashboard() {
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
        </div>
    )
}