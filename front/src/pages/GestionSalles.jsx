import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sallesApi } from "../api/sallesApi";
import { AddSalleModal }      from "../components/AddSalleModal";
import { EditSalleModal }     from "../components/EditSalleModal";
import { SettingsModal }      from "../components/SettingsModal";
import { ToastContainer, useToast } from "../components/Toast";

// ── Palette couleurs bâtiment ────────────────────────────────────────────────
const BAT_COLORS = ["#1e293b","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#10b981","#ec4899"];
const batColor   = (name, list) => BAT_COLORS[list.indexOf(name) % BAT_COLORS.length] ?? "#64748b";
const etageLabel = (e) => e === 0 ? "Rez-de-chaussée" : `Étage ${e}`;

// ── Icônes SVG inline ────────────────────────────────────────────────────────
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IcoChevron = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IcoGear = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IcoClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const IcoLayers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);

// ── Dropdown filtre ──────────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange, renderLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const display = value !== "" ? (renderLabel ? renderLabel(value) : value) : label;
  const active  = value !== "";

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 16px", borderRadius:999,
          border:`1.5px solid ${active ? "#10b981" : "#e2e8f0"}`,
          background: active ? "#f0fdf4" : "#fff",
          color: active ? "#059669" : "#64748b",
          fontSize:13, fontWeight: active ? 600 : 400,
          cursor:"pointer", whiteSpace:"nowrap", outline:"none",
          boxShadow: open ? "0 0 0 3px rgba(16,185,129,.12)" : "0 1px 4px rgba(0,0,0,.05)",
          transition:"all .18s",
        }}
      >
        {display} <IcoChevron />
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0,
          background:"#fff", borderRadius:12,
          boxShadow:"0 10px 32px rgba(0,0,0,.12)",
          border:"1px solid #e2e8f0", zIndex:200, minWidth:180, overflow:"hidden",
        }}>
          {[{ val:"", label:"Tous" }, ...options.map((o) => ({ val:o, label: renderLabel ? renderLabel(o) : o }))].map((opt) => {
            const sel = String(value) === String(opt.val);
            return (
              <div
                key={opt.val}
                onClick={() => { onChange(opt.val); setOpen(false); }}
                style={{
                  padding:"10px 16px", fontSize:13,
                  color: sel ? "#10b981" : opt.val === "" ? "#94a3b8" : "#0f172a",
                  fontWeight: sel ? 700 : 400,
                  background: sel ? "#f0fdf4" : "transparent",
                  cursor:"pointer",
                }}
                onMouseEnter={(e) => { if(!sel) e.currentTarget.style.background="#f8fafc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = sel ? "#f0fdf4" : "transparent"; }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Carte "Ajouter une salle" ─────────────────────────────────────────────────
function AddCard({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#f0fdf9" : "#fff",
        borderRadius:16,
        border:`2px dashed ${hover ? "#10b981" : "#cbd5e1"}`,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        minHeight:200, cursor:"pointer", gap:12,
        transition:"border-color .18s, background .18s",
        boxShadow: hover ? "0 4px 16px rgba(16,185,129,.1)" : "none",
      }}
    >
      <div style={{
        width:42, height:42, borderRadius:"50%",
        border:`1.5px solid ${hover ? "#10b981" : "#cbd5e1"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        color: hover ? "#10b981" : "#94a3b8",
        transition:"all .18s",
      }}>
        <IcoPlus />
      </div>
      <span style={{
        fontSize:11, fontWeight:700,
        textTransform:"uppercase", letterSpacing:".1em",
        color: hover ? "#10b981" : "#94a3b8",
        transition:"color .18s",
      }}>
        Ajouter une salle
      </span>
    </div>
  );
}

// ── Carte Salle ───────────────────────────────────────────────────────────────
function SalleCard({ salle, accentColor, onSettings }) {
  const [hover, setHover] = useState(false);
  const libre = !salle.courActuel; // Dans la BD il n'y a pas de statut — on déduit visuellement

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:"#fff",
        borderRadius:16,
        border:"1px solid #f1f5f9",
        overflow:"hidden",
        boxShadow: hover
          ? "0 12px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06)"
          : "0 2px 8px rgba(0,0,0,.04)",
        transform: hover ? "translateY(-3px)" : "none",
        transition:"box-shadow .22s, transform .22s",
      }}
    >
      {/* Bande de couleur bâtiment en haut */}
      <div style={{ height:3, background:`linear-gradient(90deg, ${accentColor}, ${accentColor}55)` }} />

      {/* Header : numéro + badge statut */}
      <div style={{
        padding:"13px 15px 11px",
        background: libre ? "#f0fdf4" : "#fff",
        borderBottom:"1px solid #f1f5f9",
        display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      }}>
        <div>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#94a3b8", marginBottom:3 }}>
            Salle
          </div>
          <div style={{ fontSize:19, fontWeight:800, color:"#0f172a", letterSpacing:"-.02em" }}>
            {salle.nomSalle}
          </div>
        </div>
        {/* Badge LIBRE / OCCUPÉ */}
        <span style={{
          display:"flex", alignItems:"center", gap:5,
          padding:"4px 11px", borderRadius:999,
          fontSize:11, fontWeight:700,
          background: libre ? "#10b981" : "#ef4444",
          color:"#fff",
        }}>
          <span style={{
            width:6, height:6, borderRadius:"50%",
            background:"rgba(255,255,255,.65)",
            display:"inline-block",
          }} />
          {libre ? "LIBRE" : "OCCUPÉ"}
        </span>
      </div>

      {/* Corps */}
      <div style={{ padding:"13px 15px 14px" }}>
        {/* Cours actuel (simulé ici via un champ virtuel — à adapter si la BD évolue) */}
        <div style={{
          fontSize:13, color:"#94a3b8",
          fontStyle:"italic", marginBottom:14, padding:"2px 0",
        }}>
          Aucun cours en cours
        </div>

        {/* Tags : étage + bâtiment */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
          <span style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"4px 10px", borderRadius:999,
            border:"1px solid #e2e8f0",
            fontSize:12, color:"#475569", fontWeight:500,
            background:"#f8fafc",
          }}>
            <IcoLayers /> {etageLabel(salle.etage)}
          </span>
          <span style={{
            padding:"4px 10px", borderRadius:999,
            border:"1px solid #e2e8f0",
            fontSize:12, color:"#475569", fontWeight:500,
            background:"#f8fafc",
          }}>
            {salle.batiment}
          </span>
        </div>

        {/* Footer : bouton engrenage */}
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button
            onClick={() => onSettings(salle)}
            title={`Paramètres de ${salle.nomSalle}`}
            style={{
              background:"none", border:"none", cursor:"pointer",
              color:"#94a3b8", padding:6, borderRadius:8,
              display:"flex", alignItems:"center",
              transition:"color .15s, background .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color="#10b981"; e.currentTarget.style.background="#f0fdf4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.background="transparent"; }}
          >
            <IcoGear />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function GestionSalles() {
  const toast = useToast();

  const [salles,    setSalles]    = useState([]);
  const [batiments, setBatiments] = useState([]);
  const [etages,    setEtages]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterBat, setFilterBat] = useState("");
  const [filterEtage, setFilterEtage] = useState("");
  const [modal,     setModal]     = useState(null); // { type, data? }
  const [actionLoading, setActionLoading] = useState(false);

  // ── Chargement des données ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [s, b, e] = await Promise.all([
        sallesApi.getAll({
          batiment: filterBat   || undefined,
          etage:    filterEtage !== "" ? filterEtage : undefined,
          search:   search      || undefined,
        }),
        sallesApi.getBatiments(),
        sallesApi.getEtages(),
      ]);
      setSalles(s || []);
      setBatiments(b || []);
      setEtages(e || []);
    } catch (err) {
      toast.error(err.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, [filterBat, filterEtage, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Groupement par bâtiment ─────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = {};
    if (!Array.isArray(salles)) return map;
    for (const s of salles) {
      if (!map[s.batiment]) map[s.batiment] = [];
      map[s.batiment].push(s);
    }
    return map;
  }, [salles]);

  // ── Actions CRUD ────────────────────────────────────────────────────────
  const handleCreate = async (dto) => {
    try {
      setActionLoading(true);
      const created = await sallesApi.create(dto);
      toast.success(`Salle « ${created.nomSalle} » ajoutée avec succès !`);
      setModal(null);
      fetchAll();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async (id, dto) => {
    try {
      setActionLoading(true);
      await sallesApi.update(id, dto);
      toast.success("Salle mise à jour avec succès.");
      setModal(null);
      fetchAll();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await sallesApi.delete(id);
      toast.info("Salle supprimée.");
      setModal(null);
      fetchAll();
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh", background:"#f8fafc",
      padding:"32px 36px",
      fontFamily:"'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes modalIn  { from { opacity:0; transform:translateY(18px) scale(.97) } to { opacity:1; transform:none } }
        @keyframes toastIn  { from { opacity:0; transform:translateX(20px) }            to { opacity:1; transform:none } }
        @keyframes spin     { to   { transform:rotate(360deg) } }
        * { box-sizing:border-box }
        input, select, button { font-family:inherit }
        ::-webkit-scrollbar { width:6px }
        ::-webkit-scrollbar-track { background:#f1f5f9 }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px }
      `}</style>

      {/* Titre */}
      <h1 style={{ margin:"0 0 28px", fontSize:22, fontWeight:800, color:"#0f172a", letterSpacing:"-.03em" }}>
        Gestion des Salles
      </h1>

      {/* Barre de filtres */}
      <div style={{ display:"flex", gap:10, marginBottom:36, flexWrap:"wrap", alignItems:"center" }}>
        {/* Recherche */}
        <div style={{ flex:1, minWidth:240, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}>
            <IcoSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par numéro, cours ou mention…"
            style={{
              width:"100%", padding:"9px 14px 9px 38px",
              borderRadius:999, border:"1.5px solid #e2e8f0",
              background:"#fff", fontSize:13, color:"#0f172a",
              outline:"none",
              boxShadow:"0 1px 4px rgba(0,0,0,.05)",
              transition:"border-color .2s",
            }}
            onFocus={(e) => e.target.style.borderColor="#10b981"}
            onBlur={(e)  => e.target.style.borderColor="#e2e8f0"}
          />
        </div>

        {/* Filtres */}
        <FilterDropdown label="Bâtiment" options={batiments} value={filterBat}   onChange={setFilterBat} />
        <FilterDropdown label="Étage"    options={etages}    value={filterEtage} onChange={setFilterEtage} renderLabel={etageLabel} />
        <FilterDropdown label="Parcours" options={[]}        value=""            onChange={() => {}} />

        {/* Reset filtres */}
        {(search || filterBat || filterEtage !== "") && (
          <button
            onClick={() => { setSearch(""); setFilterBat(""); setFilterEtage(""); }}
            style={{
              padding:"7px 14px", borderRadius:999,
              border:"1.5px solid #fca5a5", background:"#fff5f5",
              color:"#dc2626", fontSize:12, fontWeight:600, cursor:"pointer",
              transition:"background .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background="#fee2e2"}
            onMouseLeave={(e) => e.currentTarget.style.background="#fff5f5"}
          >
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Spinner chargement */}
      {loading && (
        <div style={{ display:"flex", alignItems:"center", gap:12, color:"#64748b", fontSize:14, padding:"48px 0" }}>
          <div style={{
            width:18, height:18,
            border:"2.5px solid #e2e8f0", borderTopColor:"#10b981",
            borderRadius:"50%", animation:"spin .8s linear infinite",
          }} />
          Chargement des salles…
        </div>
      )}

      {/* État vide */}
      {!loading && salles.length === 0 && (
        <div style={{ textAlign:"center", padding:"64px 0", color:"#94a3b8" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>🏫</div>
          <div style={{ fontSize:16, fontWeight:700, color:"#64748b", marginBottom:6 }}>Aucune salle trouvée</div>
          <div style={{ fontSize:13 }}>
            {search || filterBat || filterEtage !== ""
              ? "Essayez d'ajuster vos filtres."
              : "Commencez par ajouter une salle ci-dessous."}
          </div>
        </div>
      )}

      {/* Sections par bâtiment */}
      {!loading && Object.entries(grouped).map(([bat, sallesGroup]) => (
        <div key={bat} style={{ marginBottom:40 }}>
          {/* En-tête section */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:28, height:3, borderRadius:2, background:batColor(bat, batiments) }} />
            <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:"#0f172a" }}>{bat}</h2>
            <span style={{ fontSize:12, color:"#94a3b8", fontWeight:500 }}>
              {sallesGroup.length} salle{sallesGroup.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Grille cartes */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))",
            gap:16,
          }}>
            <AddCard onClick={() => setModal({ type:"add" })} />
            {sallesGroup.map((s) => (
              <SalleCard
                key={s.id}
                salle={s}
                accentColor={batColor(bat, batiments)}
                onSettings={(salle) => setModal({ type:"settings", data:salle })}
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── Modals ── */}
      {modal?.type === "add" && (
        <AddSalleModal
          batiments={batiments}
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
          loading={actionLoading}
        />
      )}
      {modal?.type === "edit" && (
        <EditSalleModal
          salle={modal.data}
          batiments={batiments}
          onClose={() => setModal(null)}
          onSubmit={handleUpdate}
          loading={actionLoading}
        />
      )}
      {modal?.type === "settings" && (
        <SettingsModal
          salle={modal.data}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
          onEdit={() => setModal({ type:"edit", data:modal.data })}
        />
      )}

      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}