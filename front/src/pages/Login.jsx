import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-900 overflow-hidden">
      {/* Arrière-plan conservé avec aspect flouté */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/EMIT.jpg" 
          alt="Fond Campus" 
          className="w-full h-full object-cover blur-md scale-105 opacity-50" 
        />
        {/* Overlay pour assombrir légèrement et augmenter le contraste */}
        <div className="absolute inset-0 bg-slate-900/40"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Formulaire avec ombre portée accentuée (shadow-2xl + shadow-black/50) */}
        <div className="bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] p-10 md:p-12 border border-slate-100">
          
          {/* Logo centré */}
          <div className="flex flex-col items-center mb-10">
            <img src="/src/assets/logo.jpg" alt="Logo EMIT" className="h-16 w-auto mb-4" />
            <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">
                email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full px-12 py-4 bg-slate-50 border border-slate-200 rounded-4xl focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400"
                  placeholder="nom.prenom@professeur.mg"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-12 py-4 bg-slate-50 border border-slate-200 rounded-4xl focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all text-slate-800"
                  placeholder="••••••••"
                />
                {/* Bouton Eye Icon pour voir le MDP avec Lucide React */}
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button type="button" className="text-[12px] font-bold text-slate-800 hover:text-indigo-600 transition-colors">
              <a href="/verify">Mot de passe oublié ?</a>
            </button>

            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-4xl hover:bg-black transition-all shadow-lg active:scale-[0.98]">
              Se connecter
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-slate-500">
              Vous n'avez pas de compte ?  
              <a href="/inscription">
                <button className="font-bold text-brand-blue hover:underline ml-1">Créer un compte</button>
              </a>
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] font-bold"
            >
              ← Retour 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;