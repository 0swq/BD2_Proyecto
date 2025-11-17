// src/pages/Inicio.jsx
import React from 'react';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import HeroSection from '../components/sections/HeroSection.jsx';
import UploadSection from '../components/sections/UploadSection.jsx';
import PricingSection from '../components/sections/PricingSection.jsx';
import VaultSection from '../components/sections/VaultSection.jsx';
import '../App.css';

export default function Inicio() {
    return (
        <div className="min-h-screen bg-black text-white m-0 p-0 w-full">
            <Header/>
            <HeroSection/>
            <UploadSection/>
            <PricingSection/>
            <VaultSection/>
            <Footer/>
        </div>
    );
}
