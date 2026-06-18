// src/components/modals/SettingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Camera, User, Save, XCircle, CheckCircle } from 'lucide-react';

const SettingModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    photoUrl: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        photoUrl: userData.photoUrl || '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setSuccessMessage('');
    }
  }, [isOpen, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Min. 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        photoUrl: formData.photoUrl || null
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Profil mis à jour avec succès !');
      setTimeout(() => {
        onUpdate(updateData);
        onClose();
      }, 1500);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Erreur lors de la mise à jour' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay avec blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="bg-[#F9FAFB] w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-in" style={{ zIndex: 51 }}>
        
        {/* Modal Header */}
        <div className="pt-6 flex justify-between items-start px-5 border-b border-gray-200 pb-5">
          <div>
            <h2 className="font-semibold text-[20px] text-[#0b1c30]">Paramètres du Compte</h2>
            <p className="text-sm text-[#434655] mt-0.5">Mettez à jour vos informations</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#434655] hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col gap-4 px-5 pt-5 pb-2 max-h-[70vh] overflow-y-auto">
          
          {/* Left Column: Form Fields */}
          <div className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0b1c30]">Nom</label>
                <input
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${errors.nom ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg px-3 py-2 text-sm text-[#0b1c30] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm`}
                  type="text"
                  placeholder="Dupont"
                />
                {errors.nom && <p className="text-red-500 text-xs">{errors.nom}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0b1c30]">Prénom</label>
                <input
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${errors.prenom ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg px-3 py-2 text-sm text-[#0b1c30] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm`}
                  type="text"
                  placeholder="Jean"
                />
                {errors.prenom && <p className="text-red-500 text-xs">{errors.prenom}</p>}
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0b1c30]">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg pl-3 pr-9 py-2 text-sm text-[#0b1c30] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0b1c30]">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg pl-3 pr-9 py-2 text-sm text-[#0b1c30] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Right Column: Profile Preview */}
          <div className="border-t border-gray-200 pt-4">
            <div className="rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col items-center p-4 bg-white">
              
              {/* Avatar */}
              <div className="relative group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/10 p-1">
                  {formData.photoUrl ? (
                    <img
                      alt="Profil"
                      className="w-full h-full rounded-full object-cover"
                      src={formData.photoUrl}
                      onError={(e) => {
                        e.target.src = "https://ui-avatars.com/api/?name=" + (formData.prenom + "+" + formData.nom) + "&background=1447dd&color=fff&size=64&bold=true";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={28} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-0.5 -right-0.5 bg-white border border-gray-200 p-1.5 rounded-full shadow-lg hover:bg-gray-50 transition-all group-hover:scale-110">
                  <Camera size={14} className="text-[#0b1c30]" />
                </button>
              </div>
              
              {/* Infos utilisateur */}
              <div className="mt-3 text-center">
                <h4 className="font-semibold text-sm text-[#0b1c30]">
                  {formData.prenom} {formData.nom}
                </h4>
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="mt-3 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-emerald-700 text-xs font-medium">{successMessage}</span>
                </div>
              )}
              {errors.submit && (
                <div className="mt-3 w-full bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
                  <XCircle size={14} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-xs font-medium">{errors.submit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="py-3.5 px-5 border-t border-gray-200 flex justify-end items-center gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#434655] hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: '#0096C7' }}
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Chargement...
              </>
            ) : (
              <>
                <Save size={14} />
                Modifier
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SettingModal;