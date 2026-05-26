import { useState } from "react";
import { Overlay, ModalBox, Field, ModalFooter, inputStyle } from "./ModalHelpers";

const ETAGES = [
  { val: 0, label: "Rez-de-chaussée" },
  { val: 1, label: "Étage 1" },
  { val: 2, label: "Étage 2" },
  { val: 3, label: "Étage 3" },
  { val: 4, label: "Étage 4" },
];

export function AddSalleModal({ batiments, onClose, onSubmit, loading }) {
  const [form, setForm]   = useState({ nomSalle:"", batiment:"", etage:0 });
  const [errors, setErrors] = useState({});
  const [newBat, setNewBat] = useState("");

  const validate = () => {
    const e = {};
    if (!form.nomSalle.trim())
      e.nomSalle = "Le numéro de salle est obligatoire.";
    else if (form.nomSalle.trim().length < 2)
      e.nomSalle = "Minimum 2 caractères requis.";
    else if (!/^[A-Za-z0-9\-_\s]+$/.test(form.nomSalle.trim()))
      e.nomSalle = "Caractères autorisés : lettres, chiffres, tirets, underscores.";

    const bat = form.batiment === "__new__" ? newBat.trim() : form.batiment;
    if (!form.batiment) {
      e.batiment = "Veuillez sélectionner un bâtiment.";
    } else if (form.batiment === "__new__") {
      if (!newBat.trim()) e.batimentNew = "Le nom du nouveau bâtiment est obligatoire.";
      else if (newBat.trim().length < 2) e.batimentNew = "Nom trop court (min. 2 caractères).";
    } else if (bat.length < 2) {
      e.batiment = "Nom de bâtiment trop court (min. 2 caractères).";
    }

    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    const bat = form.batiment === "__new__" ? newBat.trim() : form.batiment;
    onSubmit({ nomSalle: form.nomSalle.trim(), batiment: bat, etage: form.etage });
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, batiment: undefined, batimentNew: undefined }));
  };

  const ChevIco = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Ajouter une salle" onClose={onClose}>
        {/* Numéro */}
        <Field label="Numéro de la salle *" error={errors.nomSalle}>
          <input
            value={form.nomSalle}
            onChange={(e) => set("nomSalle", e.target.value)}
            placeholder="ex: A-102"
            style={inputStyle(!!errors.nomSalle)}
            onFocus={(e) => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; }}
            onBlur={(e)  => { e.target.style.borderColor=errors.nomSalle?"#fca5a5":"#e2e8f0"; e.target.style.background=errors.nomSalle?"#fff5f5":"#f8fafc"; }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </Field>

        {/* Bâtiment */}
        <Field label="Bâtiment *" error={errors.batiment}>
          <div style={{ position:"relative" }}>
            <select
              value={form.batiment}
              onChange={(e) => set("batiment", e.target.value)}
              style={{ ...inputStyle(!!errors.batiment), appearance:"none", paddingRight:36, cursor:"pointer" }}
              onFocus={(e) => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; }}
              onBlur={(e)  => { e.target.style.borderColor=errors.batiment?"#fca5a5":"#e2e8f0"; e.target.style.background=errors.batiment?"#fff5f5":"#f8fafc"; }}
            >
              <option value="">— Sélectionner un bâtiment —</option>
              {batiments.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="__new__">+ Nouveau bâtiment…</option>
            </select>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}>
              <ChevIco />
            </span>
          </div>
        </Field>

        {/* Nouveau bâtiment (si choix "+ Nouveau") */}
        {form.batiment === "__new__" && (
          <Field label="Nom du nouveau bâtiment *" error={errors.batimentNew}>
            <input
              value={newBat}
              onChange={(e) => {
                setNewBat(e.target.value);
                if (errors.batimentNew) setErrors(p => ({ ...p, batimentNew: undefined }));
              }}
              placeholder="ex: Bâtiment C"
              style={inputStyle(false)}
              onFocus={(e) => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; }}
              onBlur={(e)  => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; }}
            />
          </Field>
        )}

        {/* Étage */}
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
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}>
              <ChevIco />
            </span>
          </div>
        </Field>

        <ModalFooter onCancel={onClose} onConfirm={handleSubmit} loading={loading} confirmLabel="Ajouter" />
      </ModalBox>
    </Overlay>
  );
}