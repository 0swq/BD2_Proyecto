import Inicio from './pages/Inicio.jsx';
import Login from './pages/Login.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Login />} />
      </Routes>
    </Router>
  );
}
export default App;
