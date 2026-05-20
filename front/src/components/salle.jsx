import { useState, useMemo } from "react";

const initialData = {
  batiments: [
    {
      id: "A",
      label: "Bâtiment A",
      color: "#1a1a2e",
      salles: [
        {
          id: "a1",
          numero: "A-102",
          statut: "OCCUPÉ",
          courActuel: "Base de données avancées",
          etage: "Étage 1",
          parcours: "Informatique",
          mention: "M2 - DA2I",
        },
        {
          id: "a2",
          numero: "A-004",
          statut: "LIBRE",
          courActuel: null,
          etage: "Rez-de-chaussée",
          parcours: "Management",
          mention: "L3 - AES",
        },
        {
          id: "a3",
          numero: "A-205",
          statut: "LIBRE",
          courActuel: null,
          etage: "Étage 2",
          parcours: "Multimédia",
          mention: "L2 - ICM",
        },
      ],
    },
    {
      id: "B",
      label: "Bâtiment B",
      color: "#3b82f6",
      salles: [
        {
          id: "b1",
          numero: "B-110",
          statut: "OCCUPÉ",
          courActuel: "Base de Données Avancée",
          etage: "Étage 1",
          parcours: "Informatique",
          mention: "M1 - DA2I",
        },
      ],
    },
  ],
};

const allEtages = ["Rez-de-chaussée", "Étage 1", "Étage 2", "Étage 3"];
const allParcours = ["Informatique", "Management", "Multimédia", "AES"];

// Icons
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

// Icône Settings Material
const SettingsIcon = () => (
  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
    settings
  </span>
);

// Icône modifier
const EditIcon = () => (
  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
    edit
  </span>
);

// Icône supprimer
const DeleteIcon = () => (
  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
    delete
  </span>
);

const EtageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

// Dropdown component
function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 999,
          border: "1.5px solid #e2e8f0", background: "#fff",
          fontSize: 13, fontWeight: 500, color: value ? "#1a1a2e" : "#64748b",
          cursor: "pointer", whiteSpace: "nowrap",
          boxShadow: open ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
          outline: "none", transition: "box-shadow 0.2s",
        }}
      >
        {value || label} <ChevronIcon />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          border: "1px solid #e2e8f0", zIndex: 100, minWidth: 160, overflow: "hidden",
        }}>
          <div
            onClick={() => { onChange(""); setOpen(false); }}
            style={{ padding: "10px 16px", fontSize: 13, color: "#94a3b8", cursor: "pointer" }}
            onMouseEnter={e => e.target.style.background = "#f8fafc"}
            onMouseLeave={e => e.target.style.background = "transparent"}
          >
            Tous
          </div>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "10px 16px", fontSize: 13,
                color: value === opt ? "#10b981" : "#1a1a2e",
                fontWeight: value === opt ? 600 : 400,
                cursor: "pointer", background: value === opt ? "#f0fdf4" : "transparent",
              }}
              onMouseEnter={e => e.target.style.background = "#f8fafc"}
              onMouseLeave={e => e.target.style.background = value === opt ? "#f0fdf4" : "transparent"}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Modal Modifier salle (sans parcours et mention)
function EditRoomModal({ onClose, onEdit, salle, batiments, batimentId }) {
  const [numero, setNumero] = useState(salle.numero);
  const [batiment, setBatiment] = useState(batimentId);
  const [etage, setEtage] = useState(salle.etage || "");

  const handleEdit = () => {
    if (!numero.trim() || !batiment) return;
    onEdit(salle.id, { numero: numero.trim(), batiment, etage });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(3px)",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: 380,
        boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        animation: "slideUp 0.25s cubic-bezier(.16,1,.3,1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
            Modifier la salle
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 8, display: "flex", alignItems: "center" }}>
            <XIcon />
          </button>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
            Numéro de la salle
          </label>
          <input
            value={numero}
            onChange={e => setNumero(e.target.value)}
            placeholder="ex: A-102"
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
              outline: "none", boxSizing: "border-box", marginBottom: 18,
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#10b981"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
            Bâtiment
          </label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <select
              value={batiment}
              onChange={e => setBatiment(e.target.value)}
              style={{
                width: "100%", padding: "11px 36px 11px 14px",
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 14, color: batiment ? "#0f172a" : "#94a3b8",
                outline: "none", appearance: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Sélectionner un bâtiment</option>
              {batiments.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><ChevronIcon /></div>
          </div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
            Étage
          </label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <select
              value={etage}
              onChange={e => setEtage(e.target.value)}
              style={{
                width: "100%", padding: "11px 36px 11px 14px",
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 14, color: etage ? "#0f172a" : "#94a3b8",
                outline: "none", appearance: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Sélectionner un étage</option>
              {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><ChevronIcon /></div>
          </div>
        </div>
        <div style={{
          padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 12,
          borderTop: "1px solid #f1f5f9", background: "#fafafa",
        }}>
          <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 999, border: "none", background: "transparent", fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 500 }}>Annuler</button>
          <button onClick={handleEdit} style={{ padding: "10px 26px", borderRadius: 999, background: numero && batiment ? "#10b981" : "#94a3b8", border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: numero && batiment ? "pointer" : "not-allowed" }}>Modifier</button>
        </div>
      </div>
    </div>
  );
}

// Modal Ajouter salle (sans parcours et mention)
function AddRoomModal({ onClose, onAdd, batiments }) {
  const [numero, setNumero] = useState("");
  const [batiment, setBatiment] = useState("");
  const [etage, setEtage] = useState("");

  const handleAdd = () => {
    if (!numero.trim() || !batiment) return;
    onAdd({ numero: numero.trim(), batiment, etage });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(3px)",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 20, width: 380,
        boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        animation: "slideUp 0.25s cubic-bezier(.16,1,.3,1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
            Ajouter une salle
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 8, display: "flex", alignItems: "center" }}>
            <XIcon />
          </button>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
            Numéro de la salle
          </label>
          <input
            value={numero}
            onChange={e => setNumero(e.target.value)}
            placeholder="ex: A-102"
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 10,
              border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
              outline: "none", boxSizing: "border-box", marginBottom: 18,
              fontFamily: "'DM Sans', sans-serif",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#10b981"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
            Bâtiment
          </label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <select
              value={batiment}
              onChange={e => setBatiment(e.target.value)}
              style={{
                width: "100%", padding: "11px 36px 11px 14px",
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 14, color: batiment ? "#0f172a" : "#94a3b8",
                outline: "none", appearance: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Sélectionner un bâtiment</option>
              {batiments.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><ChevronIcon /></div>
          </div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
            Étage
          </label>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <select
              value={etage}
              onChange={e => setEtage(e.target.value)}
              style={{
                width: "100%", padding: "11px 36px 11px 14px",
                borderRadius: 10, border: "1.5px solid #e2e8f0",
                fontSize: 14, color: etage ? "#0f172a" : "#94a3b8",
                outline: "none", appearance: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="">Sélectionner un étage</option>
              {allEtages.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><ChevronIcon /></div>
          </div>
        </div>
        <div style={{
          padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 12,
          borderTop: "1px solid #f1f5f9", background: "#fafafa",
        }}>
          <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 999, border: "none", background: "transparent", fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 500 }}>Annuler</button>
          <button onClick={handleAdd} style={{ padding: "10px 26px", borderRadius: 999, background: numero && batiment ? "#10b981" : "#94a3b8", border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: numero && batiment ? "pointer" : "not-allowed" }}>Ajouter</button>
        </div>
      </div>
    </div>
  );
}

// Salle Card - avec icône Settings Material
function SalleCard({ salle, batimentId, onEdit, onDelete }) {
  const libre = salle.statut === "LIBRE";
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1.5px solid #f1f5f9",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "default",
      position: "relative",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; setShowMenu(false); }}
    >
      <div style={{
        padding: "14px 16px 12px",
        background: libre ? "#f0fdf4" : "#fff",
        borderBottom: "1px solid #f1f5f9",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Salle</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
            {salle.numero}
          </div>
        </div>
        <span style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 12px", borderRadius: 999,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
          background: libre ? "#10b981" : "#ef4444",
          color: "#fff",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(255,255,255,0.7)",
            display: "inline-block",
            animation: !libre ? "pulse 1.5s infinite" : "none",
          }} />
          {salle.statut}
        </span>
      </div>
      <div style={{ padding: "14px 16px", paddingBottom: "50px" }}>
        {!libre && salle.courActuel ? (
          <div style={{
            background: "#fffbeb", borderRadius: 10, padding: "10px 12px", marginBottom: 14,
            border: "1px solid #fde68a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <ClockIcon />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cours actuel</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#b45309" }}>{salle.courActuel}</div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", marginBottom: 14, padding: "6px 0" }}>
            Aucun cours en cours
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {salle.etage && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#475569", fontWeight: 500, background: "#f8fafc" }}>
              <EtageIcon /> {salle.etage}
            </span>
          )}
          {salle.parcours && (
            <span style={{ padding: "5px 10px", borderRadius: 999, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#475569", fontWeight: 500, background: "#f8fafc" }}>
              {salle.parcours}
            </span>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {salle.mention && (
            <span style={{ padding: "5px 10px", borderRadius: 999, border: "1.5px solid #e2e8f0", fontSize: 12, color: "#475569", fontWeight: 500, background: "#f8fafc" }}>
              {salle.mention}
            </span>
          )}
        </div>
      </div>

      {/* Bouton Settings en bas à droite - Icône Material */}
      <div style={{
        position: "absolute",
        bottom: "12px",
        right: "12px",
      }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            color: "#64748b",
            padding: 8,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            width: 36,
            height: 36,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#10b981"; e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#10b981"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          title="Paramètres"
        >
          <SettingsIcon />
        </button>

        {/* Menu contextuel */}
        {showMenu && (
          <div style={{
            position: "absolute",
            bottom: "45px",
            right: "0",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            border: "1px solid #e2e8f0",
            zIndex: 200,
            minWidth: "160px",
            overflow: "hidden",
          }}>
            <button
              onClick={() => {
                setShowMenu(false);
                onEdit(salle);
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 500,
                color: "#0f172a",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <EditIcon /> Modifier
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                if (window.confirm(`Supprimer la salle ${salle.numero} ?`)) {
                  onDelete(salle.id);
                }
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                border: "none",
                borderTop: "1px solid #e2e8f0",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 500,
                color: "#dc2626",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <DeleteIcon /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Room Card - Une seule carte globale
function AddRoomCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 16,
        border: "2px dashed #cbd5e1",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: 280, cursor: "pointer",
        gap: 10, transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "#f0fdf4"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#fff"; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "2px solid #cbd5e1", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#94a3b8",
        transition: "border-color 0.2s, color 0.2s",
      }}>
        <PlusIcon />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Ajouter une salle
      </span>
    </div>
  );
}

// Main App
export default function GestionSalles() {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filterBatiment, setFilterBatiment] = useState("");
  const [filterEtage, setFilterEtage] = useState("");
  const [filterParcours, setFilterParcours] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSalle, setEditingSalle] = useState(null);
  const [editingBatimentId, setEditingBatimentId] = useState(null);

  const handleAddRoom = ({ numero, batiment, etage }) => {
    const newSalle = {
      id: `salle-${Date.now()}`,
      numero,
      statut: "LIBRE",
      courActuel: null,
      etage: etage || "",
      parcours: "",
      mention: "",
    };
    setData(prev => ({
      ...prev,
      batiments: prev.batiments.map(b =>
        b.id === batiment ? { ...b, salles: [...b.salles, newSalle] } : b
      ),
    }));
  };

  const handleEditRoom = (salleId, updatedData) => {
    setData(prev => ({
      ...prev,
      batiments: prev.batiments.map(b => ({
        ...b,
        salles: b.salles.map(s =>
          s.id === salleId ? {
            ...s,
            numero: updatedData.numero,
            etage: updatedData.etage,
          } : s
        ),
      })),
    }));
  };

  const handleDeleteRoom = (salleId) => {
    setData(prev => ({
      ...prev,
      batiments: prev.batiments.map(b => ({
        ...b,
        salles: b.salles.filter(s => s.id !== salleId),
      })),
    }));
  };

  const filtered = useMemo(() => {
    return data.batiments
      .filter(b => !filterBatiment || b.id === filterBatiment)
      .map(b => ({
        ...b,
        salles: b.salles.filter(s => {
          const q = search.toLowerCase();
          const matchSearch = !q || s.numero.toLowerCase().includes(q) || (s.parcours || "").toLowerCase().includes(q) || (s.mention || "").toLowerCase().includes(q) || (s.courActuel || "").toLowerCase().includes(q);
          const matchEtage = !filterEtage || s.etage === filterEtage;
          const matchParcours = !filterParcours || s.parcours === filterParcours;
          return matchSearch && matchEtage && matchParcours;
        }),
      }));
  }, [data, search, filterBatiment, filterEtage, filterParcours]);

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "32px 36px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        input, select, button { font-family: inherit; }
      `}</style>

      {/* Header */}
      <h1 style={{ margin: "0 0 28px", fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
        Gestion des Salles
      </h1>

      {/* Filters bar */}
      <div style={{ 
        display: "flex", 
        gap: 12, 
        alignItems: "center", 
        marginBottom: 36, 
        flexWrap: "wrap" 
      }}>
        <div style={{ 
          flex: "0 0 50%", 
          position: "relative",
          minWidth: 240,
        }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
            <SearchIcon />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrer par numéro, cours ou mention..."
            style={{
              width: "100%", padding: "10px 14px 10px 40px",
              borderRadius: 999, border: "1.5px solid #e2e8f0",
              background: "#fff", fontSize: 14, color: "#0f172a",
              outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onFocus={e => e.target.style.borderColor = "#10b981"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <Dropdown
            label="Bâtiment"
            options={data.batiments.map(b => b.id)}
            value={filterBatiment}
            onChange={setFilterBatiment}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <Dropdown
            label="Étage"
            options={allEtages}
            value={filterEtage}
            onChange={setFilterEtage}
          />
        </div>
        <div style={{ flex: "0 0 auto" }}>
          <Dropdown
            label="Parcours"
            options={allParcours}
            value={filterParcours}
            onChange={setFilterParcours}
          />
        </div>
      </div>

      {/* Batiments */}
      {filtered.map(batiment => (
        <div key={batiment.id} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 28, height: 3, borderRadius: 2, background: batiment.color }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
              {batiment.label}
            </h2>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
              {batiment.salles.length} salle{batiment.salles.length > 1 ? "s" : ""}
            </span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {/* Une seule carte d'ajout pour toute l'application */}
            {batiment.id === "A" && (
              <AddRoomCard onClick={() => setShowAddModal(true)} />
            )}
            {batiment.salles.map(salle => (
              <SalleCard
                key={salle.id}
                salle={salle}
                batimentId={batiment.id}
                onEdit={(s) => {
                  setEditingSalle(s);
                  setEditingBatimentId(batiment.id);
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteRoom}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Add Modal */}
      {showAddModal && (
        <AddRoomModal
          batiments={data.batiments}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRoom}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingSalle && (
        <EditRoomModal
          salle={editingSalle}
          batiments={data.batiments}
          batimentId={editingBatimentId}
          onClose={() => {
            setShowEditModal(false);
            setEditingSalle(null);
            setEditingBatimentId(null);
          }}
          onEdit={handleEditRoom}
        />
      )}
    </div>
  );
}