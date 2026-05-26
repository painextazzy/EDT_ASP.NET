import { useState } from "react";
import { Overlay, ModalBox, Field, ModalFooter, inputStyle } from "./ModalHelpers";

const ETAGES = [
  { val:0, label:"Rez-de-chaussée" },
  { val:1, label:"Étage 1" },
  { val:2, label:"Étage 2" },
  { val:3, label:"Étage 3" },
  { val:4, label:"Étage 4" },
];

export function EditSalleModal({ salle, batiments, onClose, onSubmit, loading }) {
  const [form, setForm]   = useState({ nomSalle: salle.nomSalle, batiment: salle.batiment, etage: salle.etage });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nomSalle.trim()) e.nomSalle = "Le numéro de salle est obligatoire.";
    else if (form.nomSalle.trim().length < 2) e.nomSalle = "Minimum 2 caractères.";
    if (!form.batiment) e.batiment = "Veuillez sélectionner un bâtiment.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    // N'envoyer que les champs modifiés
    const patch = {};
    if (form.nomSalle !== salle.nomSalle) patch.nomSalle = form.nomSalle.trim();
    if (form.batiment !== salle.batiment) patch.batiment = form.batiment;
    if (form.etage    !== salle.etage)    patch.etage    = form.etage;
    if (Object.keys(patch).length === 0) { onClose(); return; }
    onSubmit(salle.id, patch);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const ChevIco = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );

  return (
    <Overlay onClose={onClose}>
      <ModalBox title={`Modifier — ${salle.nomSalle}`} onClose={onClose}>
        <Field label="Numéro de la salle *" error={errors.nomSalle}>
          <input
            value={form.nomSalle}
            onChange={(e) => set("nomSalle", e.target.value)}
            style={inputStyle(!!errors.nomSalle)}
            onFocus={(e) => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; }}
            onBlur={(e)  => { e.target.style.borderColor=errors.nomSalle?"#fca5a5":"#e2e8f0"; e.target.style.background=errors.nomSalle?"#fff5f5":"#f8fafc"; }}
          />
        </Field>
        <Field label="Bâtiment *" error={errors.batiment}>
          <div style={{ position:"relative" }}>
            <select
              value={form.batiment}
              onChange={(e) => set("batiment", e.target.value)}
              style={{ ...inputStyle(!!errors.batiment), appearance:"none", paddingRight:36, cursor:"pointer" }}
              onFocus={(e) => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; }}
              onBlur={(e)  => { e.target.style.borderColor=errors.batiment?"#fca5a5":"#e2e8f0"; e.target.style.background=errors.batiment?"#fff5f5":"#f8fafc"; }}
            >
              {batiments.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}><ChevIco /></span>
          </div>
        </Field>
        <Field label="Étage">
          <div style={{ position:"relative" }}>
            <select
              value={form.etage}
              onChange={(e) => set("etage", Number(e.target.value))}
              style={{ ...inputStyle(false), appearance:"none", paddingRight:36, cursor:"pointer" }}
              onFocus={(e) => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; }}
              onBlur={(e)  => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; }}
            >
              {ETAGES.map((e) => <option key={e.val} value={e.val}>{e.label}</option>)}
            </select>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}><ChevIco /></span>
          </div>
        </Field>
        <ModalFooter onCancel={onClose} onConfirm={handleSubmit} loading={loading} confirmLabel="Enregistrer" />
      </ModalBox>
    </Overlay>
  );
}