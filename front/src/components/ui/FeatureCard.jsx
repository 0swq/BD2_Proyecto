import React from 'react';

export default function FeatureCard({ title, subtitle, description, icon: Icon }) {
  return (
    <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-2xl p-8 backdrop-blur-sm hover:border-emerald-700/50 transition">
      <h3 className="text-xl mb-2">{title}</h3>
      {subtitle && <h3 className="text-xl mb-6">{subtitle}</h3>}
      <p className="text-sm text-gray-400 mb-8">{description}</p>
      <Icon className="w-16 h-16 text-gray-500 mx-auto" />
    </div>
  );
}