// src/components/VerifyEmail.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, Mail, ArrowLeft, Send, ShieldCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Appel API pour envoyer le code
      // const response = await api.auth.sendVerificationCode({ email });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSent(true);
      
      setTimeout(() => {
        navigate('/verify-code', { state: { email } });
      }, 1500);
    } catch (error) {
      setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#d2d9f4] flex flex-col items-center justify-center transition-colors duration-300 relative">
      {/* Background Decorative Element (Atmospheric) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#004cca] opacity-5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-[#505f76] opacity-5 blur-[100px] rounded-full"></div>
      </div>

      <main className="flex-grow flex items-center justify-center w-full px-6 py-8">
        {/* Verification Card */}
        <div className="bg-white w-full max-w-[480px] rounded-lg card-shadow p-6 md:p-10 flex flex-col items-center text-center relative overflow-hidden border border-[#c2c6d9] shadow-lg">
          {/* Secure Glow Header */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#004cca] to-transparent opacity-30"></div>
          
          {/* Icon Header */}
          <div className="mb-6 p-4 bg-[#dbe1ff] rounded-full inline-flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <MailCheck className="w-10 h-10 text-[#004cca]" strokeWidth={1.5} />
          </div>
          
          {/* Content */}
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-semibold text-[#131b2e]">
              Vérification de l'adresse e-mail
            </h1>
            <p className="text-base text-[#424656] max-w-[340px] mx-auto">
              Veuillez saisir votre adresse e-mail pour recevoir votre code de vérification.
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {sent && (
            <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2 justify-center">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Code envoyé avec succès !</span>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="relative group focus-glow rounded-lg transition-all duration-200">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-[#737687] group-focus-within:text-[#004cca] transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full h-14 pl-12 pr-4 bg-[#faf8ff] border border-[#c2c6d9] focus:border-[#004cca] focus:ring-0 rounded-lg font-body-md text-[#131b2e] placeholder:text-[#737687] transition-all duration-200 outline-none"
                placeholder="nom@exemple.com"
                required
                disabled={loading}
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 order-2 sm:order-1 h-12 px-6 rounded-lg font-medium text-sm text-[#424656] hover:bg-[#dae2fd]/50 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 border border-[#c2c6d9]"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 order-1 sm:order-2 h-12 px-6 bg-[#004cca] hover:bg-[#0062ff] text-white rounded-lg font-medium text-sm shadow-lg shadow-[#004cca]/20 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi...
                  </>
                ) : sent ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Code envoyé
                  </>
                ) : (
                  <>
                    Envoyer le code
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Small Trust Indicator */}
          <div className="mt-6 pt-4 border-t border-[#c2c6d9] w-full flex items-center justify-center gap-2 opacity-60">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide">Transaction sécurisée SSL</span>
          </div>
        </div>
      </main>

      <style>{`
        .card-shadow {
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);
        }
        .focus-glow:focus-within {
          box-shadow: 0 0 0 4px rgba(0, 83, 218, 0.1);
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;