import Header from '../components/layout/Header.jsx';

import React from "react";
import RegistroForm from "../components/auth/RegistroForm.jsx";

export default function Registro() {
    return (
        <div className="min-h-screen bg-black text-white m-0 p-0 w-full">
            <Header/>
            <RegistroForm/>
        </div>
    )
}