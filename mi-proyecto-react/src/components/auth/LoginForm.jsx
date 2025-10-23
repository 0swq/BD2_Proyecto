import React from 'react';

export default function LoginForm() {


    return (
        <form>
            <input type="email" placeholder="Email" required/>
            <input type="password" placeholder="Contraseña" required/>
            <button type="submit">Iniciar sesión</button>
        </form>
    )
}