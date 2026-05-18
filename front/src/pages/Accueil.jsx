import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Accueil = () => {
  const navigate = useNavigate();
  
  // Références pour la navigation interne
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans antialiased text-gray-900 bg-white">
      {/* Navbar avec liens connectés aux sections */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-8 flex items-center justify-between h-20">
          <img 
            src="/src/image/logo.png" 
            alt="Logo EMIT" 
            className="h-12 w-auto cursor-pointer" 
            onClick={scrollToTop}
          />
          <div className="hidden md:flex items-center gap-10">
            <button onClick={scrollToTop} className="text-base font-bold text-indigo-600">Accueil</button>
            <button onClick={() => scrollToSection(aboutRef)} className="text-base font-semibold text-gray-600 hover:text-indigo-600 transition-colors">À propos</button>
            <button onClick={() => scrollToSection(contactRef)} className="text-base font-semibold text-gray-600 hover:text-indigo-600 transition-colors">Contacts</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/src/image/EMIT.PNG" alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-xl bg-white/10 backdrop-blur-2xl p-12 rounded-[40px] border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">L'EMIT : Innover pour l'avenir technologique</h1>
            <p className="text-white/80 text-lg mb-8 font-light">L'excellence académique à Madagascar au service du Management et de la Technologie.</p>
            <button 
              onClick={() => navigate('/login')}
              className="group flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
            >
              Accéder au portail
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Section À Propos (Informations) */}
      <section ref={aboutRef} className="py-24 max-w-7xl mx-auto px-8">
        <h2 className="text-3xl font-bold mb-16 text-center text-gray-800">Nos Piliers d'Excellence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Carte 1 */}
          <div className="p-10 bg-gray-50 rounded-[30px] border border-gray-100 transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">Innovation Tech</h3>
            <p className="text-gray-600 leading-relaxed text-sm">Programmes centrés sur les dernières technologies pour répondre aux besoins du marché mondial.</p>
          </div>

          {/* Carte 2 */}
          <div className="p-10 bg-gray-50 rounded-[30px] border border-gray-100 transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">Management</h3>
            <p className="text-gray-600 leading-relaxed text-sm">Développement du leadership et des compétences managériales pour diriger les entreprises de demain.</p>
          </div>

          {/* Carte 3 */}
          <div className="p-10 bg-gray-50 rounded-[30px] border border-gray-100 transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4">Insertion Réussie</h3>
            <p className="text-gray-600 leading-relaxed text-sm">98% de nos diplômés trouvent un emploi qualifié dans les 6 mois suivant la sortie.</p>
          </div>
        </div>
      </section>

      {/* Footer / Section Contact */}
      <footer ref={contactRef} className="bg-gray-900 text-white py-24 rounded-t-[60px]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-8">Contactez-nous</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <svg className="w-6 h-6 text-indigo-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-lg text-gray-300">contact@emit-u-fianar.mg</span>
              </div>
              <div className="flex items-center gap-5 group">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg className="w-6 h-6 text-green-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 2.01.5 3.84 1.51 5.48L2.01 22l4.67-1.51c1.51.84 3.19 1.34 5.33 1.34 5.52 0 9.99-4.47 9.99-9.99 0-5.52-4.47-9.99-9.99-9.99z" />
                  </svg>
                </div>
                <span className="text-lg text-gray-300">+261 34 00 000 00</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-8">Retrouvez-nous</h3>
            <div className="flex gap-6">
              <a href="#" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-blue-800 transition-all">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-20 text-sm">© 2026 EMIT Fianarantsoa. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Accueil;