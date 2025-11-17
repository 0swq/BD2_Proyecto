import LoginForm from "../components/auth/LoginForm.jsx";
import Header from '../components/layout/Header.jsx';

import React from "react";

export default function Login() {
    return (
        <div className="min-h-screen bg-black text-white m-0 p-0 w-full">
            <Header/>
            <LoginForm/>
        </div>
    )
}