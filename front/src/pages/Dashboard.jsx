import React from "react";
import Sidebar from "../components/layout/SideBar.jsx";
import {useAuth} from "../services/useAuth.jsx";
import {Dash} from "../components/sections/dash.jsx";

export default function Dashboard() {
    useAuth()
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar/>
            <Dash/>
        </div>
    )
}