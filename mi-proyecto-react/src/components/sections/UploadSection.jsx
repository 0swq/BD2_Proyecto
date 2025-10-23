import React from 'react';
import { Upload } from 'lucide-react';

export default function UploadSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-light mb-4">
          Cifra, guarda y controla tus
        </h2>
        <h2 className="text-4xl font-light mb-8">
          archivos fácilmente
        </h2>
        <p className="text-gray-400 mb-12">Es así de fácil de proceder.</p>
        <Upload className="w-20 h-20 text-gray-500 mx-auto" />
      </div>
    </section>
  );
}