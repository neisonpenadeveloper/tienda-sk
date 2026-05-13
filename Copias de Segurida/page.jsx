"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag, Search, Heart, Menu, X, Star, Home, Sparkles, Smile, ArrowRight, Package, Truck, PlusCircle, LogOut, LogIn } from "lucide-react";

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: "implicit",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  }
);

// ─── BRAND ────────────────────────────────────────────────────────────────────
const CORAL       = "#E8402A";
const CORAL_LIGHT = "rgba(232,64,42,0.10)";
const BLUE        = "#0D3DB5";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",      label: "Todos",            icon: Sparkles },
  { id: "hogar",    label: "Hogar",            icon: Home },
  { id: "personal", label: "Cuidado Personal", icon: Smile },
  { id: "juguetes", label: "Juguetes",         icon: Package },
];

const PRODUCTS = [
  { id: 1, category: "hogar",    name: "Lámpara Arc Minimal",    price: 189000, oldPrice: 230000, rating: 4.8, reviews: 124, badge: "Nuevo",            color: "#E8E0D5", emoji: "🕯️" },
  { id: 2, category: "hogar",    name: "Cojín Nórdico Linen",    price:  67000,                  rating: 4.6, reviews:  89, badge: null,               color: "#D6DDD5", emoji: "🛋️" },
  { id: 3, category: "personal", name: "Sérum Vitamina C",       price:  95000, oldPrice: 120000, rating: 4.9, reviews: 312, badge: "− 21%",            color: "#F5EDD8", emoji: "✨" },
  { id: 4, category: "personal", name: "Set Ritual Mañana",      price: 145000,                  rating: 4.7, reviews:  56, badge: "Edición Limitada",  color: "#EAE0F0", emoji: "🌿" },
  { id: 5, category: "juguetes", name: "Bloques Montessori Oak", price: 132000,                  rating: 4.9, reviews: 201, badge: "Bestseller",        color: "#F0E8D0", emoji: "🧸" },
  { id: 6, category: "juguetes", name: "Rompecabezas Boreal",    price:  58000,                  rating: 4.5, reviews:  77, badge: null,               color: "#D8E8E5", emoji: "🧩" },
];

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ cartCount, menuOpen, setMenuOpen, activeCategory, setActiveCategory, user, onLogin, onLogout }) {
  return (
    <header style={{ borderBottom: "1px solid #EDE8E2", background: "#fff" }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo SVG */}
          <div className="flex items-center flex-shrink-0" style={{ height: "52px" }}>
            <svg viewBox="0 0 260 110" height="52" width="auto" xmlns="http://www.w3.org/2000/svg" aria-label="Tienda S&K">
              <g transform="translate(0, 8)">
                <path d="M14 28 Q14 22 20 22 L44 22 Q50 22 50 28 L54 60 Q54 66 48 66 L16 66 Q10 66 10 60 Z" fill={BLUE}/>
                <path d="M22 28 Q22 18 32 18 Q42 18 42 28" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round"/>
                <circle cx="20" cy="27" r="2.5" fill="white"/>
                <circle cx="44" cy="27" r="2.5" fill="white"/>
              </g>
              <g transform="translate(88, 0)">
                <path d="M26 0 C11.6 0 0 11.6 0 26 C0 40.4 26 68 26 68 C26 68 52 40.4 52 26 C52 11.6 40.4 0 26 0 Z" fill={BLUE}/>
                <g transform="translate(9, 10)">
                  <path d="M2 2 L6 2 L9 20 L26 20 L29 8 L7 8" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="11" cy="24" r="2.5" fill="white"/>
                  <circle cx="23" cy="24" r="2.5" fill="white"/>
                </g>
              </g>
              <rect x="8" y="55" width="200" height="38" rx="8" fill="#111111"/>
              <text x="18" y="81" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="white" letterSpacing="0.5">Tienda</text>
              <text x="115" y="81" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill={BLUE} letterSpacing="0.5">S&K</text>
              <g transform="translate(208, 58)">
                <line x1="0" y1="8" x2="10" y2="8" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="0" y1="14" x2="8" y2="14" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="0" y1="20" x2="6" y2="20" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                <rect x="10" y="2" width="28" height="22" rx="2" fill="#111"/>
                <path d="M38 8 L50 8 L50 24 L38 24 Z" fill="#333"/>
                <path d="M38 8 L46 8 L46 16 L38 16 Z" fill="#87CEEB"/>
                <circle cx="20" cy="26" r="5" fill="#111"/>
                <circle cx="20" cy="26" r="2.5" fill="#888"/>
                <circle cx="44" cy="26" r="5" fill="#111"/>
                <circle cx="44" cy="26" r="2.5" fill="#888"/>
              </g>
              <text x="114" y="106" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="9" fill="#555" letterSpacing="3" textAnchor="middle">TIENDA EN LINEA</text>
            </svg>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#fff" : "#4A4A4A",
                    background: isActive ? CORAL : "transparent",
                    border: "none", borderRadius: "20px",
                    padding: "7px 18px", cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6560", padding: "8px" }}>
              <Search size={18} />
            </button>
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "#6B6560", padding: "8px" }}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "2px", right: "2px",
                  background: CORAL, color: "#fff", borderRadius: "50%",
                  width: "16px", height: "16px", fontSize: "9px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{cartCount}</span>
              )}
            </button>

            {/* AUTH BUTTON */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Avatar */}
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${CORAL}` }}
                  />
                )}
                {/* Nombre */}
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}
                  className="hidden sm:inline"
                >
                  {user.user_metadata?.name?.split(" ")[0] ?? user.email}
                </span>
                {/* Publicar Producto */}
                <button
                  onClick={() => alert("¡Función de publicar producto próximamente!")}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    background: CORAL, color: "#fff", border: "none",
                    borderRadius: "24px", padding: "9px 18px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", fontWeight: 700,
                    cursor: "pointer", transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <PlusCircle size={15} />
                  <span className="hidden sm:inline">Publicar</span>
                </button>
                {/* Logout */}
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  style={{
                    background: "none", border: `1.5px solid ${CORAL}`,
                    borderRadius: "50%", width: "34px", height: "34px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: CORAL,
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  background: CORAL, color: "#fff", border: "none",
                  borderRadius: "24px", padding: "9px 18px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", fontWeight: 700,
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}

            <button
              className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#1A1A1A", padding: "8px" }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid #EDE8E2", paddingBottom: "12px" }} className="md:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setMenuOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 4px", background: "none", border: "none",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "15px",
                  fontWeight: activeCategory === cat.id ? 700 : 400,
                  color: activeCategory === cat.id ? CORAL : "#4A4A4A",
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onShop }) {
  return (
    <section style={{ background: "#FAF7F4", padding: "72px 24px 84px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-130px", right: "-130px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(232,64,42,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-90px", left: "-90px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(232,64,42,0.04)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "780px", margin: "0 auto", position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: CORAL_LIGHT, border: "1px solid rgba(232,64,42,0.22)",
          borderRadius: "28px", padding: "7px 18px", marginBottom: "32px",
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: CORAL, display: "inline-block", boxShadow: "0 0 0 3px rgba(232,64,42,0.25)" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", fontWeight: 600, color: CORAL }}>
            Nuevos productos cada semana
          </span>
        </div>

        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(42px, 6.5vw, 78px)",
          fontWeight: 800, color: "#111111",
          lineHeight: 1.05, letterSpacing: "-2.5px", marginBottom: "22px",
        }}>
          Date ese{" "}
          <span style={{ color: CORAL, borderBottom: `4px solid ${CORAL}`, paddingBottom: "2px", display: "inline-block" }}>
            gusto
          </span>
          {" "}que mereces
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(15px, 2vw, 18px)",
          color: "#5A5A5A", lineHeight: 1.65,
          maxWidth: "560px", margin: "0 auto 12px",
        }}>
          Explora nuestra colección donde las{" "}
          <strong style={{ color: "#111", fontWeight: 700 }}>últimas tendencias</strong>{" "}
          y los{" "}
          <strong style={{ color: CORAL, fontWeight: 700 }}>precios increíbles</strong>{" "}
          se encuentran.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "#9A9A9A", marginBottom: "40px" }}>
          Desde el detalle perfecto para tu sala hasta ese juguete irresistible.
        </p>

        <button
          onClick={onShop}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: CORAL, color: "#fff", border: "none",
            borderRadius: "36px", padding: "16px 42px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 700,
            cursor: "pointer", boxShadow: "0 10px 30px rgba(232,64,42,0.35)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(232,64,42,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 10px 30px rgba(232,64,42,0.35)"; }}
        >
          <Sparkles size={18} />
          Descubre tu nuevo favorito
        </button>

        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", marginTop: "52px" }}>
          {[
            { icon: ShoppingBag, label: "Productos seleccionados" },
            { icon: Heart,       label: "Calidad garantizada" },
            { icon: Truck,       label: "Envío rápido" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ background: CORAL_LIGHT, borderRadius: "10px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} color={CORAL} />
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", color: "#555", fontWeight: 500 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CATEGORY PILLS ───────────────────────────────────────────────────────────
function CategoryPills({ active, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 20px", borderRadius: "24px",
              border: isActive ? `1.5px solid ${CORAL}` : "1.5px solid #E0D8CC",
              background: isActive ? CORAL : "#fff",
              color: isActive ? "#fff" : "#6B6560",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13.5px", fontWeight: isActive ? 700 : 400,
              cursor: "pointer", transition: "all 0.18s ease",
            }}
          >
            <Icon size={14} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ category }) {
  const cat = CATEGORIES.find(c => c.id === category);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: CORAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "32px" }}>
        📦
      </div>
      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
        Pronto habrá novedades
      </h3>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#9B948E", maxWidth: "280px", lineHeight: 1.6 }}>
        Estamos preparando productos increíbles para <strong>{cat?.label}</strong>. ¡Vuelve pronto!
      </p>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, wishlisted, onWishlist }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      style={{
        background: "#fff", borderRadius: "16px", overflow: "hidden",
        border: "1px solid #EDE8E2",
        transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(26,26,26,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ background: product.color, height: "200px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: "64px" }}>
        <span style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))" }}>{product.emoji}</span>
        {product.badge && (
          <span style={{
            position: "absolute", top: "12px", left: "12px",
            background: product.badge.startsWith("−") ? CORAL : "#1A1A1A",
            color: "#fff", fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "12px",
          }}>
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          style={{
            position: "absolute", top: "10px", right: "10px",
            background: "#fff", border: "none", borderRadius: "50%",
            width: "34px", height: "34px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            color: wishlisted ? CORAL : "#9B948E", transition: "color 0.15s",
          }}
        >
          <Heart size={15} fill={wishlisted ? CORAL : "none"} />
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="flex items-center gap-1" style={{ marginBottom: "6px" }}>
          <Star size={12} fill="#F5A623" color="#F5A623" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#6B6560", fontWeight: 500 }}>
            {product.rating} ({product.reviews})
          </span>
        </div>
        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A1A1A", marginBottom: "10px", lineHeight: 1.3 }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 800, color: "#1A1A1A" }}>
              {fmt(product.price)}
            </span>
            {product.oldPrice && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9B948E", textDecoration: "line-through", marginLeft: "6px" }}>
                {fmt(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            style={{
              background: added ? "#2D7A4F" : CORAL,
              color: "#fff", border: "none", borderRadius: "20px",
              padding: "7px 14px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700,
              cursor: "pointer", transition: "background 0.25s ease", whiteSpace: "nowrap",
            }}
          >
            {added ? "✓ Añadido" : "+ Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PROMO BANNER ─────────────────────────────────────────────────────────────
function Banner() {
  return (
    <div style={{
      background: "linear-gradient(120deg, #1A1A1A 0%, #2D2925 100%)",
      borderRadius: "20px", padding: "40px 48px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "24px", flexWrap: "wrap", margin: "48px 0",
    }}>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#9B948E", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
          Envío gratis
        </p>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "28px", fontWeight: 800, color: "#F5F0EA", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          En compras mayores<br />a $150.000 COP
        </h2>
      </div>
      <button
        style={{
          background: CORAL, color: "#fff", border: "none",
          borderRadius: "28px", padding: "14px 30px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          flexShrink: 0, transition: "opacity 0.15s",
          boxShadow: "0 6px 20px rgba(232,64,42,0.35)",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Aprovechar oferta <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #E8E4DF", marginTop: "64px", padding: "40px 0 28px" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div style={{ background: CORAL, borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A1A1A" }}>
              Tienda <span style={{ color: CORAL }}>S&K</span>
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9B948E" }}>
            © 2025 Tienda SYK · Hecho con cuidado en Colombia 🇨🇴
          </p>
          <div className="flex gap-4">
            {["Privacidad", "Términos", "Contacto"].map(link => (
              <a key={link} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#9B948E", textDecoration: "none" }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount]           = useState(0);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [wishlist, setWishlist]             = useState([]);
  const [user, setUser]                     = useState(null);

  // ── Auth: detectar sesión activa ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session);
      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null);
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
      }
      if (event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Login con Google ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://project-dcnli.vercel.app",
      },
    });
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const filteredProducts = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const handleAddToCart = () => setCartCount(c => c + 1);
  const toggleWishlist  = (id) => setWishlist(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F4; }
        .grid-products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#FAF7F4" }}>
        <Navbar
          cartCount={cartCount}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <Hero onShop={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })} />

        <main className="max-w-7xl mx-auto px-6 lg:px-8" style={{ paddingTop: "56px" }}>

          {/* Section header */}
          <div className="flex items-end justify-between flex-wrap gap-4" style={{ marginBottom: "24px" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#9B948E", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
                Catálogo
              </p>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "30px", fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.5px" }}>
                {activeCategory === "all" ? "Todos los productos" : CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h2>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#9B948E" }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          {/* Category pills */}
          <div id="productos" style={{ marginBottom: "32px" }}>
            <CategoryPills active={activeCategory} onChange={setActiveCategory} />
          </div>

          {/* Grid or empty */}
          {filteredProducts.length === 0
            ? <EmptyState category={activeCategory} />
            : (
              <div className="grid-products">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    wishlisted={wishlist.includes(product.id)}
                    onWishlist={toggleWishlist}
                  />
                ))}
              </div>
            )
          }

          <Banner />
        </main>

        <Footer />
      </div>
    </>
  );
}
