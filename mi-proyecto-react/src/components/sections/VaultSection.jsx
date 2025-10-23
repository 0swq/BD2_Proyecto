import React from 'react';
import Button from '../ui/Button';

export default function VaultSection() {
  return (
    <section className="py-24 px-4 bg-black">
      <div className="max-w-2xl mx-auto text-center">
        <div className="border border-gray-700 rounded-3xl p-12 bg-gray-900/50">
          <h2 className="text-4xl font-light mb-8">VER BÓVEDA</h2>
          <p className="text-gray-400 mb-8">Descubre tu baúl de tesoro</p>
          <Button variant="outlineLarge">
            Regístrate
          </Button>
          <div className="mt-8 text-sm text-gray-500">FICURE</div>
        </div>
      </div>
    </section>
  );
}
