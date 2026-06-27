// src/pages/InscriptionProfesseur.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, FileText, 
  CheckCircle, ArrowLeft, ArrowRight, UserCheck, 
  Shield, Sparkles, Building, Calendar, Award,
  Users, IdCard   // ✅ Ajout de l'icône IdCard pour le numéro IM
} from 'lucide-react';
import api from './../services/api';
import AOS from 'aos';
import 'aos/dist/aos.css';

// ===== COMPOSANTS SHADCN STYLE =====
const Button = ({ children, type = 'button', disabled, className = '', variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg',
    outline: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    ghost: 'text-blue-500 hover:text-blue-700 hover:bg-blue-50',
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', icon: Icon, error, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
    )}
    <input
      className={`w-full pl-11 pr-4 py-3 bg-gray-50/80 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 text-sm ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'} ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
);

// ===== PAGE INSCRIPTION =====
const InscriptionProfesseur = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: 'Pr',
    firstName: '',
    // ❌ lastName supprimé
    imNumber: '',          // ✅ Le numéro IM remplace le nom
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 50,
      delay: 100,
    });
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const validateName = (value) => {
    if (!value) return '';
    if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) {
      return 'Le prénom ne doit contenir que des lettres';
    }
    return '';
  };

  const validateImNumber = (value) => {
    if (!value) return '';
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length === 0) return '';
    if (numbersOnly.length < 6) return '6 chiffres requis';
    if (numbersOnly.length > 6) return '6 chiffres maximum';
    return '';
  };

  const validatePhone = (value) => {
    if (!value) return '';
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length === 0) return '';
    if (numbersOnly.length !== 10) return '10 chiffres requis';
    if (!numbersOnly.startsWith('02') && !numbersOnly.startsWith('03')) {
      return 'Commence par 02 ou 03';
    }
    return '';
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.imNumber.trim()) newErrors.imNumber = 'Le numéro IM est requis';
    else {
      const imError = validateImNumber(formData.imNumber);
      if (imError) newErrors.imNumber = imError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    else {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length !== 10) newErrors.phone = '10 chiffres requis';
      else if (!phoneNumbers.startsWith('02') && !phoneNumbers.startsWith('03')) {
        newErrors.phone = 'Commence par 02 ou 03';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = '8 caractères minimum';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    else if (name === 'firstName') {
      const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
      const nameError = validateName(filteredValue);
      setErrors(prev => ({ ...prev, [name]: nameError }));
    }
    else if (name === 'imNumber') {
      const numbersOnly = value.replace(/\D/g, '');
      const limitedValue = numbersOnly.slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
      const imError = validateImNumber(limitedValue);
      setErrors(prev => ({ ...prev, imNumber: imError }));
    }
    else if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, '');
      const limitedValue = numbersOnly.slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
      const phoneError = validatePhone(limitedValue);
      setErrors(prev => ({ ...prev, phone: phoneError }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getErrorMessage = (error) => {
    const serverMessage = 
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.title ||
      error.message;
    
    if (serverMessage) {
      const msg = serverMessage.toLowerCase();
      
      if (msg.includes('email') && (msg.includes('existe') || msg.includes('déjà') || msg.includes('already'))) {
        return 'Cet email est déjà utilisé. Veuillez en utiliser un autre.';
      }
      
      if ((msg.includes('im') || msg.includes('im_number')) && (msg.includes('existe') || msg.includes('déjà') || msg.includes('already'))) {
        return 'Ce numéro IM est déjà enregistré.';
      }
      
      if ((msg.includes('téléphone') || msg.includes('phone')) && (msg.includes('existe') || msg.includes('déjà') || msg.includes('already'))) {
        return 'Ce numéro de téléphone est déjà utilisé.';
      }
      
      return `${serverMessage}`;
    }
    
    switch (error.response?.status) {
      case 400: return 'Les informations fournies ne sont pas valides.';
      case 409: return 'Ces informations sont déjà utilisées.';
      case 500: return 'Erreur technique. Veuillez réessayer.';
      default: return 'Une erreur est survenue.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    
    setIsSubmitting(true);
    try {
      const data = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: '', // ✅ Le nom est vide car remplacé par IM
        imNumber: formData.imNumber,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };
      
      await api.inscription.inscrireProfesseur(data);
      
      showNotification('Félicitations ! Votre compte a été créé avec succès.', 'success');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      const userMessage = getErrorMessage(error);
      showNotification(userMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const steps = [
    { id: 1, label: 'Identité', icon: User, description: 'Prénom et numéro IM' },
    { id: 2, label: 'Contact', icon: Mail, description: 'Email et téléphone' },
    { id: 3, label: 'Sécurité', icon: Shield, description: 'Mot de passe sécurisé' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-sky-100 via-sky-50 to-sky-100">
      {/* Image de fond */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/gb.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          } min-w-[280px] max-w-md`}>
            <span className="text-lg">{notification.type === 'success' ? '✓' : '✗'}</span>
            <p className="text-sm font-medium flex-1">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bouton Retour */}
      <button 
        onClick={handleGoBack}
        className="fixed top-8 left-8 w-10 h-10 bg-white/90 backdrop-blur-sm text-slate-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:text-blue-500 transition-all duration-200 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Carte d'inscription */}
      <div 
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 relative z-10"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        
        {/* ===== PARTIE GAUCHE - IMAGE EMIT ===== */}
        <div 
          className="hidden lg:flex flex-col items-center justify-center relative min-h-[600px] bg-gradient-to-br from-blue-600 to-blue-800"
          data-aos="fade-right"
          data-aos-delay="200"
        >
          <div className="absolute inset-0">
            <img 
              src="/src/assets/EMIT.jpg" 
              alt="EMIT Campus" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-blue-600/20"></div>
          </div>
          
          <div className="relative z-10 text-center text-white p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Créez votre compte
            </h2>
            <p className="text-white/80 text-sm max-w-sm mx-auto">
              Remplissez ce formulaire pour créer votre compte académique
            </p>
          </div>
        </div>

        {/* ===== PARTIE DROITE - FORMULAIRE ===== */}
        <div 
          className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center min-h-[500px] lg:min-h-[600px]"
          data-aos="fade-left"
          data-aos-delay="300"
        >
          {/* Titre mobile */}
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Créer votre compte</h1>
            <p className="text-gray-500 text-sm mt-1">Remplissez le formulaire pour créer votre compte académique</p>
          </div>

          {/* Stepper horizontal */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        step >= s.id 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                    </div>
                    <span className={`text-[10px] font-medium mt-1.5 ${
                      step >= s.id ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      step > s.id ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Titre du formulaire - visible sur desktop */}
          <div className="hidden lg:block text-center mb-6">
            <p className="text-sm text-gray-500">
              Remplissez ce formulaire pour créer votre compte académique
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* STEP 1: Identité */}
            <div className={`space-y-4 ${step !== 1 ? 'hidden' : ''}`}>
              <div data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nom et prénom
                </label>
                <div className="relative flex">
                  <select 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="bg-gray-50/80 border border-gray-200 rounded-l-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all border-r-0 min-w-[70px]"
                  >
                    <option value="Pr">Pr</option>
                    <option value="Dr">Dr</option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                  <input
                    name="firstName"
                    placeholder="Votre Nom et prénom"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 text-sm ${errors.firstName ? 'border-red-300 focus:ring-red-400' : ''}`}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>}
              </div>

              {/* ✅ Champ Numéro IM (remplace "Nom") avec icône IdCard */}
              <div data-aos="fade-up" data-aos-delay="500">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Numéro IM
                </label>
                <Input
                  name="imNumber"
                  placeholder="ex: 123456"
                  value={formData.imNumber}
                  onChange={handleChange}
                  icon={IdCard}          // ✅ Icône carte
                  error={errors.imNumber}
                  maxLength={6}
                />
                {formData.imNumber && !errors.imNumber && formData.imNumber.length === 6 && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Numéro valide
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-end" data-aos="fade-up" data-aos-delay="600">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-3xl"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* STEP 2: Contact */}
            <div className={`space-y-4 ${step !== 2 ? 'hidden' : ''}`}>
              {/* ❌ Suppression du champ IM (déjà déplacé à l'étape 1) */}

              <div data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="prof@univ-emit.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  error={errors.email}
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="500">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Téléphone
                </label>
                <Input
                  name="phone"
                  placeholder="02 12 34 56 78"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={Phone}
                  error={errors.phone}
                  maxLength={10}
                />
                {formData.phone && !errors.phone && formData.phone.length === 10 && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Numéro valide
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-between" data-aos="fade-up" data-aos-delay="600">
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  variant="outline"
                  className="px-6 py-3.5 rounded-2xl"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Précédent
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-2xl"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* STEP 3: Sécurité */}
            <div className={`space-y-4 ${step !== 3 ? 'hidden' : ''}`}>
              <div data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    error={errors.password}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">8 caractères minimum</p>
              </div>

              <div data-aos="fade-up" data-aos-delay="500">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirmation
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={Lock}
                    error={errors.confirmPassword}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="600">
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  variant="outline"
                  className="py-3.5 rounded-2xl"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Précédent
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3.5 rounded-2xl"
                >
                  {isSubmitting ? 'Inscription...' : "S'inscrire"}
                </Button>
              </div>
            </div>

            {/* Footer Link */}
            <div 
              className="text-center pt-4"
              data-aos="fade-up"
              data-aos-delay="700"
            >
              <p className="text-sm text-gray-500">
                Vous avez déjà un compte ? 
                <a className="text-blue-500 font-semibold hover:underline ml-1" href="/login">Se connecter</a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -100%); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default InscriptionProfesseur;