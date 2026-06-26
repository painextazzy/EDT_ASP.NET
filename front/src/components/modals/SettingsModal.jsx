// src/components/modals/SettingsModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Camera, User, Save, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/auth';
import { API_URL } from '../../services/api';

const SettingsModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    photoUrl: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Fonction pour construire l'URL complète de la photo avec API_URL
  const getFullPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    if (photoUrl.startsWith('/')) {
      return `${API_URL}${photoUrl}`;
    }
    return `${API_URL}/${photoUrl}`;
  };

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        nom: userData.nom || '',
        email: userData.email || '',
        photoUrl: userData.photoUrl || '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setSuccessMessage('');
      setImageError(false);
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

  const updateLocalStorage = (updates) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (e) {
      console.error('❌ Erreur mise à jour localStorage:', e);
      return null;
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, photo: 'Veuillez sélectionner une image' });
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, photo: 'L\'image ne doit pas dépasser 5MB' });
      event.target.value = '';
      return;
    }

    setUploading(true);
    setErrors({});
    setImageError(false);

    try {
      const userDataFromStorage = JSON.parse(localStorage.getItem('user_data') || '{}');
      const userId = userDataFromStorage.id;
      const token = localStorage.getItem('jwt_token');

      if (!userId) {
        throw new Error('ID utilisateur non trouvé. Veuillez vous reconnecter.');
      }

      if (!token) {
        throw new Error('Token manquant. Veuillez vous reconnecter.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/profile/upload-photo?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error('Erreur serveur');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'upload');
      }

      if (data.success) {
        const newPhotoUrl = data.data.photoUrl;
        setFormData(prev => ({ ...prev, photoUrl: newPhotoUrl }));
        setSuccessMessage('Photo mise à jour avec succès !');
        setImageError(false);
        
        updateLocalStorage({ photoUrl: newPhotoUrl, avatar: newPhotoUrl });
        
        if (onUpdate) {
          onUpdate({ photoUrl: newPhotoUrl });
        }

        window.dispatchEvent(new Event('userUpdated'));
      } else {
        setErrors({ photo: data.message || 'Erreur lors de l\'upload' });
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      let errorMessage = 'Erreur lors de l\'upload';
      if (error.message.includes('401') || error.message.includes('SESSION_EXPIRED')) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErrors({ photo: errorMessage });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!formData.photoUrl) return;

    setUploading(true);
    setImageError(false);
    
    try {
      const userDataFromStorage = JSON.parse(localStorage.getItem('user_data') || '{}');
      const userId = userDataFromStorage.id;
      const token = localStorage.getItem('jwt_token');

      if (!userId) {
        throw new Error('ID utilisateur non trouvé');
      }

      if (!token) {
        throw new Error('Token manquant');
      }

      const response = await fetch(`${API_URL}/api/profile/delete-photo?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error('Erreur serveur');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      if (data.success) {
        setFormData(prev => ({ ...prev, photoUrl: '' }));
        setSuccessMessage('Photo supprimée avec succès !');
        
        updateLocalStorage({ photoUrl: null, avatar: null });
        
        if (onUpdate) {
          onUpdate({ photoUrl: null });
        }

        window.dispatchEvent(new Event('userUpdated'));
      } else {
        setErrors({ photo: data.message || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      setErrors({ photo: error.message || 'Erreur réseau' });
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
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
      const userDataFromStorage = JSON.parse(localStorage.getItem('user_data') || '{}');
      const userId = userDataFromStorage.id;

      if (!userId) {
        throw new Error('ID utilisateur non trouvé');
      }

      const updateData = {
        nom: formData.nom,
        email: formData.email
      };
      
      if (formData.password) {
        updateData.currentPassword = formData.password;
        updateData.newPassword = formData.password;
      }
      
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_URL}/api/profile/update?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error('Erreur serveur');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      if (data.success) {
        setSuccessMessage('✅ Profil mis à jour avec succès !');
        
        updateLocalStorage({
          nom: data.data.nom || formData.nom,
          email: data.data.email || formData.email,
          photoUrl: data.data.photoUrl || formData.photoUrl,
          avatar: data.data.photoUrl || formData.photoUrl
        });
        
        if (onUpdate) {
          onUpdate({
            nom: data.data.nom || formData.nom,
            email: data.data.email || formData.email,
            photoUrl: data.data.photoUrl || formData.photoUrl
          });
        }

        window.dispatchEvent(new Event('userUpdated'));
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrors({ submit: data.message || 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setErrors({ submit: error.message || 'Erreur lors de la mise à jour' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    setImageError(true);
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    const fallback = document.createElement('div');
    fallback.className = 'w-full h-full rounded-full bg-gray-200 flex items-center justify-center';
    fallback.innerHTML = `<span class="text-gray-400 text-2xl font-bold">${(formData.nom || 'U').substring(0, 2).toUpperCase()}</span>`;
    parent.appendChild(fallback);
  };

  if (!isOpen) return null;

  const fullPhotoUrl = getFullPhotoUrl(formData.photoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="bg-[#F9FAFB] w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-in" style={{ zIndex: 51 }}>
        
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

        <div className="flex flex-col gap-4 px-5 pt-5 pb-2 max-h-[70vh] overflow-y-auto">
          
          {/* ✅ Champs Nom, Email, Mot de passe conservés */}
          <div className="space-y-4">
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
                <label className="block text-xs font-semibold text-[#0b1c30]">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-[#E5E7EB]'} rounded-lg px-3 py-2 text-sm text-[#0b1c30] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm`}
                  type="email"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
            </div>

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

          {/* ✅ Cardbox Photo - Sans le nom et l'email en bas */}
          <div className="border-t border-gray-200 pt-4">
            <div className="rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col items-center p-4 bg-white">
              
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/10 p-1">
                  {uploading ? (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                  ) : formData.photoUrl ? (
                    <img
                      key={`settings-${Date.now()}`}
                      alt="Profil"
                      className="w-full h-full rounded-full object-cover"
                      src={fullPhotoUrl}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-0.5 -right-0.5 bg-white border border-gray-200 p-1.5 rounded-full shadow-lg hover:bg-gray-50 transition-all group-hover:scale-110 disabled:opacity-50"
                >
                  <Camera size={14} className="text-[#0b1c30]" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {formData.photoUrl && !uploading && (
                <button
                  onClick={handleDeletePhoto}
                  className="mt-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Supprimer la photo
                </button>
              )}
              
              {/* ❌ SUPPRIMÉ : Le nom et l'email en bas de la photo */}

              {errors.photo && (
                <div className="mt-2 w-full bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
                  <XCircle size={14} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-xs font-medium">{errors.photo}</span>
                </div>
              )}

              {successMessage && (
                <div className="mt-2 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-emerald-700 text-xs font-medium">{successMessage}</span>
                </div>
              )}
              
              {errors.submit && (
                <div className="mt-2 w-full bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
                  <XCircle size={14} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-xs font-medium">{errors.submit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="py-3.5 px-5 border-t border-gray-200 flex justify-end items-center gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#434655] hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
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
        .animate-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default SettingsModal;