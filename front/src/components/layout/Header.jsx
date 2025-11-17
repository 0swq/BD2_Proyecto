import React from 'react';
import {Link} from 'react-router-dom';
import {useAppContext} from "../../context/AppProvider.jsx";
import User_card from "../ui/user.jsx"
export default function Header() {
    let side;
    const {logeado} = useAppContext();
    if (!logeado) {
        side = (
            <>
                <button className="px-6 py-2 border border-gray-600 rounded-full hover:border-gray-400 transition">
                    <Link to="/login">Ingresar</Link>
                </button>
                <button
                    className="px-6 py-2 bg-lime-400 text-black rounded-full hover:bg-lime-300 transition font-medium">
                    <Link to="/registro">Registrarse</Link>
                </button>
            </>

        );
    }else{side=<User_card />}

    return (
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 z-50 ">
            <Link to="/">
                <div className="text-xl font-bold">FICURE</div>
            </Link>
            <div className="flex gap-4">{side}</div>
        </header>
    );
}