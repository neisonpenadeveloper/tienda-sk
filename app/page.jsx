"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag, Search, Heart, Menu, X, Star, Home, Sparkles, Smile, ArrowRight, Package, Truck, PlusCircle, LogOut, LogIn, Upload, Trash2, Minus, Plus, ChevronDown, Share2, Check, Copy, Pencil, Wrench, Droplets, Tag, ChefHat, Shirt, Laptop, Activity, PawPrint, LayoutGrid } from "lucide-react";

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
const CORAL       = "#2563EB";
const CORAL_LIGHT = "rgba(37,99,235,0.09)";
const BLUE        = "#0F172A";

// ─── TIPOGRAFÍA ───────────────────────────────────────────────────────────────
const F_DISPLAY = "var(--font-azonix), sans-serif";
const F_PRICE   = "var(--font-roboto), sans-serif";
const F_UI      = "var(--font-roboto), sans-serif";

// ─── ADMINISTRADORES ──────────────────────────────────────────────────────────
  const ADMIN_EMAILS = new Set([
    "pneisonestiven@gmail.com",
    "syktiendaenlinea@gmail.com", 
  ]);

// ─── CUPONES ──────────────────────────────────────────────────────────────────
// Clave: código (en mayúsculas), Valor: porcentaje de descuento
const COUPONS = {
  "BIENVENIDO": 10,
  "SK15":       10,
  "PROMO20":    10,
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "Todos",            icon: Sparkles },
  { id: "hogar",     label: "Hogar",            icon: Home },
  { id: "personal",  label: "Cuidado Personal", icon: Smile },
  { id: "juguetes",  label: "Juguetes",         icon: Package },
  { id: "favoritos", label: "Favoritos",        icon: Heart },
];

const EXTRA_CATEGORIES = [
  { id: "herramientas", label: "Herramientas",      icon: Wrench },
  { id: "aseo",         label: "Aseo",              icon: Droplets },
  { id: "accesorios",   label: "Accesorios",        icon: Tag },
  { id: "cocina",       label: "Cocina",            icon: ChefHat },
  { id: "moda",         label: "Moda y Ropa",       icon: Shirt },
  { id: "tecnologia",   label: "Tecnología",        icon: Laptop },
  { id: "salud",        label: "Salud y Bienestar", icon: Activity },
  { id: "mascotas",     label: "Mascotas",          icon: PawPrint },
];

const ALL_CATEGORIES = [...CATEGORIES, ...EXTRA_CATEGORIES];

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

// ─── PUBLISH PRODUCT MODAL ────────────────────────────────────────────────────
function PublishModal({ user, onClose, onPublished }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    specifications: "",
    price: "",
    oldPrice: "",
    stock: "",
    category: "hogar",
    badge: "",
    badgeType: "none",
  });
  const [images, setImages]       = useState([]);
  const [previews, setPreviews]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_SIZE      = 5 * 1024 * 1024; // 5 MB
    const valid = Array.from(e.target.files)
      .filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE)
      .slice(0, 5);
    const rejected = Array.from(e.target.files).length - valid.length;
    if (rejected > 0) setError(`${rejected} archivo(s) rechazado(s): solo JPG, PNG, WEBP o GIF de máximo 5 MB.`);
    setImages(valid);
    setPreviews(valid.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    setError("");

    // ── Validaciones de entrada ──────────────────────────────────────────────
    if (!form.name || !form.price || !form.stock) {
      setError("Por favor completa nombre, precio y stock.");
      return;
    }
    if (form.name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (form.name.length > 120) {
      setError("El nombre no puede superar 120 caracteres.");
      return;
    }
    if (form.description.length > 1000) {
      setError("La descripción no puede superar 1000 caracteres.");
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!price || price <= 0 || price > 99_999_999) {
      setError("El precio debe ser un valor positivo válido.");
      return;
    }
    if (!Number.isInteger(stock) || stock <= 0 || stock > 9999) {
      setError("El stock debe ser un número entero entre 1 y 9999.");
      return;
    }
    if (form.badgeType === "descuento" && form.oldPrice) {
      if (Number(form.oldPrice) <= price) {
        setError("El precio original debe ser mayor al precio con descuento.");
        return;
      }
    }
    if (form.badgeType === "custom" && form.badge.length > 30) {
      setError("La etiqueta personalizada no puede superar 30 caracteres.");
      return;
    }
    // ────────────────────────────────────────────────────────────────────────

    setLoading(true);

    try {
      // 1. Subir imágenes a Supabase Storage
      const imageUrls = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);
        if (!uploadError) {
          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          imageUrls.push(data.publicUrl);
        }
      }

      // 2. Determinar badge
      let badge = null;
      if (form.badgeType === "nuevo") badge = "Nuevo";
      if (form.badgeType === "descuento" && form.oldPrice) {
        const pct = Math.round((1 - Number(form.price) / Number(form.oldPrice)) * 100);
        badge = `− ${pct}%`;
      }
      if (form.badgeType === "custom" && form.badge) badge = form.badge;

      // 3. Guardar producto en DB
      const { error: dbError } = await supabase.from("products").insert({
        user_id:     user.id,
        name:        form.name,
        description: form.description,
        specifications: form.specifications || null,
        price:       Number(form.price),
        old_price:   form.oldPrice ? Number(form.oldPrice) : null,
        stock:       Number(form.stock),
        category:    form.category,
        badge:       badge,
        images:      imageUrls,
        is_active:   true,
      });

      if (dbError) throw dbError;
      setSuccess(true);
      onPublished?.();
      setTimeout(() => { onClose(); }, 2000);
    } catch (err) {
      setError("Error al publicar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #E0D8CC",
    borderRadius: "10px",
    fontFamily: "var(--font-roboto), sans-serif",
    fontSize: "14px",
    color: "#1A1A1A",
    background: "#fff",
    outline: "none",
    transition: "border 0.15s",
  };

  const labelStyle = {
    fontFamily: "var(--font-roboto), sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    color: "#6B6560",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        width: "100%", maxWidth: "560px",
        maxHeight: "90vh", overflowY: "auto",
        padding: "32px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "22px", fontWeight: 800, color: "#1A1A1A" }}>
              Publicar Producto
            </h2>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#9B948E", marginTop: "4px" }}>
              Completa la información de tu producto
            </p>
          </div>
          <button onClick={onClose} style={{ background: "#F5F0EA", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "20px", fontWeight: 700, color: "#1A1A1A" }}>
              ¡Producto publicado!
            </h3>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#9B948E", marginTop: "8px" }}>
              Tu producto ya está visible en la tienda.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre del producto *</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Ej: Lámpara de madera natural"
                maxLength={120}
                style={inputStyle}
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe tu producto, materiales, dimensiones, etc."
                rows={3}
                maxLength={1000}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Especificaciones */}
            <div>
              <label style={labelStyle}>Especificaciones</label>
              <textarea
                name="specifications" value={form.specifications} onChange={handleChange}
                placeholder="Material: plástico&#10;Dimensiones: 30x20x10 cm&#10;Peso: 500g&#10;Color: blanco"
                rows={4}
                maxLength={1000}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {/* Precio y stock */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>
                  {form.badgeType === "descuento" ? "Precio con descuento (lo que paga el cliente) *" : "Precio (COP) *"}
                </label>
                <input
                  name="price" value={form.price} onChange={handleChange}
                  type="number" placeholder="89000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Stock (unidades) *</label>
                <input
                  name="stock" value={form.stock} onChange={handleChange}
                  type="number" placeholder="10"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label style={labelStyle}>Categoría</label>
              <select
                name="category" value={form.category} onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="hogar">🏠 Hogar</option>
                <option value="personal">✨ Cuidado Personal</option>
                <option value="juguetes">🧸 Juguetes</option>
                <option value="herramientas">🔧 Herramientas</option>
                <option value="aseo">💧 Aseo</option>
                <option value="accesorios">🏷️ Accesorios</option>
                <option value="cocina">🍳 Cocina</option>
                <option value="moda">👕 Moda y Ropa</option>
                <option value="tecnologia">💻 Tecnología</option>
                <option value="salud">💪 Salud y Bienestar</option>
                <option value="mascotas">🐾 Mascotas</option>
              </select>
            </div>

            {/* Etiqueta/Badge */}
            <div>
              <label style={labelStyle}>Etiqueta de precio</label>
              <select
                name="badgeType" value={form.badgeType} onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer", marginBottom: "10px" }}
              >
                <option value="none">Sin etiqueta</option>
                <option value="nuevo">🆕 Nuevo</option>
                <option value="descuento">🏷️ Descuento (requiere precio anterior)</option>
                <option value="custom">✏️ Personalizada</option>
              </select>

              {form.badgeType === "descuento" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={labelStyle}>Precio original sin descuento (el que se verá tachado)</label>
                  <input
                    name="oldPrice" value={form.oldPrice} onChange={handleChange}
                    type="number" placeholder="Ej: 120000"
                    style={inputStyle}
                  />
                  {form.price && form.oldPrice && (
                    <div style={{
                      background: "#F5F0EA", borderRadius: "10px", padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: "8px",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px",
                    }}>
                      <span style={{ color: "#9B948E", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>VISTA PREVIA:</span>
                      <span style={{ fontWeight: 800, color: CORAL, fontSize: "15px" }}>
                        {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(form.price))}
                      </span>
                      <span style={{ color: "#9B948E", textDecoration: "line-through", fontSize: "12px" }}>
                        {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(form.oldPrice))}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {form.badgeType === "custom" && (
                <input
                  name="badge" value={form.badge} onChange={handleChange}
                  placeholder="Ej: Bestseller, Edición Limitada..."
                  maxLength={30}
                  style={inputStyle}
                />
              )}
            </div>

            {/* Fotos */}
            <div>
              <label style={labelStyle}>Fotos del producto (máx. 5)</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: "8px",
                border: `2px dashed ${CORAL}`,
                borderRadius: "12px", padding: "24px",
                cursor: "pointer", background: CORAL_LIGHT,
                transition: "all 0.15s",
              }}>
                <Upload size={24} color={CORAL} />
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: CORAL, fontWeight: 600 }}>
                  Haz clic para subir fotos
                </span>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#9B948E" }}>
                  JPG, PNG hasta 5MB cada una
                </span>
                <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
              </label>

              {/* Preview de imágenes */}
              {previews.length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {previews.map((url, i) => (
                    <img
                      key={i} src={url} alt={`preview-${i}`}
                      style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", border: "1px solid #EDE8E2" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#FFF0EE", border: `1px solid ${CORAL}`,
                borderRadius: "10px", padding: "12px 16px",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: CORAL,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? "#ccc" : CORAL,
                color: "#fff", border: "none", borderRadius: "28px",
                padding: "14px", width: "100%",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? "Publicando..." : (
                <>
                  <PlusCircle size={18} />
                  Publicar producto
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EDIT PRODUCT MODAL ───────────────────────────────────────────────────────
function EditModal({ product, user, onClose, onSaved }) {
  const initBadgeType = () => {
    if (!product.badge) return "none";
    if (product.badge === "Nuevo") return "nuevo";
    if (product.oldPrice) return "descuento";
    return "custom";
  };

  const [form, setForm] = useState({
    name:        product.name        || "",
    description: product.description || "",
    specifications: product.specifications || "",
    price:       String(product.price    || ""),
    oldPrice:    String(product.oldPrice || ""),
    stock:       String(product.stock    ?? ""),
    category:    product.category    || "hogar",
    badge:       initBadgeType() === "custom" ? (product.badge || "") : "",
    badgeType:   initBadgeType(),
  });
  const [existingImgs, setExistingImgs] = useState(product.images || []);
  const [newImages, setNewImages]       = useState([]);
  const [newPreviews, setNewPreviews]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNewImages = (e) => {
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_SIZE = 5 * 1024 * 1024;
    const slots = 5 - existingImgs.length;
    const valid = Array.from(e.target.files)
      .filter(f => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_SIZE)
      .slice(0, slots);
    const rejected = Array.from(e.target.files).length - valid.length;
    if (rejected > 0) setError(`${rejected} archivo(s) rechazado(s): solo JPG/PNG/WEBP/GIF de máx 5 MB. Máximo 5 fotos en total.`);
    setNewImages(valid);
    setNewPreviews(valid.map(f => URL.createObjectURL(f)));
  };

  const removeExisting = (idx) => setExistingImgs(prev => prev.filter((_, i) => i !== idx));
  const removeNew      = (idx) => {
    setNewImages(prev    => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev  => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.price || form.stock === "") {
      setError("Por favor completa nombre, precio y stock."); return;
    }
    if (form.name.trim().length < 3)   { setError("El nombre debe tener al menos 3 caracteres."); return; }
    if (form.name.length > 120)        { setError("El nombre no puede superar 120 caracteres."); return; }
    if (form.description.length > 1000){ setError("La descripción no puede superar 1000 caracteres."); return; }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!price || price <= 0 || price > 99_999_999) { setError("El precio debe ser un valor positivo válido."); return; }
    if (!Number.isInteger(stock) || stock < 0 || stock > 9999) { setError("El stock debe ser un número entero entre 0 y 9999."); return; }
    if (form.badgeType === "descuento" && form.oldPrice && Number(form.oldPrice) <= price) {
      setError("El precio original debe ser mayor al precio con descuento."); return;
    }
    if (form.badgeType === "custom" && form.badge.length > 30) {
      setError("La etiqueta personalizada no puede superar 30 caracteres."); return;
    }

    setLoading(true);
    try {
      // Subir nuevas imágenes
      const uploadedUrls = [];
      for (const file of newImages) {
        const ext = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images").upload(fileName, file);
        if (!uploadError) {
          const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
          uploadedUrls.push(data.publicUrl);
        }
      }

      // Determinar badge
      let badge = null;
      if (form.badgeType === "nuevo") badge = "Nuevo";
      if (form.badgeType === "descuento" && form.oldPrice) {
        const pct = Math.round((1 - price / Number(form.oldPrice)) * 100);
        badge = `− ${pct}%`;
      }
      if (form.badgeType === "custom" && form.badge) badge = form.badge;

      const { error: dbError } = await supabase
        .from("products")
        .update({
          name:        form.name,
          description: form.description,
          specifications: form.specifications || null,
          price,
          old_price:   form.oldPrice ? Number(form.oldPrice) : null,
          stock,
          category:    form.category,
          badge,
          images:      [...existingImgs, ...uploadedUrls],
        })
        .eq("id", product.id);

      if (dbError) throw dbError;
      setSuccess(true);
      onSaved?.();
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setError("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #E0D8CC", borderRadius: "10px",
    fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px",
    color: "#1A1A1A", background: "#fff", outline: "none",
    transition: "border 0.15s",
  };
  const labelStyle = {
    fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px",
    fontWeight: 700, color: "#6B6560", letterSpacing: "0.5px",
    textTransform: "uppercase", marginBottom: "6px", display: "block",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        width: "100%", maxWidth: "560px",
        maxHeight: "90vh", overflowY: "auto",
        padding: "32px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "22px", fontWeight: 800, color: "#1A1A1A" }}>
              Editar Producto
            </h2>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#9B948E", marginTop: "4px" }}>
              Modifica los campos que desees actualizar
            </p>
          </div>
          <button onClick={onClose} style={{ background: "#F5F0EA", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "20px", fontWeight: 700, color: "#1A1A1A" }}>
              ¡Producto actualizado!
            </h3>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#9B948E", marginTop: "8px" }}>
              Los cambios ya son visibles en la tienda.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre del producto *</label>
              <input name="name" value={form.name} onChange={handleChange}
                style={inputStyle} placeholder="Ej: Lámpara de madera natural" />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe el producto..."
                style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} />
            </div>

            {/* Especificaciones */}
            <div>
              <label style={labelStyle}>Especificaciones</label>
              <textarea name="specifications" value={form.specifications} onChange={handleChange}
                rows={4} placeholder="Material: plástico&#10;Dimensiones: 30x20x10 cm&#10;Peso: 500g"
                maxLength={1000}
                style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} />
            </div>

            {/* Precio y precio original */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Precio (COP) *</label>
                <input name="price" type="number" value={form.price} onChange={handleChange}
                  style={inputStyle} placeholder="89000" min="1" />
              </div>
              <div>
                <label style={labelStyle}>Precio original</label>
                <input name="oldPrice" type="number" value={form.oldPrice} onChange={handleChange}
                  style={inputStyle} placeholder="120000" min="1" />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label style={labelStyle}>Stock *</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => setForm(f => ({ ...f, stock: String(Math.max(0, Number(f.stock) - 1)) }))}
                  style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E0D8CC", background: "#F5F0EA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                ><Minus size={14} /></button>
                <input name="stock" type="number" value={form.stock} onChange={handleChange}
                  style={{ ...inputStyle, textAlign: "center" }} min="0" max="9999" />
                <button
                  onClick={() => setForm(f => ({ ...f, stock: String(Math.min(9999, Number(f.stock) + 1)) }))}
                  style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E0D8CC", background: "#F5F0EA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                ><Plus size={14} /></button>
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select name="category" value={form.category} onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="hogar">Hogar</option>
                <option value="personal">Cuidado Personal</option>
                <option value="juguetes">Juguetes</option>
                <option value="herramientas">Herramientas</option>
                <option value="aseo">Aseo</option>
                <option value="accesorios">Accesorios</option>
                <option value="cocina">Cocina</option>
                <option value="moda">Moda y Ropa</option>
                <option value="tecnologia">Tecnología</option>
                <option value="salud">Salud y Bienestar</option>
                <option value="mascotas">Mascotas</option>
              </select>
            </div>

            {/* Etiqueta */}
            <div>
              <label style={labelStyle}>Etiqueta</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { value: "none",      label: "Sin etiqueta" },
                  { value: "nuevo",     label: "Nuevo" },
                  { value: "descuento", label: "Descuento" },
                  { value: "custom",    label: "Personalizada" },
                ].map(opt => (
                  <button key={opt.value}
                    onClick={() => setForm(f => ({ ...f, badgeType: opt.value }))}
                    style={{
                      padding: "7px 14px", borderRadius: "20px", cursor: "pointer",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600,
                      border: `1.5px solid ${form.badgeType === opt.value ? CORAL : "#E0D8CC"}`,
                      background: form.badgeType === opt.value ? CORAL_LIGHT : "#fff",
                      color: form.badgeType === opt.value ? CORAL : "#6B6560",
                      transition: "all 0.15s",
                    }}
                  >{opt.label}</button>
                ))}
              </div>
              {form.badgeType === "custom" && (
                <input name="badge" value={form.badge} onChange={handleChange}
                  placeholder="Ej: Edición Limitada"
                  style={{ ...inputStyle, marginTop: "10px" }} />
              )}
            </div>

            {/* Fotos existentes */}
            {existingImgs.length > 0 && (
              <div>
                <label style={labelStyle}>Fotos actuales</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {existingImgs.map((url, i) => (
                    <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #E0D8CC" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={() => removeExisting(i)}
                        style={{
                          position: "absolute", top: "4px", right: "4px",
                          background: "rgba(0,0,0,0.6)", border: "none",
                          borderRadius: "50%", width: "22px", height: "22px",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      ><X size={11} color="#fff" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agregar nuevas fotos */}
            {existingImgs.length < 5 && (
              <div>
                <label style={labelStyle}>Agregar fotos ({existingImgs.length + newPreviews.length}/5)</label>
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "8px", padding: "14px", borderRadius: "12px",
                  border: "2px dashed #E0D8CC", cursor: "pointer",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px",
                  color: "#9B948E", transition: "border 0.15s",
                }}>
                  <Upload size={16} />
                  Subir fotos (JPG, PNG, WEBP, GIF — máx 5 MB c/u)
                  <input type="file" accept="image/*" multiple onChange={handleNewImages} style={{ display: "none" }} />
                </label>
                {newPreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                    {newPreviews.map((src, i) => (
                      <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #E0D8CC" }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          onClick={() => removeNew(i)}
                          style={{
                            position: "absolute", top: "4px", right: "4px",
                            background: "rgba(0,0,0,0.6)", border: "none",
                            borderRadius: "50%", width: "22px", height: "22px",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        ><X size={11} color="#fff" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div style={{ background: "#FFF0EE", border: `1px solid ${CORAL}`, borderRadius: "10px", padding: "12px 16px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: CORAL }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? "#ccc" : CORAL,
                color: "#fff", border: "none", borderRadius: "28px",
                padding: "14px", width: "100%",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? "Guardando..." : (
                <><Pencil size={16} /> Guardar cambios</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANNOUNCEMENT BAR ────────────────────────────────────────────────────────
function AnnouncementBar() {
  const msgs = [
    "🎉 Envío gratis en compras mayores a $70.000",
    "✨ Nuevos productos cada semana",
    "🔥 Ofertas exclusivas por tiempo limitado",
    "🇨🇴 Hecho con amor desde Colombia",
    "🛡️ Compra 100% segura y garantizada",
    "🎁 Los mejores regalos están aquí",
  ];
  const all = [...msgs, ...msgs];
  return (
    <div style={{ background: "#111", overflow: "hidden", padding: "9px 0", userSelect: "none" }}>
      <div style={{ display: "flex", animation: "marquee 30s linear infinite", width: "max-content" }}>
        {all.map((msg, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0" }}>
            <span style={{ color: "#fff", fontFamily: "var(--font-roboto), sans-serif", fontSize: "12.5px", fontWeight: 500, padding: "0 36px", whiteSpace: "nowrap" }}>
              {msg}
            </span>
            <span style={{ color: CORAL, fontSize: "16px", opacity: 0.6 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ cartCount, cartBounce, menuOpen, setMenuOpen, activeCategory, setActiveCategory, user, isAdmin, onLogin, onLogout, onPublish, onUncategorized, onCouponManager, onCartOpen, searchQuery, setSearchQuery }) {
  const desktopInputRef = useRef(null);
  const mobileInputRef  = useRef(null);
  const [showNavAll, setShowNavAll] = useState(false);
  const navDropRef = useRef(null);

  const focusSearch = () => {
    desktopInputRef.current?.focus() || mobileInputRef.current?.focus();
  };

  useEffect(() => {
    const handler = e => { if (navDropRef.current && !navDropRef.current.contains(e.target)) setShowNavAll(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header style={{ borderBottom: "1px solid #EDE8E2", background: "#fff" }} className="sticky top-0 z-50">
      <div className="px-4 md:px-8" style={{ maxWidth: "1600px", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", height: "64px", gap: "8px" }}>

          {/* Logo */}
          <div className="nav-logo-wrap flex items-center flex-shrink-0" style={{ height: "52px" }}>
            <img src="/header-logo.png" alt="Tienda S&K" className="nav-logo" style={{ height: "52px", width: "auto" }} />
          </div>

          {/* Buscador móvil — inline en la fila principal */}
          <div className="flex md:hidden" style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#F0F4FF", borderRadius: "24px", padding: "8px 14px",
                width: "100%", border: `1.5px solid ${searchQuery ? CORAL : "#E2E8F0"}`,
                transition: "border-color 0.2s",
              }}
            >
              <Search size={14} color={searchQuery ? CORAL : "#9B948E"} style={{ flexShrink: 0 }} />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setSearchQuery("")}
                placeholder="Buscar..."
                autoComplete="off"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#1A1A1A",
                  minWidth: 0,
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                  <X size={13} color="#9B948E" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop nav (categorías) */}
          <nav className="hidden md:flex items-center gap-1" style={{ flexShrink: 0 }}>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px",
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

            {/* Dropdown: Todas las categorías */}
            <div ref={navDropRef} style={{ position: "relative" }}>
              {(() => {
                const isExtraActive = EXTRA_CATEGORIES.some(c => c.id === activeCategory);
                return (
                  <>
                    <button
                      onClick={() => setShowNavAll(v => !v)}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px",
                        fontWeight: isExtraActive ? 700 : 500,
                        color: isExtraActive ? "#fff" : "#4A4A4A",
                        background: isExtraActive ? CORAL : "transparent",
                        border: "none", borderRadius: "20px",
                        padding: "7px 18px", cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <LayoutGrid size={14} />
                      Todas
                      <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: showNavAll ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </button>

                    {showNavAll && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 300,
                        background: "#fff", borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                        border: "1px solid #E8E4DF",
                        padding: "10px",
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: "6px", minWidth: "270px",
                      }}>
                        {EXTRA_CATEGORIES.map(cat => {
                          const Icon = cat.icon;
                          const isActive = activeCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => { setActiveCategory(cat.id); setShowNavAll(false); }}
                              style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                padding: "10px 14px", borderRadius: "10px", border: "none",
                                background: isActive ? `linear-gradient(135deg, ${CORAL}, #ff6b52)` : "#F8FAFC",
                                color: isActive ? "#fff" : "#334155",
                                fontFamily: "var(--font-roboto), sans-serif",
                                fontSize: "13px", fontWeight: isActive ? 700 : 500,
                                cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#EEF2FF"; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "#F8FAFC"; }}
                            >
                              <Icon size={15} />
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </nav>

          {/* Buscador siempre visible */}
          <div className="hidden md:flex" style={{ flex: 1, padding: "0 12px" }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "#F0F4FF", borderRadius: "28px", padding: "9px 18px",
                width: "100%", border: `1.5px solid ${searchQuery ? CORAL : "#E2E8F0"}`,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"}
              onBlur={e => e.currentTarget.style.boxShadow = "none"}
            >
              <Search size={15} color={searchQuery ? CORAL : "#9B948E"} style={{ flexShrink: 0 }} />
              <input
                ref={desktopInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setSearchQuery("")}
                placeholder="Buscar productos..."
                autoComplete="off"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#1A1A1A",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  title="Borrar búsqueda"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                >
                  <X size={14} color="#9B948E" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={focusSearch}
              title="Buscar productos"
              className="hidden md:flex"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#6B6560", padding: "8px", borderRadius: "50%",
                transition: "all 0.18s ease", alignItems: "center",
              }}
            >
              <Search size={18} />
            </button>
            <button
              onClick={onCartOpen}
              className={cartBounce ? "cart-bounce" : ""}
              style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "#6B6560", padding: "8px" }}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className={cartBounce ? "badge-pop" : ""} style={{
                  position: "absolute", top: "0px", right: "0px",
                  background: CORAL, color: "#fff", borderRadius: "50%",
                  width: "18px", height: "18px", fontSize: "10px", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(37,99,235,0.4)",
                }}>{cartCount}</span>
              )}
            </button>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${CORAL}` }}
                  />
                )}
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}
                  className="hidden sm:inline"
                >
                  {user.user_metadata?.name?.split(" ")[0] ?? user.email}
                </span>
                {isAdmin && (
                  <>
                  <button
                    onClick={onUncategorized}
                    title="Productos sin categoría"
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      background: "#FFF3E0", color: "#E65100", border: "1.5px solid #FFCC80",
                      borderRadius: "24px", padding: "7px 14px",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700,
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <LayoutGrid size={14} />
                    <span className="hidden sm:inline">Sin categoría</span>
                  </button>
                  <button
                    onClick={onCouponManager}
                    title="Gestionar cupones"
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      background: "#F0FDF4", color: "#15803D", border: "1.5px solid #86EFAC",
                      borderRadius: "24px", padding: "7px 14px",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700,
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <Tag size={14} />
                    <span className="hidden sm:inline">Cupones</span>
                  </button>
                  <button
                    onClick={onPublish}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      background: CORAL, color: "#fff", border: "none",
                      borderRadius: "24px", padding: "9px 18px",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "13.5px", fontWeight: 700,
                      cursor: "pointer", transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <PlusCircle size={15} />
                    <span className="hidden sm:inline">Publicar</span>
                  </button>
                  </>
                )}
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
                className="login-btn-pill"
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  background: CORAL, color: "#fff", border: "none",
                  borderRadius: "24px", padding: "9px 18px",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "13.5px", fontWeight: 700,
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

        {menuOpen && (
          <div
            className="md:hidden"
            style={{
              position: "fixed", top: "64px", left: 0, right: 0, bottom: 0,
              zIndex: 49, background: "#FAFAFA",
              overflowY: "auto", WebkitOverflowScrolling: "touch",
              borderTop: "1px solid #EDE8E2",
              padding: "12px 16px 100px",
            }}
          >
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700, color: "#9B948E", letterSpacing: "1px", textTransform: "uppercase", padding: "8px 4px 10px" }}>
              Categorías
            </p>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setMenuOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    width: "100%", textAlign: "left",
                    padding: "10px 10px", marginBottom: "4px",
                    background: isActive ? CORAL_LIGHT : "#fff",
                    border: isActive ? `1.5px solid rgba(37,99,235,0.18)` : "1.5px solid transparent",
                    borderRadius: "14px",
                    fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? CORAL : "#1A1A1A",
                    cursor: "pointer", boxShadow: isActive ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "11px", flexShrink: 0,
                    background: isActive ? CORAL : "#EEF2FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    <Icon size={19} color={isActive ? "#fff" : CORAL} />
                  </div>
                  {cat.label}
                </button>
              );
            })}

            <div style={{ borderTop: "1px solid #EDE8E2", margin: "14px 0 8px" }} />
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700, color: "#9B948E", letterSpacing: "1px", textTransform: "uppercase", padding: "0 4px 10px" }}>
              Más categorías
            </p>
            {EXTRA_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setMenuOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    width: "100%", textAlign: "left",
                    padding: "10px 10px", marginBottom: "4px",
                    background: isActive ? CORAL_LIGHT : "#fff",
                    border: isActive ? `1.5px solid rgba(37,99,235,0.18)` : "1.5px solid transparent",
                    borderRadius: "14px",
                    fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? CORAL : "#1A1A1A",
                    cursor: "pointer", boxShadow: isActive ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "11px", flexShrink: 0,
                    background: isActive ? CORAL : "#EEF2FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    <Icon size={19} color={isActive ? "#fff" : CORAL} />
                  </div>
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onShop, stats }) {

  return (
    <section className="hero-section" style={{
      background: "linear-gradient(135deg,#FAF7F4 0%,#fff5f3 100%)",
      borderBottom: "1px solid #EDE8E2",
      padding: "28px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Blob decorativo */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div className="hero-inner" style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "0 32px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>

        {/* Izquierda: badges + título */}
        <div className="hero-left" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div className="hero-badges" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: CORAL_LIGHT, border: "1px solid rgba(37,99,235,0.22)",
              borderRadius: "20px", padding: "5px 14px",
            }}>
              <span className="pulse-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: CORAL, display: "inline-block" }} />
              <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: CORAL }}>
                Nuevos productos cada semana
              </span>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.30)",
              borderRadius: "20px", padding: "5px 14px",
              boxShadow: "0 0 12px rgba(16,185,129,0.15)",
            }}>
              <span style={{ fontSize: "13px", lineHeight: 1 }}>🛵</span>
              <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 700, color: "#059669" }}>
                Paga cuando lo recibas · A todo Colombia
              </span>
            </div>
          </div>
          <h1 className="hero-title" style={{
            fontFamily: "var(--font-roboto), sans-serif",
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 800, color: "#111",
            letterSpacing: "-0.5px", margin: 0,
          }}>
            Date ese{" "}
            <span style={{
              background: `linear-gradient(135deg, ${CORAL}, #ff8c6b)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              gusto
            </span>
            {" "}que mereces
          </h1>
        </div>

        {/* Derecha: stats + botón */}
        <div className="hero-right" style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {stats.products > 0 && (
            <div className="hero-stats" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "18px", fontWeight: 800, color: "#1A1A1A", lineHeight: 1 }}>{stats.products}</div>
                <div style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "10px", color: "#9B948E", fontWeight: 500, marginTop: "2px" }}>productos</div>
              </div>
              <div style={{ width: "1px", height: "32px", background: "#EDE8E2" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "18px", fontWeight: 800, color: "#1A1A1A", lineHeight: 1 }}>5.0 ★</div>
                <div style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "10px", color: "#9B948E", fontWeight: 500, marginTop: "2px" }}>calidad</div>
              </div>
              <div style={{ width: "1px", height: "32px", background: "#EDE8E2" }} />
            </div>
          )}
          <button
            onClick={onShop}
            className="shimmer-cta hero-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              color: "#fff", border: "none", borderRadius: "28px",
              padding: "11px 28px",
              fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", fontWeight: 700,
              cursor: "pointer", boxShadow: "0 6px 20px rgba(37,99,235,0.38)",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(37,99,235,0.52)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.38)"; }}
          >
            <Sparkles size={15} />
            Ver productos
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── ADMIN STATS BAR ─────────────────────────────────────────────────────────
function AdminStatsBar({ dbProducts }) {
  const active   = dbProducts.filter(p => p.is_active !== false).length;
  const inactive = dbProducts.filter(p => p.is_active === false).length;
  const noStock  = dbProducts.filter(p => p.is_active !== false && (p.stock === 0 || p.stock == null)).length;
  const noCat    = dbProducts.filter(p => !p.category || !REAL_CATS.find(c => c.id === p.category)).length;

  const Stat = ({ label, value, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontFamily: F_UI, fontSize: "12px", fontWeight: 800, color }}>{value}</span>
      <span style={{ fontFamily: F_UI, fontSize: "11px", color: "#94A3B8" }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      background: "#0F172A", borderBottom: "1px solid #1E293B",
      padding: "7px 16px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
    }}>
      <span style={{ fontFamily: F_UI, fontSize: "10px", fontWeight: 800, color: CORAL, letterSpacing: "1px", textTransform: "uppercase", marginRight: "8px" }}>ADMIN</span>
      <Stat label="activos"      value={active}   color="#4ADE80" />
      <span style={{ color: "#334155" }}>·</span>
      <Stat label="inactivos"    value={inactive} color={inactive > 0 ? "#FB923C" : "#4ADE80"} />
      <span style={{ color: "#334155" }}>·</span>
      <Stat label="sin stock"    value={noStock}  color={noStock  > 0 ? "#F87171" : "#4ADE80"} />
      <span style={{ color: "#334155" }}>·</span>
      <Stat label="sin categoría" value={noCat}   color={noCat    > 0 ? "#FBBF24" : "#4ADE80"} />
    </div>
  );
}

// ─── COUPON MANAGER (solo admin) ─────────────────────────────────────────────
function CouponManager({ coupons, onClose, onChanged }) {
  const [newCode, setNewCode]   = useState("");
  const [newPct, setNewPct]     = useState("10");
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");

  const handleAdd = async () => {
    const code = newCode.trim().toUpperCase();
    if (!code) { setError("Escribe un código"); return; }
    const pct = parseInt(newPct, 10);
    if (!pct || pct < 1 || pct > 100) { setError("Descuento entre 1 y 100"); return; }
    setAdding(true);
    const { error: err } = await supabase.from("coupons").insert({ code, discount_pct: pct, is_active: true });
    setAdding(false);
    if (err) { setError(err.message.includes("unique") ? "Ese código ya existe" : err.message); return; }
    setNewCode(""); setNewPct("10"); setError("");
    onChanged();
  };

  const handleToggle = async (id, current) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    onChanged();
  };

  const handleDelete = async (id) => {
    await supabase.from("coupons").delete().eq("id", id);
    onChanged();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 801, background: "#fff", borderRadius: "20px",
        width: "min(520px, 95vw)", maxHeight: "82vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #EDE8E2", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F0FDF4", borderRadius: "20px 20px 0 0" }}>
          <div>
            <h2 style={{ fontFamily: F_DISPLAY, fontSize: "17px", fontWeight: 700, color: "#1A1A1A", display: "flex", alignItems: "center", gap: "8px" }}>
              <Tag size={17} color="#15803D" /> Gestión de cupones
            </h2>
            <p style={{ fontFamily: F_UI, fontSize: "13px", color: "#9B948E", marginTop: "3px" }}>{coupons.length} cupón{coupons.length !== 1 ? "es" : ""} registrado{coupons.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#6B6560" }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Agregar cupón */}
          <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1.5px solid #E2E8F0" }}>
            <p style={{ fontFamily: F_UI, fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>Nuevo cupón</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                placeholder="CODIGO"
                maxLength={20}
                style={{ flex: 2, minWidth: "100px", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #E0D8CC", fontFamily: F_UI, fontSize: "13px", fontWeight: 700, background: "#fff", color: "#1A1A1A", outline: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: "80px" }}>
                <input
                  value={newPct}
                  onChange={e => setNewPct(e.target.value)}
                  type="number" min="1" max="100"
                  style={{ width: "60px", padding: "9px 8px", borderRadius: "8px", border: "1.5px solid #E0D8CC", fontFamily: F_UI, fontSize: "13px", background: "#fff", color: "#1A1A1A", outline: "none", textAlign: "center" }}
                />
                <span style={{ fontFamily: F_UI, fontSize: "13px", color: "#64748B" }}>%</span>
              </div>
              <button
                onClick={handleAdd}
                disabled={adding}
                style={{ padding: "9px 16px", background: "#15803D", color: "#fff", border: "none", borderRadius: "8px", fontFamily: F_UI, fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: adding ? 0.65 : 1 }}
              >
                {adding ? "..." : "+ Agregar"}
              </button>
            </div>
            {error && <p style={{ fontFamily: F_UI, fontSize: "12px", color: "#E53E3E", marginTop: "8px" }}>{error}</p>}
          </div>

          {/* Lista de cupones */}
          {coupons.length === 0 ? (
            <p style={{ textAlign: "center", fontFamily: F_UI, fontSize: "14px", color: "#9B948E", padding: "24px" }}>No hay cupones aún.</p>
          ) : coupons.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", border: `1.5px solid ${c.is_active ? "#E2E8F0" : "#FEE2E2"}`, borderRadius: "10px", background: c.is_active ? "#fff" : "#FFF5F5" }}>
              <span style={{ fontFamily: F_UI, fontSize: "14px", fontWeight: 800, color: "#1A1A1A", flex: 1 }}>{c.code}</span>
              <span style={{ fontFamily: F_UI, fontSize: "13px", fontWeight: 700, color: CORAL }}>{c.discount_pct}%</span>
              <span style={{
                fontFamily: F_UI, fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "12px",
                background: c.is_active ? "#DCFCE7" : "#FEE2E2",
                color: c.is_active ? "#15803D" : "#DC2626",
              }}>{c.is_active ? "Activo" : "Inactivo"}</span>
              <button
                onClick={() => handleToggle(c.id, c.is_active)}
                title={c.is_active ? "Desactivar" : "Activar"}
                style={{ background: "none", border: "1.5px solid #E0D8CC", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontFamily: F_UI, fontSize: "12px", color: "#6B6560" }}
              >
                {c.is_active ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                title="Eliminar"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#C0B8B0", padding: "4px" }}
                onMouseEnter={e => e.currentTarget.style.color = CORAL}
                onMouseLeave={e => e.currentTarget.style.color = "#C0B8B0"}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── UNCATEGORIZED PANEL (solo admin) ────────────────────────────────────────
const REAL_CATS = ALL_CATEGORIES.filter(c => c.id !== "all" && c.id !== "favoritos");

function UncategorizedPanel({ onClose, onCategoryChanged }) {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [assignments, setAssignments] = useState({});
  const [saving, setSaving]         = useState({});
  const [savedIds, setSavedIds]     = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      const uncategorized = (data ?? []).filter(p => !p.category || !REAL_CATS.find(c => c.id === p.category));
      setProducts(uncategorized);
      const init = {};
      uncategorized.forEach(p => { init[p.id] = REAL_CATS[0].id; });
      setAssignments(init);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (productId) => {
    const newCat = assignments[productId];
    if (!newCat) return;
    setSaving(s => ({ ...s, [productId]: true }));
    const { error } = await supabase.from("products").update({ category: newCat }).eq("id", productId);
    setSaving(s => ({ ...s, [productId]: false }));
    if (!error) {
      setSavedIds(ids => [...ids, productId]);
      setTimeout(() => {
        setProducts(ps => ps.filter(p => p.id !== productId));
        onCategoryChanged();
      }, 800);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 801, background: "#fff", borderRadius: "20px",
        width: "min(620px, 95vw)", maxHeight: "82vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #EDE8E2", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFF9F0", borderRadius: "20px 20px 0 0" }}>
          <div>
            <h2 style={{ fontFamily: F_DISPLAY, fontSize: "17px", fontWeight: 700, color: "#1A1A1A", display: "flex", alignItems: "center", gap: "8px" }}>
              <LayoutGrid size={18} color={CORAL} /> Productos sin categoría
            </h2>
            <p style={{ fontFamily: F_UI, fontSize: "13px", color: "#9B948E", marginTop: "3px" }}>
              {loading ? "Cargando..." : `${products.length} producto${products.length !== 1 ? "s" : ""} sin asignar`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#6B6560", borderRadius: "8px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? (
            <p style={{ textAlign: "center", padding: "40px", fontFamily: F_UI, color: "#9B948E" }}>Cargando productos...</p>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>✅</div>
              <p style={{ fontFamily: F_UI, fontSize: "15px", fontWeight: 700, color: "#1A1A1A" }}>¡Todos los productos tienen categoría!</p>
              <p style={{ fontFamily: F_UI, fontSize: "13px", color: "#9B948E", marginTop: "6px" }}>No hay nada pendiente por organizar.</p>
            </div>
          ) : products.map(p => {
            const isSaved = savedIds.includes(p.id);
            const isSaving = saving[p.id];
            return (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 14px", border: `1.5px solid ${isSaved ? "#BBF7D0" : "#EDE8E2"}`,
                borderRadius: "12px", background: isSaved ? "#F0FDF4" : "#FAFAFA",
                transition: "all 0.3s",
              }}>
                {/* Miniatura */}
                <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "#EEF2FF", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: "22px" }}>{p.emoji || "📦"}</span>
                  }
                </div>

                {/* Nombre */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: F_UI, fontSize: "14px", fontWeight: 600, color: "#1A1A1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <p style={{ fontFamily: F_UI, fontSize: "12px", color: isSaved ? "#16A34A" : "#E57373", marginTop: "2px" }}>
                    {isSaved ? "Categoría asignada ✓" : (p.category ? `Categoría desconocida: "${p.category}"` : "Sin categoría")}
                  </p>
                </div>

                {/* Select + botón */}
                {!isSaved && (
                  <>
                    <select
                      value={assignments[p.id] || REAL_CATS[0].id}
                      onChange={e => setAssignments(a => ({ ...a, [p.id]: e.target.value }))}
                      style={{ fontFamily: F_UI, fontSize: "13px", padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #E0D8CC", background: "#fff", cursor: "pointer", flexShrink: 0, maxWidth: "160px" }}
                    >
                      {REAL_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <button
                      onClick={() => handleSave(p.id)}
                      disabled={isSaving}
                      style={{
                        background: CORAL, color: "#fff", border: "none",
                        borderRadius: "8px", padding: "8px 16px", cursor: "pointer",
                        fontFamily: F_UI, fontSize: "13px", fontWeight: 700, flexShrink: 0,
                        opacity: isSaving ? 0.65 : 1, transition: "opacity 0.15s",
                      }}
                    >
                      {isSaving ? "..." : "Asignar"}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── CATEGORY PILLS ───────────────────────────────────────────────────────────
function CategoryPills({ active, onChange }) {
  const [showAll, setShowAll] = useState(false);
  const dropRef  = useRef(null);
  const scrollRef = useRef(null);
  const isExtraActive = EXTRA_CATEGORIES.some(c => c.id === active);

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowAll(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-centra el botón activo en móvil cuando cambia la categoría
  useEffect(() => {
    if (!scrollRef.current) return;
    const btn = scrollRef.current.querySelector("[data-active='true']");
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const pillStyle = (isActive) => ({
    display: "flex", alignItems: "center", gap: "7px",
    padding: "10px 22px", borderRadius: "24px",
    border: isActive ? "none" : "1.5px solid #E0D8CC",
    background: isActive ? `linear-gradient(135deg, ${CORAL}, #1d4ed8)` : "#fff",
    color: isActive ? "#fff" : "#6B6560",
    fontFamily: "var(--font-roboto), sans-serif",
    fontSize: "13.5px", fontWeight: isActive ? 700 : 400,
    cursor: "pointer",
    boxShadow: isActive ? "0 6px 20px rgba(37,99,235,0.35)" : "none",
  });

  return (
    <>
      {/* ── MÓVIL: carrusel horizontal con todas las categorías ── */}
      <div className="md:hidden" style={{ width: "100%", overflow: "hidden", margin: "0 -16px" }}>
        <div
          ref={scrollRef}
          className="cat-scroll"
          style={{
            display: "flex", gap: "10px",
            overflowX: "auto", padding: "6px 16px 14px",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
          }}
        >
          {ALL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                data-active={String(isActive)}
                onClick={() => onChange(cat.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  padding: "14px 18px", borderRadius: "18px", flexShrink: 0,
                  border: isActive ? "none" : "1.5px solid #E0D8CC",
                  background: isActive ? `linear-gradient(135deg, ${CORAL}, #1d4ed8)` : "#fff",
                  color: isActive ? "#fff" : "#4A4A4A",
                  fontFamily: "var(--font-roboto), sans-serif",
                  fontSize: "11.5px", fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                  boxShadow: isActive ? "0 6px 20px rgba(37,99,235,0.35)" : "0 1px 4px rgba(0,0,0,0.07)",
                  transition: "all 0.18s ease",
                  minWidth: "68px",
                  scrollSnapAlign: "start",
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP: pills + dropdown ── */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button key={cat.id} onClick={() => onChange(cat.id)} className="cat-pill" style={pillStyle(active === cat.id)}>
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}

        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowAll(v => !v)}
            className="cat-pill"
            style={{ ...pillStyle(isExtraActive), fontWeight: isExtraActive ? 700 : 600 }}
          >
            <LayoutGrid size={14} />
            Todas las categorías
            <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: showAll ? "rotate(180deg)" : "rotate(0deg)", marginLeft: "2px" }} />
          </button>

          {showAll && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
              background: "#fff", borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
              border: "1px solid #E8E4DF", padding: "10px",
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "6px", minWidth: "270px",
            }}>
              {EXTRA_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = active === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { onChange(cat.id); setShowAll(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 14px", borderRadius: "10px", border: "none",
                      background: isActive ? `linear-gradient(135deg, ${CORAL}, #1d4ed8)` : "#F8FAFC",
                      color: isActive ? "#fff" : "#334155",
                      fontFamily: "var(--font-roboto), sans-serif",
                      fontSize: "13px", fontWeight: isActive ? 700 : 500,
                      cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#EEF2FF"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "#F8FAFC"; }}
                  >
                    <Icon size={15} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ category, searchQuery }) {
  const cat = ALL_CATEGORIES.find(c => c.id === category);
  if (searchQuery?.trim()) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: CORAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "32px" }}>
          🔍
        </div>
        <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "22px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
          Sin resultados para "{searchQuery.trim()}"
        </h3>
        <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#9B948E", maxWidth: "300px", lineHeight: 1.6 }}>
          Intenta con otra palabra clave. Por ejemplo: <strong>lámpara</strong>, <strong>zapatos</strong> o <strong>juguete</strong>.
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: CORAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "32px" }}>
        📦
      </div>
      <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "22px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
        Pronto habrá novedades
      </h3>
      <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#9B948E", maxWidth: "280px", lineHeight: 1.6 }}>
        Estamos preparando productos increíbles para <strong>{cat?.label}</strong>. ¡Vuelve pronto!
      </p>
    </div>
  );
}

// ─── PRODUCT CARD SKELETON ────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div style={{ background: "#fff", borderRadius: "18px", overflow: "hidden", border: "1px solid #EDE8E2" }}>
      {/* Imagen */}
      <div className="skeleton" style={{ height: "210px" }} />

      {/* Contenido */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Nombre */}
        <div className="skeleton" style={{ height: "14px", borderRadius: "7px", width: "70%" }} />
        <div className="skeleton" style={{ height: "13px", borderRadius: "7px", width: "48%" }} />

        {/* Precio + botón */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
          <div className="skeleton" style={{ height: "20px", borderRadius: "7px", width: "38%" }} />
          <div className="skeleton" style={{ height: "34px", borderRadius: "20px", width: "90px" }} />
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, wishlisted, onWishlist, onSelect, user, onDelete, onEdit }) {
  const [added, setAdded]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isOwner = !!user && ADMIN_EMAILS.has(user.email);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="product-card"
      style={{ background: "#fff", borderRadius: "18px", overflow: "hidden", border: "1px solid #EDE8E2" }}
    >
      <div className="pc-img-wrap" style={{ background: product.images?.length > 0 ? "#F5F0EA" : (product.color || "#F5F0EA"), height: "210px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: "64px", overflow: "hidden" }}>
        {product.images?.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="pc-img" />
        ) : (
          <span style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))", transition: "transform 0.5s ease" }}>{product.emoji}</span>
        )}
        {/* Overlay "Ver producto" */}
        <div className="pc-overlay">
          <Search size={14} color="#fff" />
          <span style={{ color: "#fff", fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700 }}>Ver producto</span>
        </div>
        {product.badge && (
          <span style={{
            position: "absolute", top: "12px", left: "12px",
            background: product.badge.startsWith("−") ? CORAL : "#1A1A1A",
            color: "#fff", fontFamily: "var(--font-roboto), sans-serif",
            fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "12px",
          }}>
            {product.badge}
          </span>
        )}
        {isOwner && product.is_active === false && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
          }}>
            <span style={{ background: "#E65100", color: "#fff", fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 800, padding: "5px 12px", borderRadius: "20px", letterSpacing: "0.5px" }}>
              INACTIVO
            </span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          className="pc-wishlist"
          style={{
            position: "absolute", top: "8px", right: "8px",
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

      <div className="pc-body" style={{ padding: "16px" }}>
        {product.rating != null && (
          <div className="flex items-center gap-1" style={{ marginBottom: "6px" }}>
            <Star size={12} fill="#F5A623" color="#F5A623" />
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#6B6560", fontWeight: 500 }}>
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}
        <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A1A1A", marginBottom: product.stock != null ? "6px" : "10px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>

        {/* Indicador de stock */}
        {product.stock != null && product.stock === 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#F5F5F5", borderRadius: "8px", padding: "3px 9px", marginBottom: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9B948E", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700, color: "#9B948E" }}>
              Agotado
            </span>
          </div>
        )}
        {product.stock != null && product.stock >= 1 && product.stock <= 5 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#FFF0EE", borderRadius: "8px", padding: "3px 9px", marginBottom: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: CORAL, flexShrink: 0, animation: "pulse-dot 1.5s ease infinite" }} />
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700, color: CORAL }}>
              ¡Solo {product.stock} disponible{product.stock > 1 ? "s" : ""}!
            </span>
          </div>
        )}
        {product.stock != null && product.stock >= 6 && product.stock <= 15 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#FFF8EC", borderRadius: "8px", padding: "3px 9px", marginBottom: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F5A623", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700, color: "#C47F00" }}>
              Pocas unidades
            </span>
          </div>
        )}

        <div className="pc-price-row">
          <div className="pc-prices">
            <span className="pc-price" style={{ fontFamily: "var(--font-roboto), sans-serif", fontWeight: 800, color: product.oldPrice ? CORAL : "#1A1A1A" }}>
              {fmt(product.price)}
            </span>
            {product.oldPrice && (
              <span className="pc-old-price" style={{ fontFamily: "var(--font-roboto), sans-serif", color: "#9B948E", textDecoration: "line-through", marginLeft: "6px" }}>
                {fmt(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="pc-add-btn"
            style={{
              background: product.stock === 0 ? "#E0DAD3" : added ? "#2D7A4F" : CORAL,
              color: product.stock === 0 ? "#9B948E" : "#fff",
              border: "none", borderRadius: "20px",
              fontFamily: "var(--font-roboto), sans-serif", fontWeight: 700,
              cursor: product.stock === 0 ? "not-allowed" : "pointer",
              transition: "background 0.25s ease", whiteSpace: "nowrap",
            }}
          >
            {product.stock === 0 ? "Agotado" : added ? "✓ Añadido" : "+ Agregar"}
          </button>
        </div>

        {/* Panel de administrador — solo visible para el dueño */}
        {isOwner && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #EDE8E2", display: "flex", flexDirection: "column", gap: "6px" }}>
            {/* Botón editar */}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "1px solid #E0D8CC",
                borderRadius: "10px", padding: "6px 12px", cursor: "pointer",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px",
                color: BLUE, transition: "all 0.15s", width: "100%",
                justifyContent: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.background = "rgba(13,61,181,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E0D8CC"; e.currentTarget.style.background = "none"; }}
            >
              <Pencil size={13} /> Editar producto
            </button>

            {/* Botón eliminar */}
            {!confirmDelete ? (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "none", border: "1px solid #EDE8E2",
                  borderRadius: "10px", padding: "6px 12px", cursor: "pointer",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px",
                  color: "#9B948E", transition: "all 0.15s", width: "100%",
                  justifyContent: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = CORAL; e.currentTarget.style.color = CORAL; e.currentTarget.style.background = "#FFF0EE"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#EDE8E2"; e.currentTarget.style.color = "#9B948E"; e.currentTarget.style.background = "none"; }}
              >
                <Trash2 size={13} /> Eliminar producto
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11.5px", color: CORAL, fontWeight: 600, textAlign: "center" }}>
                  ¿Eliminar permanentemente?
                </p>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                    style={{ flex: 1, padding: "6px", border: "1px solid #EDE8E2", borderRadius: "8px", background: "#fff", fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", cursor: "pointer", color: "#6B6560" }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                    style={{ flex: 1, padding: "6px", border: "none", borderRadius: "8px", background: CORAL, fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer", color: "#fff" }}
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROMO BANNER ─────────────────────────────────────────────────────────────
function Banner({ onOferta }) {
  return (
    <div className="promo-banner" style={{
      background: "#1A1A1A",
      borderRadius: "20px", padding: "14px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "12px", flexWrap: "wrap", margin: "48px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "16px", lineHeight: 1 }}>🛵</span>
        <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 600, color: "#F5F0EA" }}>
          Entregas en{" "}
          <span style={{ color: "#34D399", fontWeight: 800 }}>todo Colombia</span>
          {" "}· Pagas al recibir tu pedido ✅
        </span>
      </div>
      <button
        onClick={onOferta}
        className="promo-banner-btn"
        style={{
          background: CORAL, color: "#fff", border: "none",
          borderRadius: "20px", padding: "7px 18px",
          fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          boxShadow: "0 3px 10px rgba(37,99,235,0.3)", transition: "opacity 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Aprovechar oferta <ArrowRight size={12} />
      </button>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
// ─── CAROUSEL ────────────────────────────────────────────────────────────────
function CarouselCard({ product, onSelect, cardWidth }) {
  const imgs = product.images && product.images.length > 0 ? product.images : null;
  const cardHeight = cardWidth > 0 && cardWidth < 220 ? 200 : 300;
  return (
    <div style={{ flex: `0 0 ${cardWidth}px`, width: `${cardWidth}px`, padding: "0 8px", boxSizing: "border-box" }}>
      <div
        onClick={() => onSelect(product)}
        style={{
          borderRadius: "18px", overflow: "hidden",
          border: "1px solid #E2E8F0", cursor: "pointer",
          height: "100%", position: "relative",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(37,99,235,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      >
        <div style={{
          height: `${cardHeight}px`,
          background: imgs ? "#EFF6FF" : (product.color || "#EFF6FF"),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "80px", position: "relative", overflow: "hidden",
        }}>
          {imgs
            ? <img src={imgs[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" decoding="async" />
            : <span>{product.emoji || "📦"}</span>
          }
          {product.badge && (
            <div style={{
              position: "absolute", top: "12px", left: "12px",
              background: "#1A1A1A", color: "#fff", borderRadius: "7px",
              padding: "4px 11px", fontSize: "11px", fontWeight: 700,
              fontFamily: F_UI, zIndex: 2,
            }}>{product.badge}</div>
          )}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)",
            padding: "36px 14px 14px", zIndex: 2,
          }}>
            <p style={{
              fontFamily: F_UI, fontSize: "14px", fontWeight: 700,
              color: "#fff", margin: 0, whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}>{product.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCarousel({ products, onSelect }) {
  const [currentPage, setCurrentPage] = useState(1); // 1 = primera página real (0 es clon del final)
  const [itemsPerView, setItemsPerView] = useState(4);
  const [shuffled, setShuffled] = useState([]);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const outerRef = useRef(null);
  const dragStart = useRef(null);
  const hasDragged = useRef(false);

  useEffect(() => {
    if (products && products.length > 0)
      setShuffled([...products].sort(() => Math.random() - 0.5).slice(0, 10));
  }, [products.length]);

  useEffect(() => {
    const upd = () => {
      const ipv = window.innerWidth < 900 ? 2 : 4;
      setItemsPerView(ipv);
      if (outerRef.current) setCardWidth(outerRef.current.offsetWidth / ipv);
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  useEffect(() => {
    if (outerRef.current && shuffled.length > 0) {
      const ipv = window.innerWidth < 900 ? 2 : 4;
      setItemsPerView(ipv);
      setCardWidth(outerRef.current.offsetWidth / ipv);
      setCurrentPage(1);
    }
  }, [shuffled.length, itemsPerView]);

  // Rellena hasta múltiplo exacto de itemsPerView para evitar espacios en blanco
  const paddedItems = shuffled.length > 0
    ? Array.from({ length: Math.ceil(shuffled.length / itemsPerView) * itemsPerView }, (_, i) => shuffled[i % shuffled.length])
    : [];

  // Array con clones: [última página] + [items reales] + [primera página]
  const loopItems = paddedItems.length > 0
    ? [...paddedItems.slice(-itemsPerView), ...paddedItems, ...paddedItems.slice(0, itemsPerView)]
    : [];

  const numRealPages = paddedItems.length > 0 ? paddedItems.length / itemsPerView : 0;

  // Snap silencioso al llegar a los clones (infinito sin salto visual)
  useEffect(() => {
    if (numRealPages === 0) return;
    if (currentPage === 0) {
      const t = setTimeout(() => {
        setNoTransition(true);
        setCurrentPage(numRealPages);
        requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)));
      }, 460);
      return () => clearTimeout(t);
    }
    if (currentPage === numRealPages + 1) {
      const t = setTimeout(() => {
        setNoTransition(true);
        setCurrentPage(1);
        requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)));
      }, 460);
      return () => clearTimeout(t);
    }
  }, [currentPage, numRealPages]);

  // Auto-avance
  useEffect(() => {
    if (numRealPages <= 1) return;
    const t = setInterval(() => setCurrentPage(p => p >= numRealPages ? numRealPages + 1 : p + 1), 20000);
    return () => clearInterval(t);
  }, [numRealPages]);

  if (shuffled.length === 0) return null;

  const prev = () => setCurrentPage(p => p <= 1 ? 0 : p - 1);
  const next = () => setCurrentPage(p => p >= numRealPages ? numRealPages + 1 : p + 1);
  const onDragStart = x => { dragStart.current = x; hasDragged.current = false; setIsDragging(true); setDragOffset(0); };
  const onDragMove  = x => { if (dragStart.current === null) return; const d = x - dragStart.current; if (Math.abs(d) > 8) hasDragged.current = true; setDragOffset(d); };
  const onDragEnd   = () => { if (dragStart.current !== null) { if (dragOffset < -50) next(); else if (dragOffset > 50) prev(); } dragStart.current = null; setIsDragging(false); setDragOffset(0); };

  const translateX = cardWidth > 0 ? -(currentPage * itemsPerView * cardWidth) + dragOffset : 0;
  const realPageIndex = ((currentPage - 1) % numRealPages + numRealPages) % numRealPages;

  return (
    <section style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "14px 0 24px" }}>
      <div className="carousel-inner" style={{ maxWidth: "1600px", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "14px" }}>
          <button onClick={prev} className="carousel-nav-btn" style={{ width: "34px", height: "34px", borderRadius: "50%", border: `1.5px solid ${CORAL}`, background: "#fff", color: CORAL, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: F_UI, fontSize: "9px", color: "#9B948E", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>Selección especial</p>
            <h2 style={{ fontFamily: F_DISPLAY, fontSize: "16px", fontWeight: 600, color: "#1A1A1A", margin: 0, fontStyle: "italic" }}>Productos para ti ✨</h2>
          </div>
          <button onClick={next} className="carousel-nav-btn" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "none", background: CORAL, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>›</button>
        </div>
        <div
          ref={outerRef}
          style={{ overflow: "hidden", cursor: isDragging ? "grabbing" : "grab", userSelect: "none", touchAction: "pan-x" }}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchMove={e => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
          onMouseDown={e => { e.preventDefault(); onDragStart(e.clientX); }}
          onMouseMove={e => { if (isDragging) onDragMove(e.clientX); }}
          onMouseUp={onDragEnd}
          onMouseLeave={() => { if (isDragging) onDragEnd(); }}
        >
          <div style={{ display: "flex", transform: `translateX(${translateX}px)`, transition: (isDragging || noTransition) ? "none" : "transform 0.45s cubic-bezier(0.16,1,0.3,1)", visibility: cardWidth > 0 ? "visible" : "hidden" }}>
            {loopItems.map((p, i) => (
              <CarouselCard key={`${p.id}-${i}`} product={p} onSelect={prod => { if (!hasDragged.current) onSelect(prod); }} cardWidth={cardWidth} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "20px" }}>
          {Array.from({ length: numRealPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: i === realPageIndex ? "22px" : "8px", height: "8px", borderRadius: "4px", background: i === realPageIndex ? CORAL : "#E2E8F0", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ children }) {
  return (
    <footer style={{ borderTop: "1px solid #E8E4DF", marginTop: "64px" }}>
      {children}
      <div style={{ padding: "36px 0 24px" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div style={{ background: CORAL, borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A1A1A" }}>
              Tienda <span style={{ color: CORAL }}>S&K</span>
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#9B948E" }}>
            © 2025 Tienda SYK · Hecho con cuidado en Colombia 🇨🇴
          </p>
          <div className="flex gap-4">
            <a href="/privacidad" className="footer-link" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#9B948E", textDecoration: "none" }}>Privacidad</a>
            <a href="/terminos" className="footer-link" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#9B948E", textDecoration: "none" }}>Términos</a>
            <a href="https://wa.me/573225306651" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#9B948E", textDecoration: "none" }}>Contacto</a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}

// ─── CART ITEM ────────────────────────────────────────────────────────────────
function CartItem({ item, onRemove, onUpdateQty }) {
  const fmtItem = n => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  return (
    <div className="cart-item" style={{ display: "flex", gap: "12px", padding: "12px", background: "#fff", borderRadius: "14px", border: "1px solid #EDE8E2" }}>
      {/* Imagen */}
      <div className="cart-item-img" style={{
        width: "72px", height: "72px", borderRadius: "10px", overflow: "hidden",
        flexShrink: 0, background: item.images?.length > 0 ? "#F5F0EA" : (item.color || "#F5F0EA"),
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
      }}>
        {item.images?.length > 0
          ? <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span>{item.emoji}</span>
        }
      </div>

      {/* Detalle */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Fila nombre + eliminar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
          <div style={{ minWidth: 0 }}>
            <p className="cart-item-name" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13.5px", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.3, margin: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {item.name}
            </p>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11.5px", color: "#9B948E", margin: "2px 0 0" }}>
              {fmtItem(item.price)} c/u
            </p>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            title="Eliminar"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#C0B8B0", padding: "4px", flexShrink: 0, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = CORAL}
            onMouseLeave={e => e.currentTarget.style.color = "#C0B8B0"}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Fila cantidad + precio total */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", background: "#F5F0EA", borderRadius: "20px", overflow: "hidden" }}>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
              style={{ width: "28px", height: "28px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6560" }}
            >
              <Minus size={11} />
            </button>
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", minWidth: "20px", textAlign: "center" }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              disabled={item.stock != null && item.quantity >= item.stock}
              style={{ width: "28px", height: "28px", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6560", cursor: item.stock != null && item.quantity >= item.stock ? "not-allowed" : "pointer", opacity: item.stock != null && item.quantity >= item.stock ? 0.3 : 1 }}
            >
              <Plus size={11} />
            </button>
          </div>
          <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", fontWeight: 800, color: "#1A1A1A" }}>
            {fmtItem(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
// Sanitizadores del formulario de entrega
const cleanName  = v => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ\s\-'.]/g, "").slice(0, 80);
const cleanPhone = v => v.replace(/[^\d+\-\s()]/g, "").slice(0, 15);
const cleanEmail = v => v.replace(/[^\w.+\-@]/g, "").slice(0, 100);
const cleanCity  = v => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-'.]/g, "").slice(0, 60);
const cleanText  = (v, max) => v.replace(/[<>"';&`\\]/g, "").slice(0, max);
const isEmail    = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone    = v => /^[\d\s+\-()]{7,15}$/.test(v.trim());

function CartDrawer({ cart, onClose, onRemove, onUpdateQty, onClearCart, user, coupons }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError]     = useState("");
  const [couponInput, setCouponInput]         = useState("");
  const [couponError, setCouponError]         = useState("");
  const [appliedCoupon, setAppliedCoupon]     = useState(null); // { code, pct }
  const [showPaymentModal, setShowPaymentModal]   = useState(false);
  const [showDeliveryForm, setShowDeliveryForm]   = useState(false);
  const [showOrderSuccess, setShowOrderSuccess]   = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const cartSwipeStartX = useRef(null);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) {
        setHeaderH(document.querySelector("header")?.offsetHeight ?? 0);
      } else {
        setHeaderH(0);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  const [deliveryForm, setDeliveryForm] = useState({ nombre: "", telefono: "", correo: "", notas: "", direccion: "", referencia: "", ciudad: "Medellín", departamento: "Antioquia", adicional: "" });
  const [deliveryErrors, setDeliveryErrors]       = useState({});

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = coupons?.find(c => c.code === code && c.is_active);
    const pct = found ? found.discount_pct : (COUPONS[code] ?? null);
    if (pct == null) {
      setCouponError("Cupón inválido o expirado.");
      return;
    }
    setAppliedCoupon({ code, pct });
    setCouponError("");
    setCouponInput("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          userId:    user?.id    ?? null,
          userEmail: user?.email ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error ?? "Error al crear el pago");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setCheckoutError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal   = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount   = appliedCoupon ? Math.round(subtotal * appliedCoupon.pct / 100) : 0;
  const total      = subtotal - discount;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const fmtCOP     = n => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const FREE_SHIP  = 70000;
  const progress   = Math.min((total / FREE_SHIP) * 100, 100);

  const SEP = "━━━━━━━━━━━━━━━━━━";

  const buildWhatsAppUrl = () => {
    const lines = cart.map(item =>
      `  • ${item.quantity}x ${item.name} — ${fmtCOP(item.price * item.quantity)}`
    ).join("\n");
    let msg = `¡Hola! Quiero hacer un pedido en *Tienda S&K* 🛒\n\n`;
    msg += `${SEP}\n🛒 *PRODUCTOS*\n${SEP}\n${lines}\n`;
    if (appliedCoupon) {
      msg += `\n🏷 Cupón: *${appliedCoupon.code}* (-${appliedCoupon.pct}%)`;
      msg += `\n💸 Descuento: -${fmtCOP(discount)}\n`;
    }
    msg += `\n💰 *Total: ${fmtCOP(total)}*`;
    return `https://wa.me/573225306651?text=${encodeURIComponent(msg)}`;
  };

  const buildDeliveryWhatsAppUrl = () => {
    const lines = cart.map(item =>
      `  • ${item.quantity}x ${item.name} — ${fmtCOP(item.price * item.quantity)}`
    ).join("\n");
    let msg = `¡Hola! Tengo un pedido en *Tienda S&K* 🛒\n\n`;
    msg += `${SEP}\n🛒 *PRODUCTOS*\n${SEP}\n${lines}\n`;
    if (appliedCoupon) {
      msg += `\n🏷 Cupón: *${appliedCoupon.code}* (-${appliedCoupon.pct}%)`;
      msg += `\n💸 Descuento: -${fmtCOP(discount)}\n`;
    }
    msg += `\n💰 *Total: ${fmtCOP(total)}*`;
    msg += `\n✅ Pago: *Contra entrega*\n\n`;
    msg += `${SEP}\n📋 *DATOS DE ENTREGA*\n${SEP}\n\n`;
    msg += `👤 *Nombre:* ${deliveryForm.nombre}\n`;
    msg += `📱 *Teléfono:* ${deliveryForm.telefono}\n`;
    if (deliveryForm.correo)     msg += `📧 *Correo:* ${deliveryForm.correo}\n`;
    msg += `\n📍 *Dirección:* ${deliveryForm.direccion}\n`;
    if (deliveryForm.referencia) msg += `🏠 *Referencia:* ${deliveryForm.referencia}\n`;
    msg += `🌇 *Ciudad:* ${deliveryForm.ciudad}\n`;
    msg += `📌 *Departamento:* ${deliveryForm.departamento}\n`;
    if (deliveryForm.adicional)  msg += `💬 *Info adicional:* ${deliveryForm.adicional}\n`;
    if (deliveryForm.notas)      msg += `\n📝 *Notas del pedido:* ${deliveryForm.notas}\n`;
    return `https://wa.me/573225306651?text=${encodeURIComponent(msg)}`;
  };

  const handleDeliverySubmit = () => {
    const errors = {};
    if (!deliveryForm.nombre.trim() || deliveryForm.nombre.trim().length < 2)      errors.nombre    = "Ingresa el nombre completo (mínimo 2 caracteres)";
    if (!deliveryForm.telefono.trim() || !isPhone(deliveryForm.telefono))          errors.telefono  = "Número no válido (7 a 15 dígitos)";
    if (deliveryForm.correo && !isEmail(deliveryForm.correo))                      errors.correo    = "Correo electrónico no válido";
    if (!deliveryForm.direccion.trim() || deliveryForm.direccion.trim().length < 5) errors.direccion = "Ingresa una dirección válida (mínimo 5 caracteres)";
    if (!deliveryForm.ciudad.trim())                                                errors.ciudad    = "Ciudad requerida";
    if (!deliveryForm.departamento.trim())                                          errors.departamento = "Departamento requerido";
    if (Object.keys(errors).length > 0) { setDeliveryErrors(errors); return; }
    setDeliveryErrors({});
    window.open(buildDeliveryWhatsAppUrl(), "_blank");
    setShowDeliveryForm(false);
    setShowOrderSuccess(true);
  };

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={onClose}
        style={{ position: "fixed", top: headerH, left: 0, right: 0, bottom: 0, zIndex: 700, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      />

      {/* Panel deslizante */}
      <div
        className="cart-drawer"
        onTouchStart={(e) => { cartSwipeStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (cartSwipeStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - cartSwipeStartX.current;
          if (dx > 80) onClose();
          cartSwipeStartX.current = null;
        }}
        style={{
          position: "fixed", top: headerH, right: 0, bottom: 0, zIndex: 701,
          width: "100%", maxWidth: "420px",
          background: "#fff", display: "flex", flexDirection: "column",
          boxShadow: "-12px 0 50px rgba(0,0,0,0.18)",
        }}
      >
        {/* Handle de swipe — solo visible en móvil */}
        <div className="md:hidden" style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", paddingLeft: "6px", zIndex: 10, pointerEvents: "none" }}>
          <div style={{ width: "4px", height: "48px", borderRadius: "4px", background: "rgba(0,0,0,0.12)" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "22px 24px", borderBottom: "1px solid #EDE8E2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "20px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>
              Tu carrito
            </h2>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#9B948E", marginTop: "2px" }}>
              {totalItems} {totalItems === 1 ? "producto" : "productos"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: CORAL, color: "#fff", border: "none",
              borderRadius: "20px", padding: "7px 16px",
              fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 3px 10px rgba(37,99,235,0.3)", transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <X size={13} /> Cerrar
          </button>
        </div>

        {/* Lista de productos */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", background: "#F8F5F2" }}>
          {cart.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: CORAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <ShoppingBag size={32} color={CORAL} />
              </div>
              <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "18px", fontWeight: 700, color: "#1A1A1A", marginBottom: "8px" }}>
                Tu carrito está vacío
              </h3>
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#9B948E", lineHeight: 1.6, maxWidth: "220px" }}>
                Agrega productos que te gusten y aparecerán aquí
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {cart.map(item => (
                <CartItem key={item.id} item={item} onRemove={onRemove} onUpdateQty={onUpdateQty} />
              ))}
            </div>
          )}
        </div>

        {/* Footer con resumen */}
        {cart.length > 0 && (
          <div className="cart-footer" style={{ padding: "14px 18px", borderTop: "1px solid #EDE8E2", display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Barra de envío gratis */}
            <div>
              {total < FREE_SHIP ? (
                <p className="cart-ship-text" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#6B6560", marginBottom: "4px" }}>
                  Agrega <strong style={{ color: CORAL }}>{fmtCOP(FREE_SHIP - total)}</strong> más para envío gratis 🚚
                </p>
              ) : (
                <p className="cart-ship-text" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#2D7A4F", fontWeight: 600, marginBottom: "4px" }}>
                  ✓ ¡Envío gratis aplicado!
                </p>
              )}
              <div style={{ height: "5px", background: "#EDE8E2", borderRadius: "3px" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: total >= FREE_SHIP ? "#2D7A4F" : CORAL, borderRadius: "3px", transition: "width 0.4s ease" }} />
              </div>
            </div>

            {/* Campo de cupón */}
            {appliedCoupon ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(45,122,79,0.08)", border: "1.5px solid rgba(45,122,79,0.25)", borderRadius: "14px", padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Check size={15} color="#2D7A4F" />
                  <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700, color: "#2D7A4F" }}>
                    {appliedCoupon.code} — {appliedCoupon.pct}% aplicado
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}
                >
                  <X size={14} color="#2D7A4F" />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Código de descuento"
                    style={{
                      flex: 1, padding: "10px 14px",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", color: "#1A1A1A",
                      background: "#F5F0EA", border: `1.5px solid ${couponError ? CORAL : "#EDE8E2"}`,
                      borderRadius: "12px", outline: "none",
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    style={{
                      padding: "10px 16px", borderRadius: "12px", border: "1.5px solid #1A1A1A",
                      background: "#1A1A1A", color: "#fff",
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700,
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    Aplicar
                  </button>
                </div>
                {couponError && (
                  <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: CORAL, marginTop: "6px" }}>
                    {couponError}
                  </p>
                )}
              </div>
            )}

            {/* Desglose */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div className="cart-price-row" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#6B6560" }}>Subtotal</span>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#1A1A1A", fontWeight: 600 }}>{fmtCOP(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="cart-price-row" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#2D7A4F" }}>Descuento ({appliedCoupon.pct}%)</span>
                  <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#2D7A4F", fontWeight: 600 }}>− {fmtCOP(discount)}</span>
                </div>
              )}
              <div className="cart-price-row" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#6B6560" }}>Envío</span>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: total >= FREE_SHIP ? "#2D7A4F" : "#1A1A1A", fontWeight: 600 }}>
                  {total >= FREE_SHIP ? "Gratis 🚚" : "A calcular"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #EDE8E2", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A1A1A" }}>Total</span>
                <span className="cart-total-price" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "20px", fontWeight: 800, color: "#1A1A1A" }}>{fmtCOP(total)}</span>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="cart-checkout-btn"
              style={{
                width: "100%", padding: "14px",
                background: CORAL,
                color: "#fff", border: "none", borderRadius: "28px",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
                boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <ShoppingBag size={17} />
              Proceder al pago
            </button>

            {/* Botón seguir viendo — oculto en móvil */}
            <button
              onClick={onClose}
              className="cart-continue-btn"
              style={{
                width: "100%", padding: "10px",
                background: "none", border: `1.5px solid ${CORAL}`,
                color: CORAL, borderRadius: "28px",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", transition: "background 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = CORAL_LIGHT; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              ← Seguir viendo
            </button>

            {checkoutError && (
              <p style={{ textAlign: "center", fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: CORAL, marginTop: "-4px" }}>
                {checkoutError}
              </p>
            )}

            <p className="cart-security-text" style={{ textAlign: "center", fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#9B948E" }}>
              🔒 Pago 100% seguro y encriptado
            </p>
          </div>
        )}

        {/* Modal: opciones de pago */}
        {showPaymentModal && !showDeliveryForm && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div style={{ background: "#fff", borderRadius: "24px", padding: "32px 24px 24px", maxWidth: "360px", width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", animation: "fadeInUp 0.25s ease" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>🛒</div>
              <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "18px", fontWeight: 800, color: "#1A1A1A", margin: "0 0 6px" }}>¿Cómo quieres pagar?</h3>
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#9B948E", margin: "0 0 24px" }}>Elige tu método de pago preferido</p>
              <button
                onClick={() => setShowDeliveryForm(true)}
                style={{ width: "100%", padding: "16px", marginBottom: "12px", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", border: "none", borderRadius: "16px", fontFamily: "var(--font-roboto), sans-serif", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", boxShadow: "0 6px 20px rgba(16,185,129,0.35)" }}
              >
                <span style={{ fontSize: "15px", fontWeight: 700, display: "flex", alignItems: "center", gap: "7px" }}>🛵 Pagar al recibir</span>
                <span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.85 }}>Pagas cuando llegue a tu puerta · Todo Colombia</span>
              </button>
              <div style={{ width: "100%", padding: "14px 16px", marginBottom: "16px", background: "#F8FAFC", border: "1.5px dashed #CBD5E1", borderRadius: "16px", boxSizing: "border-box" }}>
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", fontWeight: 700, color: "#94A3B8", margin: "0 0 3px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>💳 Pagar ahora mismo</p>
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#94A3B8", margin: 0 }}>Tarjeta / PSE · Próximamente disponible</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ width: "100%", padding: "13px", background: "transparent", color: "#9B948E", border: "1.5px solid #E8E3DE", borderRadius: "28px", fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-roboto), sans-serif", cursor: "pointer" }}>
                Volver al carrito
              </button>
            </div>
          </div>
        )}

        {/* Pantalla de éxito */}
        {showOrderSuccess && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", animation: "fadeInUp 0.3s ease" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
            <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "20px", fontWeight: 800, color: "#1A1A1A", margin: "0 0 12px" }}>¡Pedido enviado!</h3>
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#64748B", lineHeight: 1.65, margin: "0 0 32px", maxWidth: "280px" }}>
              Tu compra continuará por <strong style={{ color: "#25D366" }}>WhatsApp</strong> con uno de nuestros asesores. ¡Estamos listos para atenderte!
            </p>
            <button
              onClick={() => { onClearCart(); setShowOrderSuccess(false); setShowPaymentModal(false); setDeliveryForm({ nombre: "", telefono: "", correo: "", notas: "", direccion: "", referencia: "", ciudad: "Medellín", departamento: "Antioquia", adicional: "" }); onClose(); }}
              style={{ width: "100%", maxWidth: "280px", padding: "15px", background: CORAL, color: "#fff", border: "none", borderRadius: "28px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 20px rgba(37,99,235,0.35)` }}
            >
              Seguir viendo productos
            </button>
          </div>
        )}

        {/* Modal: formulario de entrega */}
        {showPaymentModal && showDeliveryForm && (
          <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "#fff", display: "flex", flexDirection: "column", colorScheme: "light" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <button onClick={() => { setShowDeliveryForm(false); setDeliveryErrors({}); }} style={{ background: "#F1F5F9", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#475569", fontWeight: 600 }}>← Volver</button>
              <div>
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 800, color: "#1A1A1A", margin: 0 }}>Datos de entrega</p>
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#059669", margin: 0, fontWeight: 600 }}>🛵 Pago contra entrega</p>
              </div>
            </div>

            <div className="delivery-form" style={{ flex: 1, overflowY: "auto", padding: "16px 20px", WebkitOverflowScrolling: "touch" }}>
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "10px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px" }}>Contacto</p>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Nombre de quien recibe *</label>
                <input value={deliveryForm.nombre} onChange={e => setDeliveryForm(f => ({ ...f, nombre: cleanName(e.target.value) }))} placeholder="Ej: Juan García" maxLength={80} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${deliveryErrors.nombre ? "#EF4444" : "#E2E8F0"}`, borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
                {deliveryErrors.nombre && <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#EF4444", margin: "3px 0 0" }}>{deliveryErrors.nombre}</p>}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Teléfono *</label>
                <input value={deliveryForm.telefono} onChange={e => setDeliveryForm(f => ({ ...f, telefono: cleanPhone(e.target.value) }))} placeholder="Ej: 3001234567" type="tel" maxLength={15} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${deliveryErrors.telefono ? "#EF4444" : "#E2E8F0"}`, borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
                {deliveryErrors.telefono && <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#EF4444", margin: "3px 0 0" }}>{deliveryErrors.telefono}</p>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Correo electrónico</label>
                <input value={deliveryForm.correo} onChange={e => setDeliveryForm(f => ({ ...f, correo: cleanEmail(e.target.value) }))} placeholder="Ej: correo@email.com" type="email" maxLength={100} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${deliveryErrors.correo ? "#EF4444" : "#E2E8F0"}`, borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
                {deliveryErrors.correo && <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#EF4444", margin: "3px 0 0" }}>{deliveryErrors.correo}</p>}
              </div>

              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "10px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px" }}>Dirección de entrega</p>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Dirección completa *</label>
                <input value={deliveryForm.direccion} onChange={e => setDeliveryForm(f => ({ ...f, direccion: cleanText(e.target.value, 200) }))} placeholder="Ej: Calle 80 #45-32, Apto 201" maxLength={200} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${deliveryErrors.direccion ? "#EF4444" : "#E2E8F0"}`, borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
                {deliveryErrors.direccion && <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#EF4444", margin: "3px 0 0" }}>{deliveryErrors.direccion}</p>}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Punto de referencia</label>
                <input value={deliveryForm.referencia} onChange={e => setDeliveryForm(f => ({ ...f, referencia: cleanText(e.target.value, 150) }))} placeholder="Ej: Cerca al Éxito de la 80" maxLength={150} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Ciudad *</label>
                  <input value={deliveryForm.ciudad} onChange={e => setDeliveryForm(f => ({ ...f, ciudad: cleanCity(e.target.value) }))} maxLength={60} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${deliveryErrors.ciudad ? "#EF4444" : "#E2E8F0"}`, borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
                  {deliveryErrors.ciudad && <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#EF4444", margin: "3px 0 0" }}>{deliveryErrors.ciudad}</p>}
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Departamento *</label>
                  <input value={deliveryForm.departamento} onChange={e => setDeliveryForm(f => ({ ...f, departamento: cleanCity(e.target.value) }))} maxLength={60} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${deliveryErrors.departamento ? "#EF4444" : "#E2E8F0"}`, borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
                  {deliveryErrors.departamento && <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#EF4444", margin: "3px 0 0" }}>{deliveryErrors.departamento}</p>}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Información adicional</label>
                <input value={deliveryForm.adicional} onChange={e => setDeliveryForm(f => ({ ...f, adicional: cleanText(e.target.value, 200) }))} placeholder="Ej: Llamar antes de llegar" maxLength={200} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A" }} />
              </div>

              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "10px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px" }}>Notas del pedido</p>

              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "4px" }}>Instrucciones especiales</label>
                <textarea value={deliveryForm.notas} onChange={e => setDeliveryForm(f => ({ ...f, notas: cleanText(e.target.value, 500) }))} placeholder="Color preferido, empaque especial, etc." rows={3} maxLength={500} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", outline: "none", boxSizing: "border-box", background: "#FAFBFC", color: "#1A1A1A", resize: "none" }} />
              </div>
            </div>

            <div style={{ padding: "14px 20px 18px", borderTop: "1px solid #F1F5F9", flexShrink: 0 }}>
              <button
                onClick={handleDeliverySubmit}
                style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", border: "none", borderRadius: "28px", fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 6px 20px rgba(16,185,129,0.35)" }}
              >
                🛵 Confirmar pedido por WhatsApp
              </button>
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#94A3B8", textAlign: "center", margin: "8px 0 0" }}>Te enviaremos a WhatsApp para confirmar</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({ product, wishlisted, onWishlist, onAddToCart, onClose, user, onDelete, onEdit, onToggleActive }) {
  const [selectedImg, setSelectedImg]     = useState(0);
  const [added, setAdded]                 = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shared, setShared]               = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError]     = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab]         = useState("descripcion");
  const [headerH, setHeaderH]             = useState(0);
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  const [dragX, setDragX]       = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) {
        setHeaderH(document.querySelector("header")?.offsetHeight ?? 0);
      } else {
        setHeaderH(0);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const isOwner = !!user && ADMIN_EMAILS.has(user.email);
  const imgs    = product.images?.length > 0 ? product.images : null;
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

  const handleImgTouchStart = (e) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const handleImgTouchMove = (e) => {
    if (swipeStartX.current === null || !imgs || imgs.length < 2) return;
    const dx = e.touches[0].clientX - swipeStartX.current;
    const dy = Math.abs(e.touches[0].clientY - swipeStartY.current);
    if (Math.abs(dx) < dy) return;
    const atEdge = (selectedImg === 0 && dx > 0) || (selectedImg === imgs.length - 1 && dx < 0);
    setDragX(atEdge ? dx / 3 : dx);
  };
  const handleImgTouchEnd = (e) => {
    setDragging(false);
    setDragX(0);
    if (swipeStartX.current === null || !imgs || imgs.length < 2) {
      swipeStartX.current = null; swipeStartY.current = null; return;
    }
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY.current);
    if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
      if (dx < 0) setSelectedImg(i => Math.min(i + 1, imgs.length - 1));
      else         setSelectedImg(i => Math.max(i - 1, 0));
    }
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleShare = async () => {
    const url     = window.location.href;
    const text    = `¡Mira este producto! *${product.name}* — ${fmt(product.price)} 🛍️`;
    const payload = { title: product.name, text, url };
    if (navigator.share && navigator.canShare?.(payload)) {
      await navigator.share(payload).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", top: headerH, left: 0, right: 0, bottom: 0, zIndex: 500,
        background: "rgba(15,15,15,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "16px",
        overflow: "hidden",
      }}
    >
      <div
        className="modal-inner"
        style={{
          background: "#fff",
          borderRadius: isMobile ? "20px 20px 0 0" : "24px",
          width: "100%", maxWidth: "880px",
          maxHeight: isMobile ? "100%" : "92vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          position: "relative",
          boxShadow: "0 40px 100px rgba(0,0,0,0.28)",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px", zIndex: 10,
            background: "rgba(255,255,255,0.95)", border: "none", borderRadius: "50%",
            width: "38px", height: "38px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
          }}
        >
          <X size={16} />
        </button>

        {/* ── Galería ── */}
        <div
          className="modal-gallery"
          style={{
            flex: isMobile ? "none" : "0 0 48%",
            padding: isMobile ? "16px" : "24px",
            display: "flex", flexDirection: "column", gap: "10px",
            background: "#FAF7F4",
            borderRadius: isMobile ? "20px 20px 0 0" : "24px 0 0 24px",
            flexShrink: 0,
          }}
        >
          <div
            onTouchStart={handleImgTouchStart}
            onTouchMove={handleImgTouchMove}
            onTouchEnd={handleImgTouchEnd}
            style={{
              borderRadius: "16px", overflow: "hidden",
              height: isMobile ? 260 : 340,
              flexShrink: 0,
              position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: imgs ? "#fff" : (product.color || "#F5F0EA"),
              fontSize: isMobile ? "80px" : "96px", border: "1px solid #EDE8E2",
              touchAction: "pan-y",
              userSelect: "none",
            }}
          >
            {imgs ? (
              isMobile && imgs.length > 1 ? (
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  width: `${imgs.length * 100}%`, height: "100%",
                  display: "flex",
                  transform: `translateX(calc(-${(selectedImg / imgs.length) * 100}% + ${dragX}px))`,
                  transition: dragging ? "none" : "transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  willChange: "transform",
                }}>
                  {imgs.map((src, i) => (
                    <div key={i} style={{ width: `${100 / imgs.length}%`, height: "100%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={src} alt={product.name} draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </div>
                  ))}
                </div>
              ) : (
                <img src={imgs[selectedImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
              )
            ) : (
              <span style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.14))" }}>{product.emoji}</span>
            )}
          </div>

          {/* Puntos indicadores (móvil) / miniaturas (desktop) */}
          {imgs && imgs.length > 1 && (
            isMobile ? (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", paddingTop: "2px" }}>
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      width: selectedImg === i ? "20px" : "8px",
                      height: "8px",
                      borderRadius: "4px",
                      background: selectedImg === i ? CORAL : "#D0C8BF",
                      border: "none", padding: 0, cursor: "pointer",
                      transition: "width 0.2s ease, background 0.2s ease",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      width: "68px", height: "68px", borderRadius: "10px",
                      overflow: "hidden", padding: 0, cursor: "pointer",
                      border: selectedImg === i ? `2.5px solid ${CORAL}` : "2px solid #E0D8CC",
                      background: "none", flexShrink: 0, transition: "border 0.15s",
                    }}
                  >
                    <img src={src} alt={`foto-${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* ── Info ── */}
        <div
          style={{
            flex: 1,
            padding: isMobile ? "20px 20px 80px" : "36px 32px",
            display: "flex", flexDirection: "column", gap: "18px",
          }}
        >
          {product.badge && (
            <span style={{
              display: "inline-block", width: "fit-content",
              background: product.badge.startsWith("−") ? CORAL : "#1A1A1A",
              color: "#fff",
              fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700,
              padding: "5px 13px", borderRadius: "20px",
            }}>
              {product.badge}
            </span>
          )}

          <h2 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "26px", fontWeight: 800, color: "#1A1A1A", lineHeight: 1.2, margin: 0 }}>
            {product.name}
          </h2>

          {product.rating != null && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={15}
                    fill={s <= Math.round(product.rating) ? "#F5A623" : "#EDE8E2"}
                    color={s <= Math.round(product.rating) ? "#F5A623" : "#EDE8E2"}
                  />
                ))}
              </div>
              <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#6B6560", fontWeight: 500 }}>
                {product.rating} · {product.reviews} reseñas
              </span>
            </div>
          )}

          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "34px", fontWeight: 800, color: product.oldPrice ? CORAL : "#1A1A1A" }}>
                {fmt(product.price)}
              </span>
              {product.oldPrice && (
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "17px", color: "#9B948E", textDecoration: "line-through" }}>
                  {fmt(product.oldPrice)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#2D7A4F", fontWeight: 600, marginTop: "4px" }}>
                ¡Ahorras {fmt(savings)}!
              </p>
            )}
          </div>

          {/* ── Tabs descripción / especificaciones / resumen ── */}
          <div>
            <div style={{ display: "flex", borderBottom: "2px solid #EDE8E2", marginBottom: "14px" }}>
              {["descripcion", "especificaciones", "resumen"].map((tab) => {
                const label = tab === "descripcion" ? "Descripción" : tab === "especificaciones" ? "Especificaciones" : "Resumen";
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontFamily: "var(--font-roboto), sans-serif",
                      fontSize: "13px", fontWeight: active ? 700 : 500,
                      color: active ? CORAL : "#9B948E",
                      background: "none", border: "none", cursor: "pointer",
                      padding: "8px 16px 10px",
                      borderBottom: active ? `2.5px solid ${CORAL}` : "2.5px solid transparent",
                      marginBottom: "-2px", transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {activeTab === "descripcion" && (
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#5A5A5A", lineHeight: 1.75, margin: 0 }}>
                {product.description || "Este producto no tiene descripción."}
              </p>
            )}

            {activeTab === "especificaciones" && (
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#5A5A5A", lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
                {product.specifications || "Este producto aún no tiene especificaciones."}
              </p>
            )}

            {activeTab === "resumen" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {[
                  { label: "Categoría",      value: product.category || "General" },
                  { label: "Precio",         value: fmt(product.price) },
                  ...(product.oldPrice ? [{ label: "Precio anterior", value: fmt(product.oldPrice) }] : []),
                  { label: "Disponibilidad", value: product.stock > 5 ? "En stock" : product.stock > 0 ? `Solo ${product.stock} disponibles` : "Agotado" },
                  { label: "Garantía",       value: "10 días" },
                  { label: "Envío gratis",   value: "En compras mayores a $70.000" },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #F0EBE5",
                      background: i % 2 === 0 ? "transparent" : "#FAF7F4",
                      borderRadius: "4px", paddingLeft: i % 2 !== 0 ? "8px" : "0",
                      paddingRight: i % 2 !== 0 ? "8px" : "0",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#9B948E", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#1A1A1A", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {product.stock > 0 && product.stock < 5 && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FFF0EE", borderRadius: "12px", padding: "11px 16px" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: CORAL, flexShrink: 0, animation: "pulse-dot 1.5s ease infinite" }} />
              <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700, color: CORAL }}>
                ¡Solo quedan {product.stock} {product.stock === 1 ? "unidad" : "unidades"}! Cómpralo antes de que se agote.
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => onWishlist(product.id)}
              title={wishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
              style={{
                width: "50px", height: "50px", flexShrink: 0, borderRadius: "50%",
                border: `1.5px solid ${wishlisted ? CORAL : "#E0D8CC"}`,
                background: wishlisted ? CORAL_LIGHT : "#fff",
                color: wishlisted ? CORAL : "#9B948E",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.18s",
              }}
            >
              <Heart size={19} fill={wishlisted ? CORAL : "none"} />
            </button>
            <button
              onClick={handleShare}
              title="Compartir producto"
              style={{
                width: "50px", height: "50px", flexShrink: 0, borderRadius: "50%",
                border: `1.5px solid ${shared ? "#2D7A4F" : "#E0D8CC"}`,
                background: shared ? "rgba(45,122,79,0.10)" : "#fff",
                color: shared ? "#2D7A4F" : "#9B948E",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.18s",
              }}
            >
              {shared ? <Check size={19} /> : <Share2 size={19} />}
            </button>
            <button
              onClick={handleAdd}
              style={{
                flex: 1, padding: "15px",
                background: added ? "#2D7A4F" : CORAL,
                color: "#fff", border: "none", borderRadius: "28px",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", transition: "background 0.25s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
                boxShadow: added ? "0 8px 24px rgba(45,122,79,0.35)" : "0 8px 24px rgba(37,99,235,0.35)",
              }}
            >
              <ShoppingBag size={18} />
              {added ? "✓ Añadido al carrito" : "Agregar al carrito"}
            </button>
          </div>

          <div style={{ borderTop: "1px solid #EDE8E2", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: Truck,    text: "Envío gratis en compras mayores a $70.000" },
              { icon: ShoppingBag, text: "Puedes pagar al recibir" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: CORAL_LIGHT, borderRadius: "8px", width: "32px", height: "32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} color={CORAL} />
                </div>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12.5px", color: "#6B6560" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Zona de administrador — solo visible para el dueño */}
          {isOwner && (
            <div style={{ borderTop: "2px dashed #EDE8E2", paddingTop: "16px" }}>
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", fontWeight: 700, color: "#9B948E", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px" }}>
                Administrar producto
              </p>

              {/* Toggle activo / inactivo */}
              <button
                disabled={toggleLoading}
                onClick={async () => {
                  setToggleLoading(true);
                  setToggleError("");
                  const err = await onToggleActive?.(product.id, product.is_active ?? true);
                  setToggleLoading(false);
                  if (err) {
                    setToggleError("No se pudo cambiar el estado. Verifica los permisos en Supabase.");
                    return;
                  }
                  onClose();
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  width: "100%", padding: "12px 16px", marginBottom: "6px",
                  background: product.is_active !== false ? "#FFF9F0" : "#F0FDF4",
                  border: `1.5px solid ${product.is_active !== false ? "#FFCC80" : "#86EFAC"}`,
                  borderRadius: "12px", cursor: toggleLoading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px",
                  fontWeight: 600, color: product.is_active !== false ? "#E65100" : "#15803D",
                  justifyContent: "center", transition: "all 0.15s",
                  opacity: toggleLoading ? 0.65 : 1,
                }}
              >
                {toggleLoading ? "Guardando..." : product.is_active !== false ? "⏸ Desactivar (ocultarlo)" : "▶ Activar (mostrarlo)"}
              </button>
              {toggleError && (
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#E53E3E", marginBottom: "10px", textAlign: "center" }}>
                  ⚠️ {toggleError}
                </p>
              )}

              {/* Botón editar */}
              <button
                onClick={() => { onClose(); onEdit?.(product); }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  width: "100%", padding: "12px 16px", marginBottom: "10px",
                  background: "rgba(13,61,181,0.07)", border: `1.5px solid ${BLUE}`,
                  borderRadius: "12px", cursor: "pointer",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px",
                  fontWeight: 600, color: BLUE, transition: "all 0.15s",
                  justifyContent: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(13,61,181,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(13,61,181,0.07)"; }}
              >
                <Pencil size={15} /> Editar producto
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    width: "100%", padding: "12px 16px",
                    background: "#FFF0EE", border: "1.5px solid #fcd5cf",
                    borderRadius: "12px", cursor: "pointer",
                    fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px",
                    fontWeight: 600, color: CORAL, transition: "all 0.15s",
                    justifyContent: "center",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ffe0dc"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#FFF0EE"; }}
                >
                  <Trash2 size={16} /> Eliminar este producto
                </button>
              ) : (
                <div style={{ background: "#FFF0EE", borderRadius: "12px", padding: "16px", border: "1.5px solid #fcd5cf" }}>
                  <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13.5px", fontWeight: 700, color: CORAL, marginBottom: "4px" }}>
                    ¿Eliminar permanentemente?
                  </p>
                  <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#9B948E", marginBottom: "14px" }}>
                    Esta acción no se puede deshacer.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{ flex: 1, padding: "10px", border: "1.5px solid #E0D8CC", borderRadius: "10px", background: "#fff", fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "#6B6560" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: CORAL, fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <Trash2 size={14} /> Sí, eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ isOpen, onClose }) {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://tiendasyk.store" },
    });
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: "https://tiendasyk.store" },
    });
    setLoading(false);
    if (err) setError("No se pudo enviar el enlace. Intenta de nuevo.");
    else setSent(true);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: "20px", padding: "36px 32px", width: "100%", maxWidth: "400px", position: "relative" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex" }}>
          <X size={20} />
        </button>

        <h2 style={{ fontFamily: F_DISPLAY, fontSize: "22px", fontWeight: 700, color: BLUE, marginBottom: "6px" }}>
          Iniciar sesión
        </h2>
        <p style={{ fontFamily: F_PRICE, fontSize: "13px", color: "#64748B", marginBottom: "28px" }}>
          Elige cómo quieres ingresar a tu cuenta
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", padding: "13px 20px", border: "1.5px solid #E2E8F0", borderRadius: "12px", background: "#fff", cursor: "pointer", fontFamily: F_PRICE, fontSize: "14px", fontWeight: 600, color: BLUE, marginBottom: "20px", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        {/* Divisor */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          <span style={{ fontFamily: F_PRICE, fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>o usa tu correo</span>
          <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
        </div>

        {/* Magic link */}
        {sent ? (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📬</div>
            <p style={{ fontFamily: F_PRICE, fontSize: "14px", fontWeight: 700, color: "#15803D", marginBottom: "4px" }}>¡Enlace enviado!</p>
            <p style={{ fontFamily: F_PRICE, fontSize: "13px", color: "#166534" }}>
              Revisa tu correo <strong>{email}</strong> y haz clic en el enlace para ingresar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink}>
            <input
              type="email"
              placeholder="tucorreo@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "13px 16px", border: "1.5px solid #E2E8F0", borderRadius: "12px", fontFamily: F_PRICE, fontSize: "14px", color: BLUE, outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
              onFocus={e => e.target.style.borderColor = CORAL}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
            {error && <p style={{ fontFamily: F_PRICE, fontSize: "12px", color: "#EF4444", marginBottom: "10px" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "13px", background: CORAL, color: "#fff", border: "none", borderRadius: "12px", fontFamily: F_PRICE, fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s" }}
            >
              {loading ? "Enviando…" : "Enviar enlace de acceso"}
            </button>
          </form>
        )}

        <p style={{ fontFamily: F_PRICE, fontSize: "11px", color: "#94A3B8", textAlign: "center", marginTop: "20px" }}>
          Solo para administradores de Tienda S&K
        </p>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeCategory, setActiveCategory]   = useState("all");

  const handleNavCategorySelect = (id) => {
    setActiveCategory(id);
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [searchQuery, setSearchQuery]         = useState("");
  const [sortBy, setSortBy]                   = useState("newest");
  const [cart, setCart]                       = useState(() => {
    try {
      const saved = localStorage.getItem("sk_cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showCart, setShowCart]               = useState(false);
  const [menuOpen, setMenuOpen]               = useState(false);
  const [wishlist, setWishlist]               = useState([]);
  const [user, setUser]                       = useState(null);
  const [showPublish, setShowPublish]         = useState(false);
  const [showUncategorized, setShowUncategorized] = useState(false);
  const [showCouponManager, setShowCouponManager] = useState(false);
  const [dbCoupons, setDbCoupons]             = useState([]);
  const [dbProducts, setDbProducts]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [showScrollTop, setShowScrollTop]     = useState(false);
  const [cartBounce, setCartBounce]           = useState(false);
  const [showLoginModal, setShowLoginModal]   = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    try { localStorage.setItem("sk_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setDbProducts(data ?? []);
    setLoadingProducts(false);
  };

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setDbCoupons(data);
  };

  const handleToggleActive = async (productId, currentState) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentState })
      .eq("id", productId);
    if (error) return error;
    fetchProducts();
    return null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN")       setUser(session?.user ?? null);
      if (event === "SIGNED_OUT")      setUser(null);
      if (event === "TOKEN_REFRESHED") setUser(session?.user ?? null);
    });

    fetchProducts();
    fetchCoupons();

    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "products" }, fetchProducts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogin = () => setShowLoginModal(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isAdmin = !!user && ADMIN_EMAILS.has(user.email);

  const displayProducts = dbProducts.length > 0
    ? dbProducts.map(p => ({
        id:             p.id,
        category:       p.category,
        name:           p.name,
        price:          p.price,
        oldPrice:       p.old_price ?? null,
        badge:          p.badge,
        images:         p.images ?? [],
        description:    p.description,
        specifications: p.specifications ?? null,
        stock:          p.stock,
        is_active:      p.is_active ?? true,
        user_id:        p.user_id,
        created_at:     p.created_at,
      }))
    : PRODUCTS;

  const filteredProducts = displayProducts.filter(p => {
    if (!isAdmin && !p.is_active) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.badge?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (activeCategory === "favoritos") return wishlist.includes(p.id);
    if (activeCategory === "ofertas")   return p.oldPrice != null && p.oldPrice > p.price;
    return activeCategory === "all" || p.category === activeCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc")  return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (!a.created_at || !b.created_at) return 0;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const heroStats = {
    products:   dbProducts.length,
    categories: new Set(dbProducts.map(p => p.category)).size,
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (product.stock != null && existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 600);
  };

  const handleDeleteProduct = async (productId) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (!error) {
      setSelectedProduct(null);
      fetchProducts();
    }
  };

  const handleRemoveFromCart = (productId) =>
    setCart(prev => prev.filter(item => item.id !== productId));

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) { handleRemoveFromCart(productId); return; }
    setCart(prev =>
      prev.map(item => {
        if (item.id !== productId) return item;
        const max = item.stock != null ? item.stock : newQty;
        return { ...item, quantity: Math.min(newQty, max) };
      })
    );
  };

  const toggleWishlist = (id) => setWishlist(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F4; }

        /* ── Grid ── */
        .grid-products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          width: 100%;
        }
        @media (max-width: 1200px) {
          .grid-products { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 800px) {
          .grid-products { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 480px) {
          .grid-products { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }

        /* ── Carrito: animaciones ── */
        @keyframes cart-bounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.35) rotate(-8deg); }
          60%  { transform: scale(1.15) rotate(6deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes badge-pop {
          0%   { transform: scale(0.5); opacity: 0.5; }
          60%  { transform: scale(1.4); }
          100% { transform: scale(1); opacity: 1; }
        }
        .cart-bounce { animation: cart-bounce 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
        .badge-pop   { animation: badge-pop 0.4s cubic-bezier(0.36,0.07,0.19,0.97); }

        /* ── Keyframes ── */
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-14px) rotate(4deg); }
          66%      { transform: translateY(-7px) rotate(-3deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes shimmer-btn {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.55); }
          60%     { box-shadow: 0 0 0 7px rgba(37,99,235,0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes gradientMove {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }

        /* ── Skeleton shimmer ── */
        @keyframes skeleton-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #EDE8E2 25%, #E0DAD3 50%, #EDE8E2 75%);
          background-size: 600px 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }

        /* ── Animaciones de entrada ── */
        .fade-up   { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-2 { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
        .fade-up-3 { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.24s both; }
        .fade-up-4 { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.36s both; }

        /* ── Product card ── */
        .product-card {
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease;
          cursor: pointer;
        }
        .pc-price-row {
          display: flex; align-items: center; justify-content: space-between;
        }
        .pc-price { font-size: 16px; }
        .pc-old-price { font-size: 12px; }
        .pc-add-btn { padding: 7px 14px; font-size: 12px; }
        @media (max-width: 480px) {
          .pc-img-wrap { height: 190px !important; font-size: 52px !important; }
          .pc-body { padding: 10px !important; }
          .pc-price-row { flex-direction: column; align-items: flex-start; gap: 6px; }
          .pc-prices { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; }
          .pc-price { font-size: 13px; }
          .pc-old-price { font-size: 11px; margin-left: 0 !important; }
          .pc-add-btn { width: 100%; text-align: center; padding: 12px 10px; font-size: 13px; }
        }
        @media (hover: hover) {
          .product-card:hover {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 24px 56px rgba(26,26,26,0.14) !important;
          }
          .product-card:hover .pc-img { transform: scale(1.09); }
          .product-card:hover .pc-overlay { transform: translateY(0); }
        }
        .pc-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .pc-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 18px 12px 14px;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          transform: translateY(102%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          display: flex; align-items: center; justify-content: center; gap: 6px;
          pointer-events: none;
        }
        @media (max-width: 800px) {
          .pc-overlay { display: none !important; }
        }

        /* ── Botones flotantes: barra inferior en móvil y laptops pequeños ── */
        @media (max-width: 1380px) {
          .floating-btns {
            position: fixed !important;
            bottom: 0 !important; left: 0 !important; right: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 28px !important;
            padding: 10px 20px 18px !important;
            background: rgba(255,255,255,0.97) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border-top: 1px solid rgba(0,0,0,0.07) !important;
            z-index: 900 !important;
          }
          .floating-btns > a,
          .floating-btns > button {
            position: static !important;
            width: 48px !important;
            height: 48px !important;
            flex-shrink: 0 !important;
          }
          footer { padding-bottom: 90px !important; }
        }

        /* ── Carousel ── */

        /* ── Shimmer CTA ── */
        .shimmer-cta {
          background: linear-gradient(90deg,#2563EB 25%,#60A5FA 50%,#2563EB 75%);
          background-size: 200% auto;
          animation: shimmer-btn 2.8s linear infinite;
        }

        /* ── Pulse dot ── */
        .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }

        /* ── Cart drawer ── */
        .cart-drawer { animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1); }

        /* Evita zoom automático en iOS al enfocar inputs del formulario de entrega */
        .delivery-form input,
        .delivery-form textarea {
          font-size: 16px !important;
        }

        /* ── Header móvil ── */
        @media (max-width: 767px) {
          .nav-logo      { height: 38px !important; max-width: 96px; object-fit: contain; }
          .nav-logo-wrap { height: 38px !important; }
          .login-btn-pill { padding: 8px 10px !important; }

          /* Main catalog padding */
          .main-catalog  { padding: 20px 16px 0 !important; }

          /* Catalog heading */
          .catalog-title { font-size: 22px !important; }
          .catalog-label { display: none !important; }

          /* Hero mobile — stacked layout */
          .hero-section { padding: 20px 16px 24px !important; }
          .hero-inner   { padding: 0 !important; flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .hero-left    { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; width: 100% !important; }
          .hero-title   { font-size: 28px !important; white-space: normal !important; line-height: 1.2 !important; }
          .hero-right   { width: 100% !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; flex-wrap: nowrap !important; gap: 12px !important; }
          .hero-cta     { padding: 12px 18px !important; font-size: 14px !important; white-space: nowrap !important; }

          /* Banner */
          .promo-banner  { margin: 20px 0 !important; }

          /* Carrusel nav buttons */
          .carousel-nav-btn { width: 44px !important; height: 44px !important; }

          /* Footer links */
          .footer-link   { padding: 8px 6px !important; display: inline-block; }

          /* Ocultar scroll-top en la barra flotante inferior */
          .scroll-top-btn { display: none !important; }
        }

        /* ── Banner mobile — apilar verticalmente ── */
        @media (max-width: 560px) {
          .promo-banner { flex-direction: column !important; align-items: stretch !important; padding: 18px 16px !important; gap: 14px !important; }
          .promo-banner-btn { justify-content: center !important; padding: 12px 16px !important; font-size: 13px !important; border-radius: 14px !important; }
        }

        /* Product card imagen más alta en móvil */
        @media (max-width: 480px) {
          .pc-img-wrap  { height: 190px !important; font-size: 52px !important; }
          .pc-wishlist  { width: 40px !important; height: 40px !important; }
          .pc-add-btn   { font-size: 12px !important; padding: 8px 10px !important; }
          .pc-body      { padding: 12px !important; }
        }

        /* ── Cart items y footer compacto en móvil ── */
        @media (max-width: 767px) {
          .cart-footer       { padding: 10px 14px 90px !important; gap: 8px !important; }
          .cart-ship-text    { font-size: 11px !important; }
          .cart-price-row span { font-size: 12px !important; }
          .cart-total-price  { font-size: 17px !important; }
          .cart-checkout-btn { padding: 12px !important; font-size: 14px !important; }
          .cart-continue-btn { display: none !important; }
          .cart-security-text { display: none !important; }
          .cart-item         { padding: 10px !important; gap: 10px !important; }
          .cart-item-img     { width: 60px !important; height: 60px !important; }
          .cart-item-name    { font-size: 13px !important; }
        }

        /* ── Category pill hover ── */
        .cat-pill { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .cat-pill:hover { transform: scale(1.05); }

        /* ── Category scroll (móvil) — ocultar scrollbar ── */
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .cat-scroll::-webkit-scrollbar { display: none; }

        /* ── Stat card ── */
        .stat-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.15) !important;
        }

        /* ── Responsive modal ── */
        @media (max-width: 640px) {
          .modal-inner   { flex-direction: column !important; }
          .modal-gallery { border-radius: 24px 24px 0 0 !important; flex: unset !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#FAF7F4" }}>
        <Navbar
          cartCount={cartCount}
          cartBounce={cartBounce}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activeCategory={activeCategory}
          setActiveCategory={handleNavCategorySelect}
          user={user}
          isAdmin={!!user && ADMIN_EMAILS.has(user.email)}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onPublish={() => setShowPublish(true)}
          onUncategorized={() => setShowUncategorized(true)}
          onCouponManager={() => setShowCouponManager(true)}
          onCartOpen={() => setShowCart(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

        {showCart && (
          <CartDrawer
            cart={cart}
            onClose={() => setShowCart(false)}
            onRemove={handleRemoveFromCart}
            onUpdateQty={handleUpdateQty}
            onClearCart={() => setCart([])}
            user={user}
            coupons={dbCoupons}
          />
        )}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            wishlisted={wishlist.includes(selectedProduct.id)}
            onWishlist={toggleWishlist}
            onAddToCart={handleAddToCart}
            onClose={() => setSelectedProduct(null)}
            user={user}
            onDelete={handleDeleteProduct}
            onEdit={setEditingProduct}
            onToggleActive={handleToggleActive}
          />
        )}

        {showPublish && (
          <PublishModal
            user={user}
            onClose={() => setShowPublish(false)}
            onPublished={() => setTimeout(fetchProducts, 800)}
          />
        )}

        {showUncategorized && (
          <UncategorizedPanel
            onClose={() => setShowUncategorized(false)}
            onCategoryChanged={fetchProducts}
          />
        )}

        {showCouponManager && (
          <CouponManager
            coupons={dbCoupons}
            onClose={() => setShowCouponManager(false)}
            onChanged={fetchCoupons}
          />
        )}

        {isAdmin && <AdminStatsBar dbProducts={dbProducts} />}

        {editingProduct && (
          <EditModal
            product={editingProduct}
            user={user}
            onClose={() => setEditingProduct(null)}
            onSaved={() => { fetchProducts(); setEditingProduct(null); }}
          />
        )}

        <Hero onShop={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })} stats={heroStats} />

        <ProductCarousel
          products={dbProducts.map(p => ({ id: p.id, name: p.name, badge: p.badge, images: p.images ?? [], color: null, emoji: p.emoji }))}
          onSelect={p => setSelectedProduct(displayProducts.find(dp => dp.id === p.id) ?? p)}
        />

        <main className="main-catalog" style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "32px 32px 0", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <p className="catalog-label" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#9B948E", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
                {searchQuery.trim() ? "Búsqueda" : "Catálogo"}
              </p>
              <h2 className="catalog-title" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "30px", fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.5px" }}>
                {searchQuery.trim()
                  ? <>Resultados para <span style={{ color: CORAL }}>"{searchQuery.trim()}"</span></>
                  : activeCategory === "ofertas" ? <><span style={{ color: CORAL }}>🔥</span> Ofertas especiales</>
                  : activeCategory === "all" ? "Todos los productos" : ALL_CATEGORIES.find(c => c.id === activeCategory)?.label
                }
              </h2>
            </div>
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#9B948E" }}>
              {sortedProducts.length} {sortedProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          <div id="productos" style={{ marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <CategoryPills active={activeCategory} onChange={setActiveCategory} />
            <div style={{ position: "relative", flexShrink: 0 }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  fontFamily: "var(--font-roboto), sans-serif",
                  fontSize: "13px",
                  color: "#4A4A4A",
                  background: "#F5F0EA",
                  border: "1.5px solid #EDE8E2",
                  borderRadius: "20px",
                  padding: "8px 36px 8px 14px",
                  appearance: "none",
                  WebkitAppearance: "none",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
              </select>
              <ChevronDown size={14} color="#9B948E" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          {loadingProducts ? (
            <div className="grid-products">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <EmptyState category={activeCategory} searchQuery={searchQuery} />
          ) : (
            <div className="grid-products">
              {sortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  wishlisted={wishlist.includes(product.id)}
                  onWishlist={toggleWishlist}
                  onSelect={setSelectedProduct}
                  user={user}
                  onDelete={handleDeleteProduct}
                  onEdit={setEditingProduct}
                />
              ))}
            </div>
          )}

          <Banner onOferta={() => {
            setActiveCategory("ofertas");
            setTimeout(() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }), 50);
          }} />
        </main>

        <Footer>
          <AnnouncementBar />
        </Footer>

        {/* Botones flotantes: columna derecha en desktop / barra inferior en móvil */}
        {!showCart && (
          <div className="floating-btns">
            {showScrollTop && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="scroll-top-btn"
                title="Volver arriba"
                style={{
                  position: "fixed", bottom: "156px", right: "24px", zIndex: 800,
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: CORAL, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  animation: "fadeInUp 0.25s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.4)"; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </button>
            )}
            <a
              href="https://wa.me/573225306651"
              target="_blank"
              rel="noopener noreferrer"
              title="Escríbenos por WhatsApp"
              style={{
                position: "fixed", bottom: "88px", right: "24px", zIndex: 800,
                width: "52px", height: "52px", borderRadius: "50%",
                background: "#25D366",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.12)";
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(37,211,102,0.7)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,211,102,0.5)";
              }}
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.51L4 29l7.695-1.81A12.94 12.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a10.94 10.94 0 01-5.29-1.358l-.37-.215-4.57 1.075 1.1-4.46-.23-.385A9.953 9.953 0 016 15C6 9.477 10.477 5 16 5zm-3.17 5.5c-.22 0-.576.082-.878.41-.303.327-1.155 1.13-1.155 2.755s1.182 3.196 1.347 3.417c.165.22 2.32 3.726 5.724 5.075 2.843 1.12 3.405.9 4.02.845.613-.056 1.98-.81 2.26-1.593.28-.782.28-1.453.196-1.593-.083-.14-.303-.22-.634-.385-.33-.165-1.98-.978-2.286-1.09-.303-.11-.524-.165-.744.165-.22.33-.854 1.09-1.046 1.31-.193.22-.385.248-.716.083-.33-.165-1.394-.514-2.654-1.638-.98-.875-1.64-1.956-1.833-2.286-.192-.33-.02-.508.145-.672.148-.148.33-.385.495-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.028-.578-.082-.165-.738-1.797-1.018-2.458-.27-.644-.544-.556-.744-.556z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61567143641146"
              target="_blank"
              rel="noopener noreferrer"
              title="Síguenos en Facebook"
              style={{
                position: "fixed", bottom: "24px", right: "24px", zIndex: 800,
                width: "52px", height: "52px", borderRadius: "50%",
                background: "#1877F2",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(24,119,242,0.45)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.12)";
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(24,119,242,0.6)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(24,119,242,0.45)";
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
