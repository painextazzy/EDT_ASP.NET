import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InscriptionProfesseur = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: 'Pr',
    firstName: '',
    imNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation en temps réel pour le nom (lettres uniquement)
  const validateName = (value) => {
    if (!value) return '';
    // Vérifier que le nom contient uniquement des lettres, espaces et tirets
    if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) {
      return 'Le nom ne doit contenir que des lettres, espaces et tirets';
    }
    return '';
  };

  // Validation en temps réel pour le numéro IM (6 chiffres)
  const validateImNumber = (value) => {
    if (!value) return '';
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length === 0) return '';
    if (numbersOnly.length < 6) return 'Le numéro IM doit contenir exactement 6 chiffres';
    if (numbersOnly.length > 6) return 'Le numéro IM ne peut pas dépasser 6 chiffres';
    return '';
  };

  // Validation en temps réel pour le téléphone (10 chiffres, commence par 02 ou 03)
  const validatePhone = (value) => {
    if (!value) return '';
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length === 0) return '';
    if (numbersOnly.length !== 10) return 'Le numéro doit contenir exactement 10 chiffres';
    if (!numbersOnly.startsWith('02') && !numbersOnly.startsWith('03')) {
      return 'Le numéro doit commencer par 02 ou 03';
    }
    return '';
  };

  // Validation de l'étape 1
  const validateStep1 = () => {
    const newErrors = {};
    
    // Validation nom
    if (!formData.firstName.trim()) newErrors.firstName = 'Le nom complet est requis';
    else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'Le nom ne doit contenir que des lettres, espaces et tirets';
    }
    
    // Validation IM
    if (!formData.imNumber.trim()) newErrors.imNumber = 'Le numéro IM est requis';
    else if (formData.imNumber.replace(/\D/g, '').length !== 6) {
      newErrors.imNumber = 'Le numéro IM doit contenir exactement 6 chiffres';
    }
    
    // Validation email
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    // Validation téléphone
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    else {
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length !== 10) newErrors.phone = 'Le numéro doit contenir exactement 10 chiffres';
      else if (!phoneNumbers.startsWith('02') && !phoneNumbers.startsWith('03')) {
        newErrors.phone = 'Le numéro doit commencer par 02 ou 03';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation de l'étape 2
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = '8 caractères minimum';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Contrôle pour le nom (lettres uniquement)
    if (name === 'firstName') {
      // Autorise les lettres, accents, espaces et tirets
      const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
      const nameError = validateName(filteredValue);
      setErrors(prev => ({ ...prev, firstName: nameError }));
    }
    // Contrôle pour le numéro IM (chiffres uniquement)
    else if (name === 'imNumber') {
      const numbersOnly = value.replace(/\D/g, '');
      const limitedValue = numbersOnly.slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
      const imError = validateImNumber(limitedValue);
      setErrors(prev => ({ ...prev, imNumber: imError }));
    }
    // Contrôle pour le téléphone (chiffres uniquement, format 02/03)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Inscription:', formData);
      alert('Inscription réussie !');
      navigate('/login');
    } catch (error) {
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Formatage d'affichage du téléphone
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 10) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
    }
    return phone;
  };

  return (
    <div className="font-sans antialiased text-slate-800">
      {/* Bouton Retour */}
      <button 
        onClick={handleGoBack}
        aria-label="Retour" 
        className="fixed top-8 left-8 w-10 h-10 bg-white text-slate-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:text-brand-blue transition-all duration-200 focus:outline-none z-50"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      {/* Registration Card */}
      <main className="bg-white main-card rounded-3xl md:rounded-4xl overflow-hidden relative max-w-[580px] w-full mx-auto" style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)', borderRadius: '2rem' }}>
        {/* Stepper Header */}
        <div className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex items-start justify-between max-w-sm mx-auto">
            <div className="flex flex-col items-center">
              <div 
                className={`step-dot w-9 h-9 rounded-full flex items-center justify-center font-semibold transition-all z-10 ${
                  step === 1 
                    ? 'bg-sky-500 text-white' 
                    : step > 1 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {step > 1 ? <span className="material-symbols-outlined text-lg">check</span> : '1'}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                step === 1 ? 'text-slate-500' : 'text-slate-400'
              }`}>Information</span>
            </div>
            <div className="stepper-line h-[2px] bg-slate-200 flex-grow mx-2.5 relative top-[18px]"></div>
            <div className="flex flex-col items-center">
              <div 
                className={`step-dot w-9 h-9 rounded-full flex items-center justify-center font-semibold transition-all z-10 ${
                  step === 2 
                    ? 'bg-sky-500 text-white' 
                    : step > 2 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                2
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                step === 2 ? 'text-slate-500' : 'text-slate-400'
              }`}>Sécurité</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <header className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {step === 1 ? 'Informations de base' : 'Sécurité du compte'}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 1 
                ? 'Remplissez les détails pour créer votre compte académique.' 
                : 'Définissez votre mot de passe pour sécuriser votre accès.'}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Information */}
            <div className={`space-y-5 ${step !== 1 ? 'hidden' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Nom complet</label>
                  <div className="relative flex items-center">
                    <div className="flex w-full rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:border-brand-blue transition-all">
                      <select 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="bg-transparent border-none text-xs font-semibold text-slate-700 pr-2 focus:ring-0 cursor-pointer border-r border-slate-200 pl-3 py-3"
                      >
                        <option value="Pr">Pr</option>
                        <option value="Dr">Dr</option>
                        <option value="M.">M.</option>
                        <option value="Mme">Mme</option>
                      </select>
                      <input 
                        className="w-full px-3 py-3 bg-transparent border-none text-sm focus:ring-0 outline-none" 
                        name="firstName"
                        placeholder="Ex: Jean Dupont" 
                        value={formData.firstName}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Numéro IM</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-brand-blue focus:ring-4 focus:ring-blue-100 ${
                      errors.imNumber ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'
                    }`}
                    name="imNumber"
                    placeholder="123456" 
                    value={formData.imNumber}
                    onChange={handleChange}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  {errors.imNumber && <p className="text-red-500 text-xs mt-1">{errors.imNumber}</p>}
                  {formData.imNumber && !errors.imNumber && formData.imNumber.length === 6 && (
                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Numéro IM valide
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">Format: 6 chiffres (ex: 123456)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Email professionnel</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all focus:border-brand-blue focus:ring-4 focus:ring-blue-100" 
                    name="email"
                    placeholder="prof@univ-emit.com" 
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Numéro de Téléphone</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-brand-blue focus:ring-4 focus:ring-blue-100 ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50/50'
                    }`}
                    name="phone"
                    placeholder="02 12 34 56 78" 
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  {formData.phone && !errors.phone && formData.phone.length === 10 && (
                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Numéro valide ({formData.phone.slice(0,2)} xx xx xx xx)
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">Format: 10 chiffres, commence par 02 ou 03 (ex: 0212345678)</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="py-3.5 text-white font-bold shadow-lg shadow-slate-200 transition-all duration-200 flex items-center justify-center gap-2 bg-sky-400 rounded-xl px-8 hover:bg-sky-500"
                >
                  Étape suivante
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* STEP 2: Sécurité */}
            <div className={`space-y-5 ${step !== 2 ? 'hidden' : ''}`}>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all focus:border-brand-blue focus:ring-4 focus:ring-blue-100" 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                />
                <p className="text-[11px] text-slate-400">Utilisez au moins 8 caractères avec des lettres et chiffres.</p>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Confirmation du mot de passe</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all focus:border-brand-blue focus:ring-4 focus:ring-blue-100" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={handlePrevStep}
                  className="py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all duration-200"
                >
                  Précédent
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3.5 bg-[#001f3c] text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-[#002d56] transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Inscription...' : "S'inscrire"}
                </button>
              </div>
            </div>

            {/* Footer Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-slate-500">
                Vous avez déjà un compte ? 
                <a className="text-brand-blue font-semibold hover:underline ml-1" href="/login">Connexion</a>
              </p>
            </div>
          </form>
        </div>
      </main>

      <style>{`
        .main-card {
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
          max-width: 580px;
          width: 100%;
          border-radius: 2rem;
        }
        .stepper-line {
          height: 2px;
          background-color: #e2e8f0;
          flex-grow: 1;
          margin: 0 10px;
          position: relative;
          top: 18px;
        }
        .step-dot {
          transition: all 0.3s ease;
        }
        input:focus {
          border-color: #1a73e8 !important;
          box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1) !important;
        }
        body {
          background: linear-gradient(135deg, #7ec9f5 0%, #ffffff 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          margin: 0;
        }
        .rounded-xl {
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default InscriptionProfesseur;