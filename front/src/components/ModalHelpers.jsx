export function Overlay({ onClose, children }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,.45)",
        zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(4px)",
      }}
    >
      {children}
    </div>
  );
}

export function ModalBox({ title, onClose, children }) {
  return (
    <div style={{
      background:"#fff", borderRadius:20,
      width:400, maxWidth:"calc(100vw - 32px)",
      boxShadow:"0 25px 60px rgba(0,0,0,.18)",
      overflow:"hidden",
      animation:"modalIn .22s cubic-bezier(.16,1,.3,1)",
    }}>
      {title && (
        <div style={{
          padding:"22px 24px 18px",
          borderBottom:"1px solid #f1f5f9",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:20, lineHeight:1, padding:2 }}>✕</button>
        </div>
      )}
      <div style={{ padding:"22px 24px" }}>{children}</div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{
        display:"block", fontSize:11, fontWeight:700,
        letterSpacing:".08em", textTransform:"uppercase",
        color: error ? "#dc2626" : "#64748b", marginBottom:6,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize:12, color:"#dc2626", marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}

export function ModalFooter({ onCancel, onConfirm, loading, confirmLabel = "Confirmer" }) {
  return (
    <div style={{
      display:"flex", justifyContent:"flex-end", gap:10,
      paddingTop:16, marginTop:8,
      borderTop:"1px solid #f1f5f9",
    }}>
      <button
        onClick={onCancel}
        style={{
          background:"none", border:"none", fontSize:14,
          color:"#64748b", cursor:"pointer",
          padding:"9px 18px", borderRadius:999, fontFamily:"inherit",
        }}
        onMouseEnter={(e) => e.target.style.color="#0f172a"}
        onMouseLeave={(e) => e.target.style.color="#64748b"}
      >
        Annuler
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        style={{
          background: loading ? "#94a3b8" : "#10b981",
          border:"none", fontSize:14, fontWeight:700, color:"#fff",
          cursor: loading ? "not-allowed" : "pointer",
          padding:"9px 24px", borderRadius:999, fontFamily:"inherit",
          boxShadow: loading ? "none" : "0 4px 12px rgba(16,185,129,.35)",
          transition:"background .15s, box-shadow .15s",
        }}
        onMouseEnter={(e) => { if(!loading){ e.target.style.background="#059669"; e.target.style.boxShadow="0 4px 16px rgba(5,150,105,.4)"; }}}
        onMouseLeave={(e) => { if(!loading){ e.target.style.background="#10b981"; e.target.style.boxShadow="0 4px 12px rgba(16,185,129,.35)"; }}}
      >
        {loading ? "⏳ Chargement…" : confirmLabel}
      </button>
    </div>
  );
}

export const inputStyle = (hasError) => ({
  width:"100%", padding:"10px 13px",
  borderRadius:10,
  border:`1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
  background: hasError ? "#fff5f5" : "#f8fafc",
  fontSize:14, color:"#0f172a", outline:"none",
  fontFamily:"inherit", boxSizing:"border-box",
  transition:"border-color .2s, background .2s",
});