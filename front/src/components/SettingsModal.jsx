import { Overlay, ModalBox } from "./ModalHelpers";

export function SettingsModal({ salle, onClose, onDelete, onEdit }) {
  const etageLabel = salle.etage === 0 ? "Rez-de-chaussée" : `Étage ${salle.etage}`;

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="" onClose={onClose}>
        {/* En-tête salle */}
        <div style={{ textAlign:"center", padding:"4px 0 22px" }}>
          <div style={{
            width:52, height:52, borderRadius:"50%",
            background:"linear-gradient(135deg,#10b981,#059669)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 12px", fontSize:20, color:"#fff", fontWeight:800,
            boxShadow:"0 4px 16px rgba(16,185,129,.35)",
          }}>
            {salle.nomSalle.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:"#0f172a", marginBottom:4 }}>{salle.nomSalle}</div>
          <div style={{ fontSize:13, color:"#64748b" }}>{salle.batiment} — {etageLabel}</div>
        </div>

        {/* Actions */}
        <ActionBtn icon="✏️" label="Modifier les informations" onClick={onEdit} />
        <ActionBtn
          icon="🗑️"
          label="Supprimer définitivement"
          danger
          onClick={() => {
            if (window.confirm(
              `Supprimer la salle « ${salle.nomSalle} » dans ${salle.batiment} ?\n\nCette action est irréversible.`
            )) onDelete(salle.id);
          }}
        />
      </ModalBox>
    </Overlay>
  );
}

function ActionBtn({ icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:"100%", padding:"11px 14px",
        borderRadius:10, marginBottom:8,
        border:`1px solid ${danger ? "#fca5a5" : "#e2e8f0"}`,
        background: danger ? "#fff5f5" : "#f8fafc",
        color: danger ? "#dc2626" : "#0f172a",
        fontSize:13, fontWeight:500, cursor:"pointer",
        textAlign:"left", display:"flex", alignItems:"center", gap:10,
        fontFamily:"inherit", transition:"background .15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? "#fee2e2" : "#f1f5f9"}
      onMouseLeave={(e) => e.currentTarget.style.background = danger ? "#fff5f5" : "#f8fafc"}
    >
      <span style={{ fontSize:16 }}>{icon}</span> {label}
    </button>
  );
}