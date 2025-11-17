import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-gradient-to-br from-teal-900/40 to-teal-800/20 backdrop-blur-sm rounded-[2.5rem] p-12 border border-teal-700/50 shadow-2xl text-center">

          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gray-900 rounded-full p-6 border-4 border-red-500/50">
                <AlertCircle className="w-20 h-20 text-red-500" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4">
              404
            </h1>
            <h2 className="text-3xl font-bold text-white mb-2">
              Página no encontrada
            </h2>
            <p className="text-gray-400 text-lg">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
          </div>

          {/* Decorative Line */}
          <div className="my-8">
            <div className="h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>
          </div>

          {/* Additional Info */}
          <div className="mb-8 space-y-2">
            <p className="text-gray-300 text-sm">
              Puede que hayas escrito mal la URL o que el enlace esté roto.
            </p>
            <p className="text-teal-400 font-semibold">
              ¿Necesitas ayuda? Contacta con soporte.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <button className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105">
                <Home className="w-5 h-5" />
                Ir al inicio
              </button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all border border-gray-600 hover:border-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver atrás
            </button>
          </div>

          {/* Footer Logo */}
          <div className="mt-12">
            <p className="text-gray-500 text-sm font-bold tracking-wider">FIGURE</p>
          </div>

        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-75"></div>
      </div>
    </div>
  );
};

export default ErrorPage;