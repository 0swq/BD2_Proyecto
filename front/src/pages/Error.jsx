import React from "react";
import Error404 from "../components/layout/Error404.jsx";
import SideBar from "../components/layout/Error404.jsx";
import {useAuth} from "../services/useAuth.jsx";
export default function Encriptar() {
    useAuth()
    return (
        <div >
            <SideBar/>
            <Error404/>
        </div>
    )
}