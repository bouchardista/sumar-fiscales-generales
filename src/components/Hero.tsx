import { useState, useEffect } from 'react';
import RegistrationForm from './RegistrationForm';

const Hero = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Mostrar el contenido inmediatamente al cargar
    setShowContent(true);
  }, []);

  // const toggleMute = () => {
  //   setIsMuted(!isMuted);
  //   // Recargar iframe con el parámetro mute correcto
  //   const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
  //   if (iframe) {
  //     const currentSrc = iframe.src;
  //     const newSrc = !isMuted 
  //       ? currentSrc.replace(/mute=\d/, 'mute=1')
  //       : currentSrc.replace(/mute=\d/, 'mute=0');
  //     iframe.src = newSrc;
  //   }
  // };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-[#832B99] via-[#631577] to-[#440055] text-primary-foreground py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <a 
            href="/" 
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/white-logo.png" alt="La Libertad Avanza" className="h-8" />
          </a>
        </div>
      </header>

      {/* Hero Section - Two Column Layout */}
      <section className="relative min-h-screen bg-gradient-to-br from-[#832B99] via-[#631577] to-[#440055]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Column - Form */}
            <div className={`order-2 lg:order-1 transition-all duration-800 ease-out ${
              showContent 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-8'
            }`}>
              <RegistrationForm />
            </div>

            {/* Right Column - Hero Content */}
            <div className={`order-1 lg:order-2 text-white space-y-6 transition-all duration-800 ease-out ${
              showContent 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-8'
            }`}>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight" style={{
                animation: showContent ? 'fadeInUp 0.8s ease-out 0.1s both' : 'none'
              }}>
                <span className="block">SUMATE A</span>
                <span className="block text-yellow-400">FISCALIZAR</span>
              </h1>
              
              <div className="space-y-4 text-lg md:text-xl" style={{
                animation: showContent ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
              }}>
                <p className="font-semibold">
                  Registrá a los fiscales generales de La Libertad Avanza en el sistema oficial.
                </p>
                
                <p>
                  Tu labor es fundamental para organizar y coordinar el equipo de fiscalización.
                </p>
                
                <p>
                  Completá el formulario de registro único de La Libertad Avanza Córdoba.
                </p>
              </div>

              <div className="pt-6" style={{
                animation: showContent ? 'fadeInUp 0.8s ease-out 0.3s both' : 'none'
              }}>
                <p className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
                  ¡VIVA LA LIBERTAD, CARAJO!
                </p>
                <p className="text-xl md:text-2xl font-semibold italic">
                  Javier Milei
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
