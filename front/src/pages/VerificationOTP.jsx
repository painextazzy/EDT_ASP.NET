// src/components/VerificationCode.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, MailCheck, Loader2 } from 'lucide-react';

const VerificationCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/verify-email');
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Auto-submit when all fields are filled
    if (index === 5 && value && newCode.every(d => d)) {
      setTimeout(() => handleSubmit(newCode.join('')), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('');
    const newCode = [...code];
    
    for (let i = 0; i < Math.min(digits.length, 6); i++) {
      if (/^\d$/.test(digits[i])) {
        newCode[i] = digits[i];
      }
    }
    
    setCode(newCode);
    setError('');
    
    const lastFilledIndex = newCode.findIndex(d => !d);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();
    
    if (newCode.every(d => d)) {
      setTimeout(() => handleSubmit(newCode.join('')), 100);
    }
  };

  const handleSubmit = async (verificationCode = code.join('')) => {
    if (verificationCode.length !== 6) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError('Veuillez saisir les 6 chiffres du code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Appel API pour vérifier le code
      // const response = await api.auth.verifyCode({ email, code: verificationCode });
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/reset-password', { state: { email, code: verificationCode } });
      }, 1500);
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError('Code invalide. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60);
    setError('');
    
    try {
      // Appel API pour renvoyer le code
      // await api.auth.resendCode({ email });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      setError('Erreur lors du renvoi du code');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  const handleBack = () => {
    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 md:p-0 relative overflow-hidden">
      {/* Atmospheric Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#dde1ff] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#eaddff] blur-[100px]"></div>
      </div>

      {/* Main Verification Modal */}
      <main className="relative z-10 w-full max-w-[480px]">
        <div className="bg-white border border-[#c4c5d8] shadow-[0px_4px_20px_rgba(0,0,0,0.03)] rounded-2xl p-8 md:p-12 text-center">
          
          {/* Icon Header */}
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-[#3b63f6] rounded-2xl flex items-center justify-center text-white">
              <MailCheck className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Typography Header */}
          <h1 className="text-2xl font-semibold text-[#0b1c30] mb-2">
            Vérification OTP
          </h1>
          <p className="text-sm text-[#434655] mb-8 max-w-[320px] mx-auto">
            Un code de vérification a été envoyé à votre adresse e-mail.
          </p>
          
          {/* OTP Input Group */}
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className={`flex justify-between gap-2 md:gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-[#eff4ff] border border-[#c4c5d8] rounded-lg focus:outline-none focus:border-[#1447dd] focus:ring-2 focus:ring-[#1447dd]/20 transition-all"
                  disabled={loading || success}
                  autoComplete="off"
                  inputMode="numeric"
                />
              ))}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="text-center text-red-500 text-sm -mt-4">
                {error}
              </div>
            )}
            
            {/* Resend Action */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-[#434655]">Vous n'avez pas reçu le code ?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendDisabled}
                className="text-[#1447dd] font-semibold text-base hover:underline cursor-pointer transition-all active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendDisabled ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
              </button>
            </div>
            
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-4 border border-[#c4c5d8] text-[#0b1c30] font-semibold text-base rounded-lg hover:bg-[#dce9ff] transition-colors active:opacity-70"
                disabled={loading}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 px-6 py-4 bg-[#1447dd] text-white font-semibold text-base rounded-lg shadow-sm hover:bg-[#3b63f6] transition-all active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vérification...
                  </div>
                ) : success ? (
                  'Vérifié !'
                ) : (
                  'Vérifier'
                )}
              </button>
            </div>
          </form>
          
          {/* Footer Meta */}
          <div className="mt-12 flex items-center justify-center gap-2 text-[#434655] opacity-60">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Connexion Sécurisée</span>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default VerificationCode;