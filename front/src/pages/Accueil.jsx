// Accueil.jsx
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import logo from '../assets/logo.jpg';

const Accueil = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      offset: 100,
      delay: 0,
      easing: 'ease',
    });
    AOS.refresh();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-poppins antialiased overflow-x-hidden">
      {/* BEGIN: Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-container"
       data-aos="fade-down"
        data-aos-duration="600"
        >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center">
            <a className="flex items-center" href="#">
              <img src={logo} alt="EMIT" className="h-10 w-auto" />
            </a>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center gap-10 text-sm font-semibold text-on-surface-variant">
            <a className="hover:text-brand-blue transition-colors" href="#">Accueil</a>
            <a className="hover:text-brand-blue transition-colors" href="#apropos">Apropos</a>
            <a className="hover:text-brand-blue transition-colors" href="#contact">Contact</a>
          </div>
          <div className="flex items-center gap-6">
            <a className="text-sm font-semibold text-on-surface-variant hover:text-brand-blue transition-colors" href="login">Connexion</a>
           
              <a href="/inscription">
               <button className="px-7 py-2.5 bg-brand-blue text-sm font-bold rounded-full hover:shadow-lg hover:shadow-brand-blue/30 transition-all text-white">
              S'inscrire
            
            </button>
              </a>
          </div>
        </div>
      </nav>
      {/* END: Navigation */}

      {/* BEGIN: HeroSection */}
      <header className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Background" 
            className="w-full h-full object-cover opacity-10" 
            src="https://lh3.googleusercontent.com/aida/ADBb0uiwxIxEjWOwad13Zzn5YVD7A49vQBmaNMdSIc_fzZhXS2NXEgYe-VSFTUmbf3x2tqexBnsk5oEa798EUj5bWpDTdaUeP7Q2AtT3804kEMNXAxmScSn7Pd8ubYAiNkQdAYNjDxRucg1iAHv-y12IZQY2fiqPEFCK3jjPgTteqJBo5nSuSkgdlb60fwgIrH6ImURSZ71twHmuvTREbfde4XvQ9K-kPrm9CAweCnjWJRdWaTUorTdXZHQ"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-surface to-surface"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div 
              className="lg:w-1/2 text-left"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-primary mb-8 leading-[1.05]">
                La gestion scolaire <br/>
                <span className="text-brand-blue">réinventée.</span>
              </h1>
              <p 
                className="max-w-xl text-lg text-on-surface-variant mb-10 leading-relaxed"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                Optimisez vos plannings, gérez vos salles et vos professeurs en toute simplicité. Une plateforme robuste pour une éducation moderne conçue pour la croissance.
              </p>
              <div 
                className="flex flex-wrap items-center gap-6"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <a href="login">
                   <button className="px-8 py-4 bg-brand-blue font-bold rounded-2xl shadow-xl shadow-brand-blue/20 hover:scale-105 transition-all text-white flex items-center gap-2">
                  Commencer maintenant 
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                </a>
               
              </div>
            </div>
            <div 
              className="lg:w-1/2 relative flex justify-center"
              data-aos="fade-left"
              data-aos-duration="1000"
              data-aos-delay="200"
            >
              <div className="relative w-[500px] h-[500px]">
                <div className="absolute inset-0 hero-circle-bg scale-90" data-aos="zoom-in" data-aos-delay="400"></div>
                <div className="absolute inset-0 z-10 flex items-center justify-center pt-10">
                  <img 
                    alt="Student" 
                    className="h-full object-contain" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRzVNlVYVqtNGbQXHDa9ARJdBWWa8Twd1F-5TCKGQhYus7YGfcFNHWd4hMwwElbLsUSPT0FHrGKkdWfPufB5vDF6nzTMZ5In-bq-JoO6ia3Iscto1jSzgI8hvG8o-mHRCmSfvyDblgxZ7abT7T9rjeN978nYmLeDA3WtIinpFaRMGmdhgv7gq-uyXK7uahTw1rPxaRcKMu7aHL95f1MwaFqi8IJ9SEF4KDUq1pylQuMXIuywC2rGlNwc_ceAIzbiHMMH_FKi-1rTc"
                  />
                </div>
                <div className="absolute bottom-32 -right-8 z-20 floating delay-700 bg-white p-4 rounded-2xl shadow-2xl w-56" data-aos="fade-up-left" data-aos-delay="700"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* END: HeroSection */}

      {/* BEGIN: Features Brief */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span 
            className="text-brand-blue font-bold text-sm tracking-widest uppercase mb-4 block"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            Fonctionnalités
          </span>
          <h2 
            className="text-4xl font-bold text-primary mb-16"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="100"
          >
            Nos points forts
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              className="p-8 rounded-3xl bg-surface border border-surface-container hover:shadow-2xl hover:shadow-primary/5 transition-all group"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="0"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-brand-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Comme assistant </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Simple pour tous les niveaux d'utilisateurs académiques.</p>
            </div>
            <div 
              className="p-8 rounded-3xl bg-surface border border-surface-container hover:shadow-2xl hover:shadow-primary/5 transition-all group"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="100"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Application de confiance</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Sécurité maximale pour vos données d'établissement.</p>
            </div>
            <div 
              className="p-8 rounded-3xl bg-surface border border-surface-container hover:shadow-2xl hover:shadow-primary/5 transition-all group"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="200"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">dashboard_customize</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Flexibilité</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">S'adapte à tous les types de cursus scolaires.</p>
            </div>
            <div 
              className="p-8 rounded-3xl bg-surface border border-surface-container hover:shadow-2xl hover:shadow-primary/5 transition-all group"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="300"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <h3 className="text-lg font-bold mb-3">100% Efficace</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Gagnez du temps sur vos tâches administratives.</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Features Brief */}

      {/* BEGIN: System Feature */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div 
              className="lg:w-1/2"
              data-aos="fade-right"
              data-aos-duration="800"
            >
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-surface-container relative">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-bold text-sm">Today Graphic</h4>
                  <span className="text-[10px] text-on-surface-variant">Jan - Mai 2024</span>
                </div>
                <div className="h-40 flex items-end gap-3 mb-8">
                  <div className="flex-1 bg-brand-blue/10 rounded-t-lg h-24" data-aos="zoom-in-up" data-aos-delay="100"></div>
                  <div className="flex-1 bg-brand-blue/20 rounded-t-lg h-32" data-aos="zoom-in-up" data-aos-delay="200"></div>
                  <div className="flex-1 bg-brand-blue rounded-t-lg h-40" data-aos="zoom-in-up" data-aos-delay="300"></div>
                  <div className="flex-1 bg-brand-blue/40 rounded-t-lg h-28" data-aos="zoom-in-up" data-aos-delay="400"></div>
                  <div className="flex-1 bg-brand-blue/15 rounded-t-lg h-36" data-aos="zoom-in-up" data-aos-delay="500"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-2xl" data-aos="fade-right" data-aos-delay="400">
                    <p className="text-[10px] text-on-surface-variant mb-1">Activité Statistique</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-brand-blue rounded-full"></div>
                      <div className="w-2 h-6 bg-brand-blue/40 rounded-full"></div>
                      <div className="w-2 h-10 bg-brand-blue/60 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-brand-blue text-primary p-4 rounded-2xl" data-aos="fade-left" data-aos-delay="400">
                    <p className="text-[10px] text-primary/80 mb-1">Nouveaux plannings</p>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-primary/20 bg-primary/20"></div>
                        <div className="w-6 h-6 rounded-full border border-primary/20 bg-primary/40"></div>
                      </div>
                      <span className="text-xs font-bold">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="lg:w-1/2"
              data-aos="fade-left"
              data-aos-duration="800"
            >
              <span className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-4 block">Supériorité</span>
              <h2 className="text-4xl font-bold text-primary mb-6">Système intelligent &amp; interface conviviale</h2>
              <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
                L'utilisation d'EMIT est extrêmement fluide, en plus d'offrir de nombreuses fonctionnalités exclusives que les autres gestionnaires d'établissements ne possèdent pas. La gestion des tâches scolaires devient un plaisir.
              </p>
              <button className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">En savoir plus</button>
            </div>
          </div>
        </div>
      </section>
      {/* END: System Feature */}

      {/* BEGIN: How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
            <div 
              className="lg:w-1/2"
              data-aos="fade-left"
              data-aos-duration="800"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-surface-container" data-aos="fade-up" data-aos-delay="100">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-brand-blue">description</span>
                      <span className="text-xs font-bold uppercase">Documents</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="h-2 w-full bg-slate-200 rounded-full"></li>
                      <li className="h-2 w-3/4 bg-slate-200 rounded-full"></li>
                      <li className="h-2 w-5/6 bg-slate-200 rounded-full"></li>
                    </ul>
                  </div>
                  <div className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/10" data-aos="fade-up" data-aos-delay="200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300"></div>
                      <span className="text-[10px] font-bold">Contact Support</span>
                    </div>
                    <p className="text-[9px] text-on-surface-variant">Réponse en moins de 5 min</p>
                  </div>
                </div>
                <div className="pt-8" data-aos="fade-up" data-aos-delay="300">
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden h-full">
                    <span className="text-xs font-bold uppercase opacity-60 block mb-4">Tutorial videos</span>
                    <div className="aspect-video bg-slate-800 rounded-xl mb-4 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl opacity-50">play_circle</span>
                    </div>
                    <p className="text-[10px] opacity-80 leading-relaxed">Apprenez à gérer vos cours en seulement 5 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="lg:w-1/2"
              data-aos="fade-right"
              data-aos-duration="800"
            >
              <span className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-4 block">Comment ça marche</span>
              <h2 className="text-4xl font-bold text-primary mb-6">Comment fonctionne EMIT ? Nous avons 3 options</h2>
              <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
                Si vous rencontrez la moindre difficulté, nous avons 3 solutions pour vous : plus de 100 documents lisibles, des tutoriels vidéos complets que vous pouvez consulter partout, et un service client 24/7.
              </p>
              <button className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">Découvrir les options</button>
            </div>
          </div>
        </div>
      </section>
      {/* END: How It Works */}

      {/* BEGIN: Download App */}
      <section className="py-24 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-xl border border-surface-container flex flex-col lg:flex-row items-center gap-16 relative">
            <div 
              className="lg:w-1/2 relative"
              data-aos="fade-right"
              data-aos-duration="800"
            >
              <div className="absolute -inset-10 bg-brand-blue/10 rounded-full blur-3xl opacity-50"></div>
              <div className="relative w-64 mx-auto bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-8 border-slate-800">
                <div className="bg-white h-[450px] rounded-[2.5rem] overflow-hidden p-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black">EMIT</span>
                    <span className="material-symbols-outlined text-sm">notifications</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-slate-100 rounded-2xl p-3">
                      <div className="w-1/2 h-2 bg-slate-300 rounded-full mb-2"></div>
                      <div className="w-full h-2 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 bg-brand-blue/10 rounded-2xl"></div>
                      <div className="h-24 bg-sky-50 rounded-2xl"></div>
                    </div>
                    <div className="h-32 bg-slate-100 rounded-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="lg:w-1/2"
              data-aos="fade-left"
              data-aos-duration="800"
            >
              <span className="text-brand-blue font-bold text-sm uppercase tracking-widest mb-4 block">Télécharger</span>
              <h2 className="text-4xl font-bold text-primary mb-6">Téléchargez EMIT sur tous vos appareils</h2>
              <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
                La meilleure solution pour la gestion scolaire est enfin là, et elle est gratuite ! N'oubliez pas de télécharger EMIT pour ressentir la façon la plus simple de gérer votre établissement.
              </p>
              <div className="flex flex-wrap gap-4">
                <a className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all" href="#">
                  <img alt="App Store" className="w-5 h-5" src="src/assets/appstore.png" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-bold opacity-60">Download on the</p>
                    <p className="text-sm font-bold">App Store</p>
                  </div>
                </a>
                <a className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all" href="#">
                  <img alt="Play Store" className="h-5" src="src/assets/google.png" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-bold opacity-60">Get it on</p>
                    <p className="text-sm font-bold">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Download App */}

      {/* BEGIN: Contact Section */}
      <section id="contact" className="py-24 bg-white font-poppins">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold text-primary mb-4"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              Contactez-nous
            </h2>
            <p 
              className="text-on-surface-variant text-lg"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay="100"
            >
              Une question ? Notre équipe est là pour vous accompagner.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16">
            <div 
              className="bg-surface p-8 lg:p-12 rounded-3xl border border-surface-container"
              data-aos="fade-right"
              data-aos-duration="800"
            >
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Nom complet</label>
                  <input className="w-full px-5 py-3 rounded-xl border border-outline/20 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all bg-white" placeholder="Votre nom" type="text" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Email</label>
                  <input className="w-full px-5 py-3 rounded-xl border border-outline/20 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all bg-white" placeholder="votre@email.com" type="email" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Sujet</label>
                  <input className="w-full px-5 py-3 rounded-xl border border-outline/20 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all bg-white" placeholder="Comment pouvons-nous vous aider ?" type="text" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Message</label>
                  <textarea className="w-full px-5 py-3 rounded-xl border border-outline/20 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all bg-white" placeholder="Votre message..." rows="4"></textarea>
                </div>
                <button className="w-full py-4 bg-brand-blue text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-brand-blue/30 transition-all" type="submit">Envoyer le message</button>
              </form>
            </div>
            <div 
              className="flex flex-col justify-center space-y-10"
              data-aos="fade-left"
              data-aos-duration="800"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-primary mb-1">Email</h4>
                  <p className="text-on-surface-variant">contact@univ-emit.com</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-primary mb-1">Téléphone</h4>
                  <p className="text-on-surface-variant">+261 (0) 34 45 67 89</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-primary mb-1">Adresse</h4>
                  <p className="text-on-surface-variant">EMIT Fianarantsoa, Andrainjato Fianarantsoa BP 301</p>
                </div>
              </div>
              <div className="pt-8">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Vous préférez discuter en direct ? Notre centre de support est ouvert 24h/24 et 7j/7 pour répondre à vos besoins techniques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Contact Section */}

      {/* BEGIN: Footer */}
      <footer id='apropos' className="bg-primary text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div 
              className="lg:col-span-2 space-y-6"
              data-aos="fade-right"
              data-aos-duration="600"
            >
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Utilisez le temps de la manière la plus courte possible pour créer des plannings, utilisez toutes les fonctionnalités gratuites pour tirer le meilleur parti de votre éducation.
              </p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue hover:text-primary transition-all" href="#">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue hover:text-primary transition-all" href="#">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue hover:text-primary transition-all" href="#">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue hover:text-primary transition-all" href="#">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue hover:text-primary transition-all" href="#">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.698.83.578 4.765-1.588 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div data-aos="fade-up" data-aos-delay="0">
              <h4 className="text-lg font-bold mb-8">Produit</h4>
              <ul className="space-y-4 text-white/60 text-sm font-medium">
                <li><a className="hover:text-white transition-colors" href="#">Fonctionnalités</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Tarifs</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Témoignages</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Intégrations</a></li>
              </ul>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <h4 className="text-lg font-bold mb-8">Support &amp; Aide</h4>
              <ul className="space-y-4 text-white/60 text-sm font-medium">
                <li><a className="hover:text-white transition-colors" href="#">FAQ's</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Contactez-nous</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Centre de support</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Sécurité</a></li>
              </ul>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <h4 className="text-lg font-bold mb-8">Partenaires</h4>
              <ul className="space-y-4 text-white/60 text-sm font-medium">
                <li><a className="hover:text-white transition-colors" href="#">Nos partenaires</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Devenir partenaire</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Affiliation</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/40 uppercase font-bold tracking-widest">
            <p>© 2026 projet ASN.NET - All rights reserved @emit.co</p>
            <div className="flex gap-8">
              <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
             
            </div>
          </div>
        </div>
      </footer>
      {/* END: Footer */}
    </div>
  );
};

export default Accueil;