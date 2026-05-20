// InscriptionProfesseur.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import de votre logo/image (remplacez par le chemin de votre image)
import logo from '../assets/logo.jpg';

const InscriptionProfesseur = () => {
  const navigate = useNavigate();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: 'Pr',
    firstName: '',
    imNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  // État des erreurs
  const [errors, setErrors] = useState({});
  // État des champs touchés
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Fonction de validation pour un champ spécifique
  const validateField = (name, value, allData = formData) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Le nom complet est requis';
        if (value.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères';
        if (value.trim().length > 50) return 'Le nom est trop long';
        return '';
        
      case 'imNumber':
        if (!value.trim()) return 'Le numéro IM est requis';
        if (!/^IM-\d{6}$/.test(value) && !/^\d{6}$/.test(value)) {
          return 'Format: IM-123456 ou 123456';
        }
        return '';
        
      case 'email':
        if (!value.trim()) return 'L\'email est requis';
        if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(value)) {
          return 'Email invalide (ex: nom@domaine.com)';
        }
        return '';
        
      case 'phone':
        if (!value.trim()) return 'Le numéro de téléphone est requis';
        // Supprimer tous les espaces et caractères spéciaux pour la validation
        const cleanPhone = value.replace(/[\s.-]/g, '');
        
        // Vérifier que c'est bien 10 chiffres
        if (!/^\d{10}$/.test(cleanPhone)) {
          return 'Le numéro doit contenir exactement 10 chiffres';
        }
        
        // Vérifier que le numéro commence par 02 ou 03
        if (!cleanPhone.startsWith('02') && !cleanPhone.startsWith('03')) {
          return 'Le numéro doit commencer par 02 ou 03 (ex: 02xxxxxx ou 03xxxxxx)';
        }
        
        return '';
        
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/(?=.*[a-z])/.test(value)) return 'Doit contenir au moins une minuscule';
        if (!/(?=.*[A-Z])/.test(value)) return 'Doit contenir au moins une majuscule';
        if (!/(?=.*[0-9])/.test(value)) return 'Doit contenir au moins un chiffre';
        return '';
        
      case 'confirmPassword':
        if (!value) return 'Veuillez confirmer le mot de passe';
        if (value !== allData.password) return 'Les mots de passe ne correspondent pas';
        return '';
        
      default:
        return '';
    }
  };
  
  // Validation de tout le formulaire
  const validateForm = (data = formData) => {
    const newErrors = {};
    const fields = ['firstName', 'imNumber', 'email', 'phone', 'password', 'confirmPassword'];
    
    fields.forEach(field => {
      const error = validateField(field, data[field], data);
      if (error) newErrors[field] = error;
    });
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Validation en temps réel
  useEffect(() => {
    const newErrors = {};
    const fields = ['firstName', 'imNumber', 'email', 'phone', 'password', 'confirmPassword'];
    
    fields.forEach(field => {
      if (touched[field]) {
        const error = validateField(field, formData[field], formData);
        if (error) newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    
    // Vérifier si le formulaire est valide
    const isValid = validateForm(formData);
    setIsFormValid(isValid);
  }, [formData, touched]);
  
  // Gestionnaire de changement avec formatage automatique du téléphone
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Supprimer tout ce qui n'est pas un chiffre
      let cleaned = value.replace(/\D/g, '');
      
      // Limiter à 10 chiffres
      if (cleaned.length > 10) {
        cleaned = cleaned.slice(0, 10);
      }
      
      // Formater automatiquement (optionnel: pour afficher en format 02 xx xx xx xx)
      let formatted = cleaned;
      if (cleaned.length >= 2 && cleaned.length <= 10) {
        // Vous pouvez décommenter pour un formatage automatique
        // formatted = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5').trim();
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Gestionnaire de focus (marquer le champ comme touché)
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };
  
  // Gestionnaire de soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    const allFields = ['firstName', 'imNumber', 'email', 'phone', 'password', 'confirmPassword'];
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
    
    // Valider tous les champs
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler l'envoi à une API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Données soumises:', formData);
      alert('Inscription réussie !');
      navigate('/login');
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gestionnaire de retour
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Fonction pour afficher la force du mot de passe
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    
    const strengthMap = {
      1: { text: 'Faible', color: 'text-red-500', bg: 'bg-red-100' },
      2: { text: 'Moyen', color: 'text-orange-500', bg: 'bg-orange-100' },
      3: { text: 'Fort', color: 'text-yellow-500', bg: 'bg-yellow-100' },
      4: { text: 'Très fort', color: 'text-green-500', bg: 'bg-green-100' }
    };
    
    return strengthMap[strength] || { text: 'Faible', color: 'text-red-500', bg: 'bg-red-100' };
  };
  
  const passwordStrength = getPasswordStrength();
  
  return (
    <div className="font-sans antialiased text-slate-800">
      {/* Bouton Retour */}
      <button 
        onClick={handleGoBack}
        aria-label="Retour" 
        className="fixed top-8 left-8 w-12 h-12 bg-white text-slate-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:text-brand-blue transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 z-50"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      
      {/* BEGIN: RegistrationCard */}
      <main className="w-full bg-white main-card rounded-3xl md:rounded-4xl p-8 relative max-w-xl md:p-10 shadow-2xl" data-purpose="registration-form-container">
        {/* HeaderSection avec logo/image */}
        <header className="mb-8 text-center" data-purpose="form-header">
          <div className="mb-6 flex justify-center">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Inscription Professeur</h1>
          <p className="text-slate-500">Remplissez les détails ci-dessous pour créer votre compte académique.</p>
        </header>
        
        {/* FormSection */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Row 1: Titre + Nom complet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="title">
                Nom
              </label>
              <div className="relative flex items-center">
                <div className={`flex w-full rounded-xl border ${errors.firstName && touched.firstName ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-brand-blue transition-all`}>
                  <select 
                    className="bg-transparent border-none text-sm font-semibold text-slate-700 pr-2 focus:ring-0 focus:outline-none cursor-pointer border-r border-slate-200 pl-4 py-3" 
                    name="title" 
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                  >
                    <option value="Pr">Pr</option>
                    <option value="Dr">Dr</option>
                    <option value="M.">Mr</option>
                    <option value="Mme">Mme</option>
                  </select>
                  <input 
                    className="w-full px-3 py-3 bg-transparent border-none text-sm focus:ring-0 focus:outline-none outline-none" 
                    id="firstName" 
                    name="firstName" 
                    placeholder="Ex: Jean Dupont" 
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="name"
                  />
                </div>
              </div>
              {errors.firstName && touched.firstName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.firstName}
                </p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="imNumber">
                Numéro IM
              </label>
              <input 
                className={`w-full px-4 py-3 rounded-xl border ${errors.imNumber && touched.imNumber ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none pl-4`} 
                id="imNumber" 
                name="imNumber" 
                placeholder="Ex: IM-123456" 
                type="text"
                value={formData.imNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
              {errors.imNumber && touched.imNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.imNumber}
                </p>
              )}
            </div>
          </div>
          
          {/* Row 2: Email & Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                Email professionnel
              </label>
              <input 
                className={`w-full px-4 py-3 rounded-xl border ${errors.email && touched.email ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none pl-4`} 
                id="email" 
                name="email" 
                placeholder="prof@univ-emit.com" 
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="phone">
                Numéro de Téléphone
              </label>
              <input 
                className={`w-full px-4 py-3 rounded-xl border ${errors.phone && touched.phone ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none pl-4`} 
                id="phone" 
                name="phone" 
                placeholder="02xxxxxxxx ou 03xxxxxxxx" 
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="tel"
                maxLength="10"
                inputMode="numeric"
              />
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.phone}
                </p>
              )}
              {formData.phone && !errors.phone && touched.phone && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Numéro valide (02 ou 03 suivi de 8 chiffres)
                </p>
              )}
              {/* Indication des règles */}
              {!touched.phone && (
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  Doit commencer par 02 ou 03 et contenir 10 chiffres
                </p>
              )}
            </div>
          </div>
          
          {/* Row 3: Mot de passe & Confirmation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                Mot de passe
              </label>
              <input 
                className={`w-full px-4 py-3 rounded-xl border ${errors.password && touched.password ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none pl-4`} 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.password}
                </p>
              )}
              {formData.password && !errors.password && touched.password && (
                <>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Force du mot de passe:</span>
                      <span className={`text-xs font-semibold ${passwordStrength?.color}`}>
                        {passwordStrength?.text}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength?.text === 'Très fort' ? 'w-full bg-green-500' :
                          passwordStrength?.text === 'Fort' ? 'w-3/4 bg-green-400' :
                          passwordStrength?.text === 'Moyen' ? 'w-1/2 bg-yellow-500' :
                          'w-1/4 bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <ul className="text-xs text-slate-500 mt-2 space-y-0.5">
                    <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                      ✓ Au moins 8 caractères
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? "text-green-600" : ""}>
                      ✓ Au moins une minuscule
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                      ✓ Au moins une majuscule
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                      ✓ Au moins un chiffre
                    </li>
                  </ul>
                </>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                Confirmation du mot de passe
              </label>
              <input 
                className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-slate-200'} bg-slate-50/50 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none pl-4`} 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {errors.confirmPassword}
                </p>
              )}
              {formData.confirmPassword && !errors.confirmPassword && touched.confirmPassword && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Mots de passe identiques
                </p>
              )}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button 
              className={`w-full py-4 text-white font-bold rounded-xl shadow-md shadow-blue-200 transition-all duration-200 active:scale-[0.98] ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              style={{ backgroundColor: '#3ba7d6' }}
              type="submit"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription en cours...
                </span>
              ) : "S'inscrire"}
            </button>
          </div>
          
          {/* Footer Link */}
          <div className="text-right pt-4">
            <p className="text-sm text-slate-500">
              Vous avez déjà un compte ? 
              <a className="text-brand-blue font-semibold hover:underline ml-1" href="/login">Connexion</a>
            </p>
          </div>
        </form>
      </main>
      
      <style>{`
        body {
          background: linear-gradient(135deg, #7ec9f5 0%, #ffffff 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          margin: 0;
        }
        .main-card {
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15);
          border-radius: 2rem;
        }
        /* Pour les très grands écrans */
        @media (min-width: 768px) {
          .main-card {
            border-radius: 2.5rem;
          }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          transition: background-color 600000s 0s, color 600000s 0s;
        }
      `}</style>
    </div>
  );
};

export default InscriptionProfesseur;