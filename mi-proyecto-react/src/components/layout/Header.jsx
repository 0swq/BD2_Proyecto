import React from 'react';
import { Link } from 'react-router-dom'; // <- IMPORTA Link
export default function Header({login}) {
    let buttons;

    if (login) {
        buttons = (
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
    }

    return (
        <header className="fixed top-0 left-0 w-full flex justify-between items-center p-6 z-50 ">
            <div className="text-xl font-bold">FICURE</div>
            <div className="flex gap-4">{buttons}</div>
        </header>
    );
}