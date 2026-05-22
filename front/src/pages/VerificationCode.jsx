import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import de l'image locale
import backgroundImage from '../assets/EMIT.jpg';

const VerificationCode = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Email de vérification envoyé à:', email);
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(8px)',
          transform: 'scale(1.05)'
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Verification Modal */}
      <main className="relative z-10 bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-black/20 p-8 md:p-12 text-center">
        <header className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-brand text-3xl">mail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Entrez votre e-mail</h1>
          <p className="text-slate-500 text-sm">Entrez l'adresse e-mail associée à votre compte.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8" id="otp-form">
          <div className="relative flex items-center group">
            <span className="material-symbols-outlined absolute left-4 text-slate-400 group-focus-within:text-brand transition-colors">
              mail
            </span>
            <input 
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl bg-slate-50 focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all text-slate-700 font-medium placeholder:text-slate-400 outline-none ${
                error ? 'border-red-500 focus:border-red-500' : 'border-slate-100'
              }`}
              id="email-input" 
              placeholder="nom@exemple.com" 
              required 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-left -mt-4">{error}</p>}

          <div className="flex gap-4 flex-row mt-8">
            <button 
              type="button"
              onClick={handleCancel}
              className="w-full border border-slate-200 bg-white text-slate-700 font-semibold py-4 rounded-2xl transition-colors hover:bg-slate-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-4 rounded-2xl transition-colors shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0ea5e9' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Envoi...</span>
                </div>
              ) : (
                'Suivant'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default VerificationCode;