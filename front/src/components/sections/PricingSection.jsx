
import React from 'react';
import Button from '../ui/Button';

export default function PricingSection() {
  const plans = [
    {
      name: 'PLAN GRATIS',
      price: 'S/0 mensual',
      variant: 'outline',
      features: [
        '5 subidas mensuales',
        'Añá 500 usuarios por archivo',
        'Límite de tamaño personalizable por cada',
        'Sin espacio de internet',
        'Borrado automático 5 después baja',
        'Soporte con e-mails'
      ],
      borderClass: 'border-gray-700'
    },
    {
      name: 'PLAN PREMIUM',
      price: 'S/1 mensual',
      variant: 'primary',
      features: [
        'Subidas ilimitadas',
        'Sin límite por archivo',
        'Acceso a la API 24/7',
        '1 TB de almacenamiento en la nube',
        'Personalización',
        'Análisis estadísticos múltiples que abren tu mente a la descarga',
        'Soporte prioritario',
        'Migración de tu propia bases desde plataformas Google Drive, Dropbox, OneDrive'
      ],
      borderClass: 'border-lime-400'
    }
  ];

  return (
    <section className="py-24 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-light text-center mb-4">
          Encripta tus archivos en la
        </h2>
        <h2 className="text-4xl font-light text-center mb-12">nube</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`border ${plan.borderClass} rounded-3xl p-8 bg-gray-800/50`}>
              <h3 className="text-2xl mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.price}</p>
              <Button variant={plan.variant} className="w-full mb-8">
                Registrate
              </Button>
              <ul className="space-y-3 text-sm text-gray-300">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}