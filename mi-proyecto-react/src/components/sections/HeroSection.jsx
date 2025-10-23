import React from 'react';
import { Lock, Eye, FolderOpen } from 'lucide-react';
import FeatureCard from '../ui/FeatureCard';

export default function HeroSection() {
  const features = [
    {
      title: 'Protege tus',
      subtitle: 'archivos',
      description: 'Resguarda tus archivos críticos con contraseñas y cifrado de extremo a extremo.',
      icon: Lock
    },
    {
      title: 'Acceso',
      subtitle: 'biométrico',
      description: 'Usa tu rostro para desbloquear tus archivos de forma rápida y confiable.',
      icon: Eye
    },
    {
      title: 'Control total',
      subtitle: null,
      description: 'Tienes el sin acceso privilegiado a tus archivos.',
      icon: FolderOpen
    }
  ];

  return (
    <section className="min-h-[80vh] pt-40 flex flex-col  items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-black pointer-events-none"></div>

      <h1 className="text-5xl md:text-6xl  font-light text-center mb-4 relative z-10">
        ARCHIVOS SEGUROS, MENTE<br />TRANQUILA
      </h1>

      <p className="text-gray-400 text-center mb-8 relative z-10">
        Mantén tus archivos a salvo con cifrado y biometría
      </p>

      {/* Format Icons */}
      <div className="flex gap-8 mb-12 text-gray-400 relative z-10">
        {['ZIP', 'RAR', '7Z', 'TAR'].map((format) => (
          <div key={format} className="text-center">
            <span className="text-2xl">{format}</span>
          </div>
        ))}
      </div>
        <p className="text-gray-400 text-center mb-8 relative z-10">
        Formatos aceptados entre muchos mas
      </p>


      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}