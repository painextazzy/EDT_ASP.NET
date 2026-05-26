import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };
  return {
    toasts,
    success: (m) => push(m, "success"),
    error:   (m) => push(m, "error"),
    info:    (m) => push(m, "info"),
  };
}

const CFG = {
  success: { bg: "#10b981", icon: "✓" },
  error:   { bg: "#ef4444", icon: "✕" },
  info:    { bg: "#3b82f6", icon: "ℹ" },
};

export function ToastContainer({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, pointerEvents:"none" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display:"flex", alignItems:"center", gap:10,
          background: CFG[t.type].bg, color:"#fff",
          padding:"12px 18px", borderRadius:12, fontSize:13, fontWeight:500,
          boxShadow:"0 8px 24px rgba(0,0,0,.18)",
          animation:"toastIn .25s cubic-bezier(.16,1,.3,1)",
          maxWidth:360,
        }}>
          <span style={{ fontSize:16, fontWeight:800 }}>{CFG[t.type].icon}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}