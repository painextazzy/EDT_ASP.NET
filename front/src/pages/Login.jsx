// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

// ===== COMPOSANTS SHADCN STYLE =====
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
    {Icon && (
      <Icon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
    )}
    <input
      className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 text-sm sm:text-base ${className}`}
      {...props}
    />
  </div>
);

const Checkbox = ({ className = '', ...props }) => (
  <input
    type="checkbox"
    className={`w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-400 focus:ring-2 ${className}`}
    {...props}
  />
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
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-sky-100 via-sky-50 to-sky-100">
      {/* Image de fond en arrière-plan */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/gb.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 relative z-10">
        
        {/* ===== PARTIE GAUCHE - IMAGE ===== */}
        <div className="hidden lg:block relative min-h-[600px]">
          <img 
            src="/src/assets/EMIT.jpg" 
            alt="EMIT Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* ===== PARTIE DROITE - FORMULAIRE ===== */}
        <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-center min-h-[500px] lg:min-h-[600px]">
          {/* Titre */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Bienvenue
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                placeholder="nom.prenom@professeur.mg"
                required
              />
            </div>

            {/* Mot de passe */}
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
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  placeholder="••••••••"
                  required
                  className="pr-9 sm:pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
            

            {/* Terms */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-500 cursor-pointer">
                En vous connectant, vous acceptez les 
                <a href="#" className="text-blue-500 hover:text-blue-700 ml-1">Conditions d'utilisation</a>
                {' '}et la{' '}
                <a href="#" className="text-blue-500 hover:text-blue-700">Politique de confidentialité</a>
              </label>
            </div>

            {/* Bouton de connexion - Réduit de 50% en largeur, sans icône, couleur unie */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isLoading}
                 className="bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg px-12 py-3.5 text-lg rounded-3xl w-auto min-w-[220px]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>

            {/* Lien d'inscription */}
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