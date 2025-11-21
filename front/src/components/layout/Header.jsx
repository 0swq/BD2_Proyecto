import React from 'react';
import {Link} from 'react-router-dom';
import {useAppContext} from "../../context/AppProvider.jsx";
import User_card from "../ui/user.jsx"
import Logo from "../../assets/Logo.png";

export default function Header() {
    const {logeado} = useAppContext();

    return (
        <header
            className="fixed top-0 left-0 w-full flex justify-between items-center px-[41.1px] py-6 z-50 ">
            <Link to="/" className="flex items-center">
                <img src={Logo} alt="Logo FICURE" className="h-6 w-auto object-contain"/>
            </Link>


            <div className="flex gap-4">
                {!logeado ? (
                    <>
                        <Link to="/login">
                            <button
                                className="px-6 py-2 border border-gray-600 text-white rounded-full hover:border-lime-400 transition">
                                Ingresar
                            </button>
                        </Link>
                        <Link to="/registro">
                            <button
                                className="px-6 py-2 bg-lime-400 text-black rounded-full hover:bg-lime-300 transition font-medium">
                                Registrarse
                            </button>
                        </Link>
                    </>
                ) : (
                    <User_card/>
                )}
            </div>
        </header>
    );
}