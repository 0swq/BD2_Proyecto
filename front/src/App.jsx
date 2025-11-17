import Inicio from './pages/Inicio.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Boveda from './pages/Boveda.jsx';
import Encriptar from './pages/Encriptar.jsx';
import Perfil from './pages/Perfil.jsx';
import Control from './pages/Control.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Error from './pages/Error.jsx';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {ToastContainer} from "react-toastify";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Inicio/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/registro" element={<Registro/>}/>
                <Route path="/boveda" element={<Boveda/>}/>
                <Route path="/encriptar" element={<Encriptar/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/perfil" element={<Perfil/>}/>
                <Route path="/control" element={<Control/>}/>
                <Route path="/error" element={<Error/>}/>
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                toastClassName="toast-quicksand"
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Router>

    );
}

export default App;
