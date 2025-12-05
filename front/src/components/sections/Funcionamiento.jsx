import React from 'react';
import { Upload, Lock, Shield, Download } from 'lucide-react';

export default function Funcionamiento() {
  const pasos = [
    {
      numero: '01',
      titulo: 'Sube tu',
      subtitulo: 'archivo',
      descripcion: 'Sube tus documentos, imágenes o cualquier tipo de archivo. Aceptamos múltiples formatos.',
      icono: Upload
    },
    {
      numero: '02',
      titulo: 'Cifrado',
      subtitulo: 'automático',
      descripcion: 'Tu archivo se encripta automáticamente con AES-256, el estándar militar de seguridad.',
      icono: Lock
    },
    {
      numero: '03',
      titulo: 'Protección',
      subtitulo: 'biométrica',
      descripcion: 'Configura el acceso con reconocimiento facial para máxima seguridad.',
      icono: Shield
    },
    {
      numero: '04',
      titulo: 'Acceso',
      subtitulo: 'seguro',
      descripcion: 'Descarga tus archivos cuando los necesites, cual sea el modo que elijas.',
      icono: Download
    }
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-black pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-light text-center mb-4">
          ¿Cómo funciona?
        </h2>
        <p className="text-gray-400 text-center mb-16">
          Protege tus archivos en 4 simples pasos
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pasos.map((paso, indice) => (
            <div
              key={indice}
              className="border border-emerald-900/50 bg-emerald-950/20 rounded-2xl p-8 backdrop-blur-sm hover:border-emerald-700/50 transition relative"
            >

              <div className="text-5xl font-light text-emerald-900/30 absolute top-4 right-6">
                {paso.numero}
              </div>

              <h3 className="text-xl mb-2">{paso.titulo}</h3>
              <h3 className="text-xl mb-6">{paso.subtitulo}</h3>
              <p className="text-sm text-gray-400 mb-8">{paso.descripcion}</p>
              <paso.icono className="w-16 h-16 text-gray-500 mx-auto" />
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-700/50 transition">
            <div className="text-3xl font-light mb-2">50GB</div>
            <div className="text-sm text-gray-400">Almacenamiento gratis</div>
          </div>
          <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-700/50 transition">
            <div className="text-3xl font-light mb-2">PBKDF2-HMAC-SHA256</div>
            <div className="text-sm text-gray-400">480 000 iteraciones</div>
          </div>
          <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-700/50 transition">
            <div className="text-3xl font-light mb-2">12 bytes</div>
            <div className="text-sm text-gray-400">Nonce único por cifrado</div>
          </div>
          <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-700/50 transition">
            <div className="text-3xl font-light mb-2">16 bytes</div>
            <div className="text-sm text-gray-400">Tag GCM anti-manipulación</div>
          </div>
        </div>
      </div>
    </section>
  );
}
