import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-500">
        <div>Política de Privacidad</div>
        <div>Términos y Condiciones</div>
        <div>Ayuda y Soporte</div>
      </div>
      <div className="text-center mt-4 text-xs text-gray-600">
        © 2025 Ficure® Todos los derechos reservados
      </div>
    </footer>
  );
}