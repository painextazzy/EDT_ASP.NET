import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-900 overflow-hidden">
      {/* Arrière-plan conservé avec aspect flouté */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/image/EMIT.PNG" 
          alt="Fond Campus" 
          className="w-full h-full object-cover blur-md scale-105 opacity-50" 
        />
        {/* Overlay pour assombrir légèrement et augmenter le contraste */}
        <div className="absolute inset-0 bg-slate-900/40"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Formulaire avec ombre portée accentuée (shadow-2xl + shadow-black/50) */}
        <div className="bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-10 md:p-14 border border-slate-100">
          
          {/* Logo centré */}
          <div className="flex flex-col items-center mb-10">
            <img src="/src/image/logo.png" alt="Logo EMIT" className="h-16 w-auto mb-4" />
            <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">
                Identifiant
              </label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400"
                placeholder="nom.prenom@professeur.mg"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">
                  Mot de passe
                </label>
                <button type="button" className="text-[10px] font-bold text-slate-800 hover:text-indigo-600 transition-colors uppercase">
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all text-slate-800"
                  placeholder="••••••••"
                />
                {/* Bouton Eye Icon pour voir le MDP */}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98]">
              Se connecter
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-slate-500">
              Nouveau à l'EMIT ? <button className="font-bold text-slate-900 hover:underline">Créer un compte</button>
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] font-bold"
            >
              ← Retour au site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;