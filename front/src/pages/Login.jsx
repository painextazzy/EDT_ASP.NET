// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import authApi, { validateTokenFormat } from '../services/auth';

// ===== COMPOSANT TOAST NOTIFICATION =====
const ToastNotification = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 400);
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
    }
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border ${style.bg} ${style.border} ${style.text} min-w-[320px] max-w-md`}>
        {style.icon}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button 
          onClick={() => { setIsVisible(false); if (onClose) setTimeout(onClose, 400); }}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ===== COMPOSANTS UI =====
const Button = ({ children, type = 'button', disabled, className = '', ...props }) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = '', icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
    <input
      className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 text-sm sm:text-base ${className}`}
      {...props}
    />
  </div>
);

const Checkbox = ({ className = '', ...props }) => (
  <input type="checkbox" className={`w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-400 focus:ring-2 ${className}`} {...props} />
);

const Label = ({ children, className = '', ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${className}`} {...props}>
    {children}
  </label>
);

// ===== PAGE LOGIN =====
const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [toast, setToast] = useState(null);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    
    if (authApi.isAuthenticated()) {
      const user = authApi.getUser();
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'ENSEIGNANT') navigate('/enseignant');
      else navigate('/login');
    }
  }, [navigate]);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const clearToast = () => {
    setToast(null);
  };

  const validateEmail = (value) => {
    const trimmed = value.replace(/\s/g, '');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Format d\'email invalide (ex: nom@domaine.com)');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const cleaned = e.target.value.replace(/\s/g, '');
    setEmail(cleaned);
    if (cleaned) validateEmail(cleaned);
    else setEmailError('');
    clearToast();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    clearToast();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearToast();

    if (!acceptedTerms) {
      showToast('error', 'Vous devez accepter les conditions d\'utilisation pour vous connecter');
      return;
    }

    if (!email) {
      showToast('error', 'Veuillez saisir votre email');
      return;
    }
    if (!validateEmail(email)) {
      showToast('error', emailError || 'Email invalide');
      return;
    }
    if (!password) {
      showToast('error', 'Veuillez saisir votre mot de passe');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Erreur serveur');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Erreur lors de la connexion');
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Email ou mot de passe incorrect');
      }

      const token = data.data.token;
      if (!validateTokenFormat(token)) {
        throw new Error('Token invalide');
      }
      localStorage.setItem('jwt_token', token);

      const userData = {
        id: data.data.userId,
        email: data.data.email,
        role: data.data.role,
        estValide: data.data.estValide,
        nom: data.data.nom || data.data.email?.split('@')[0] || 'Utilisateur',
        photoUrl: data.data.photoUrl || null,
      };
      localStorage.setItem('user_data', JSON.stringify(userData));

      showToast('success', 'Connexion réussie. Redirection...');

      setTimeout(() => {
        if (userData.role === 'ADMIN') navigate('/admin');
        else if (userData.role === 'ENSEIGNANT') navigate('/enseignant');
        else navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('❌ Erreur login:', error);
      const errorMsg = error.message || 'Email ou mot de passe incorrect';
      let displayMsg = errorMsg;
      let toastType = 'error';

      if (errorMsg.includes('non validé') || errorMsg.includes('validé')) {
        const now = new Date();
        const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        displayMsg = `Tentative à ${heure} : Votre compte n'est pas encore validé par l'administrateur. Vous recevrez un email dès que votre compte sera validé.`;
        toastType = 'warning';
      } else if (errorMsg === 'SESSION_EXPIRED') {
        displayMsg = 'Session expirée, veuillez vous reconnecter';
      }

      showToast(toastType, displayMsg);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-sky-100 via-sky-50 to-sky-100">
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={clearToast}
        />
      )}

      <div className="absolute inset-0 z-0">
        <img src="/src/assets/gb.jpg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 relative z-10">
        <div className="hidden lg:block relative min-h-[600px]">
          <img src="/src/assets/EMIT.jpg" alt="EMIT Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-center min-h-[500px] lg:min-h-[600px]">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Bienvenue</h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">Connectez-vous pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                icon={Mail}
                placeholder="nom.prenom@professeur.mg"
                required
                className={emailError ? 'border-red-500 focus:ring-red-400' : ''}
                autoComplete="email"
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <button 
                  type="button"
                  onClick={() => navigate('/verify-email')}
                  className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  icon={Lock}
                  placeholder="••••••••"
                  required
                  className="pr-9 sm:pr-12"
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* ✅ Conditions d'utilisation - obligatoire */}
            <div className="flex items-start gap-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms} 
                onChange={(e) => setAcceptedTerms(e.target.checked)} 
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                J'accepte les{' '}
                <a href="#" className="text-blue-500 hover:text-blue-700 font-medium">Conditions d'utilisation</a>
                {' '}et la{' '}
                <a href="#" className="text-blue-500 hover:text-blue-700 font-medium">Politique de confidentialité</a>
                {' '}<span className="text-red-500">*</span>
              </label>
            </div>

            {/* ❌ "Se souvenir de moi" supprimé */}

            <div className="flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg px-12 py-4 text-lg rounded-full w-full max-w-[320px] transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </>
                ) : "Se connecter"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Vous n'avez pas de compte ? 
                <button 
                  type="button"
                  onClick={() => navigate('/inscription')}
                  className="text-blue-500 hover:text-blue-700 font-semibold ml-1.5 transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;