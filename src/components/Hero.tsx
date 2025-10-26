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

      {/* Hero Section - Solo Formulario */}
      <section className="relative min-h-screen bg-gradient-to-br from-[#832B99] via-[#631577] to-[#440055]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className={`transition-all duration-800 ease-out ${
            showContent 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
            <RegistrationForm />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
