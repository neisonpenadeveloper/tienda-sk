"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { ShoppingBag, Search, Heart, Menu, X, Star, Home, Sparkles, Smile, ArrowRight, Package, Truck, PlusCircle, LogOut, LogIn, Upload, Trash2, Minus, Plus, ChevronDown, Share2, Check, Copy, Pencil } from "lucide-react";

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
function Navbar({ cartCount, cartBounce, menuOpen, setMenuOpen, activeCategory, setActiveCategory, user, isAdmin, onLogin, onLogout, onPublish, onCartOpen, searchQuery, setSearchQuery }) {
  const desktopInputRef = useRef(null);
  const mobileInputRef  = useRef(null);

  const focusSearch = () => {
    desktopInputRef.current?.focus() || mobileInputRef.current?.focus();
  };

  return (
    <header style={{ borderBottom: "1px solid #EDE8E2", background: "#fff" }} className="sticky top-0 z-50">
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 32px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", height: "64px", gap: "16px" }}>

          {/* Logo */}
          <div className="flex items-center flex-shrink-0" style={{ height: "52px" }}>
            <img src="/header-logo.png" alt="Tienda S&K" style={{ height: "52px", width: "auto" }} />
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" }}>
            <button
              onClick={focusSearch}
              title="Buscar productos"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#6B6560", padding: "8px", borderRadius: "50%",
                transition: "all 0.18s ease",
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

        {/* Barra de búsqueda móvil — siempre visible */}
        <div className="md:hidden" style={{ borderTop: "1px solid #EDE8E2", padding: "10px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#F0F4FF", borderRadius: "28px", padding: "9px 16px",
            border: `1.5px solid ${searchQuery ? CORAL : "#E2E8F0"}`,
            transition: "border-color 0.2s",
          }}>
            <Search size={15} color={searchQuery ? CORAL : "#9B948E"} style={{ flexShrink: 0 }} />
            <input
              ref={mobileInputRef}
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
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={14} color="#9B948E" />
              </button>
            )}
          </div>
        </div>

        {menuOpen && (
          <div style={{ borderTop: "1px solid #EDE8E2", paddingBottom: "12px" }} className="md:hidden">
            {/* Buscador en menú móvil */}
            <div style={{ padding: "10px 0 4px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "#F5F0EA", borderRadius: "28px", padding: "9px 16px",
                border: `1.5px solid ${searchQuery ? CORAL : "#EDE8E2"}`,
                transition: "border-color 0.2s",
              }}>
                <Search size={14} color={searchQuery ? CORAL : "#9B948E"} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    <X size={14} color="#9B948E" />
                  </button>
                )}
              </div>
            </div>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setMenuOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 4px", background: "none", border: "none",
                  fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px",
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
function Hero({ onShop, stats }) {

  return (
    <section style={{
      background: "linear-gradient(135deg,#FAF7F4 0%,#fff5f3 100%)",
      borderBottom: "1px solid #EDE8E2",
      padding: "28px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Blob decorativo */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "0 32px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>

        {/* Izquierda: badge + título en una línea */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
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
          <h1 style={{
            fontFamily: "var(--font-roboto), sans-serif",
            fontSize: "clamp(18px, 2.2vw, 26px)",
            fontWeight: 800, color: "#111",
            letterSpacing: "-0.5px", margin: 0, whiteSpace: "nowrap",
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
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {stats.products > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            className="shimmer-cta"
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
            className="cat-pill"
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 22px", borderRadius: "24px",
              border: isActive ? "none" : "1.5px solid #E0D8CC",
              background: isActive ? `linear-gradient(135deg, ${CORAL}, #ff6b52)` : "#fff",
              color: isActive ? "#fff" : "#6B6560",
              fontFamily: "var(--font-roboto), sans-serif",
              fontSize: "13.5px", fontWeight: isActive ? 700 : 400,
              cursor: "pointer",
              boxShadow: isActive ? "0 6px 20px rgba(37,99,235,0.35)" : "none",
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
function EmptyState({ category, searchQuery }) {
  const cat = CATEGORIES.find(c => c.id === category);
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

      <div className="pc-body" style={{ padding: "16px" }}>
        {product.rating != null && (
          <div className="flex items-center gap-1" style={{ marginBottom: "6px" }}>
            <Star size={12} fill="#F5A623" color="#F5A623" />
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#6B6560", fontWeight: 500 }}>
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}
        <h3 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700, color: "#1A1A1A", marginBottom: product.stock != null ? "6px" : "10px", lineHeight: 1.3 }}>
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
function Banner() {
  return (
    <div style={{
      background: "#1A1A1A",
      borderRadius: "20px", padding: "14px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "12px", flexWrap: "wrap", margin: "48px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Truck size={16} color="#9B948E" />
        <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 600, color: "#F5F0EA" }}>
          Envío gratis en compras mayores a $70.000 COP
        </span>
      </div>
      <button
        style={{
          background: CORAL, color: "#fff", border: "none",
          borderRadius: "20px", padding: "7px 18px",
          fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          boxShadow: "0 3px 10px rgba(37,99,235,0.3)", transition: "opacity 0.15s",
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
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [shuffled, setShuffled] = useState([]);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
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
    }
  }, [shuffled.length]);

  const numPages = shuffled.length > 0 ? Math.ceil(shuffled.length / itemsPerView) : 0;
  const maxPage = Math.max(0, numPages - 1);

  useEffect(() => {
    if (shuffled.length === 0 || numPages <= 1) return;
    const t = setInterval(() => setCurrentPage(p => p >= maxPage ? 0 : p + 1), 20000);
    return () => clearInterval(t);
  }, [maxPage, shuffled.length, numPages]);

  if (shuffled.length === 0) return null;

  const prev = () => setCurrentPage(p => Math.max(0, p - 1));
  const next = () => setCurrentPage(p => Math.min(maxPage, p + 1));
  const onDragStart = x => { dragStart.current = x; hasDragged.current = false; setIsDragging(true); setDragOffset(0); };
  const onDragMove  = x => { if (dragStart.current === null) return; const d = x - dragStart.current; if (Math.abs(d) > 8) hasDragged.current = true; setDragOffset(d); };
  const onDragEnd   = () => { if (dragStart.current !== null) { if (dragOffset < -50) next(); else if (dragOffset > 50) prev(); } dragStart.current = null; setIsDragging(false); setDragOffset(0); };

  const translateX = cardWidth > 0 ? -(currentPage * itemsPerView * cardWidth) + dragOffset : 0;

  return (
    <section style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "14px 0 24px" }}>
      <div className="carousel-inner" style={{ maxWidth: "1600px", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "14px" }}>
          <button onClick={prev} disabled={currentPage === 0} style={{ width: "34px", height: "34px", borderRadius: "50%", border: `1.5px solid ${currentPage === 0 ? "#E2E8F0" : CORAL}`, background: currentPage === 0 ? "#F0F4FF" : "#fff", color: currentPage === 0 ? "#CBD5E1" : CORAL, cursor: currentPage === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>‹</button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: F_UI, fontSize: "9px", color: "#9B948E", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>Selección especial</p>
            <h2 style={{ fontFamily: F_DISPLAY, fontSize: "16px", fontWeight: 600, color: "#1A1A1A", margin: 0, fontStyle: "italic" }}>Productos para ti ✨</h2>
          </div>
          <button onClick={next} disabled={currentPage >= maxPage} style={{ width: "34px", height: "34px", borderRadius: "50%", border: "none", background: currentPage >= maxPage ? "#E2E8F0" : CORAL, color: currentPage >= maxPage ? "#9B948E" : "#fff", cursor: currentPage >= maxPage ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>›</button>
        </div>
        <div
          ref={outerRef}
          style={{ overflow: "hidden", cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
          onTouchEnd={onDragEnd}
          onMouseDown={e => { e.preventDefault(); onDragStart(e.clientX); }}
          onMouseMove={e => { if (isDragging) onDragMove(e.clientX); }}
          onMouseUp={onDragEnd}
          onMouseLeave={() => { if (isDragging) onDragEnd(); }}
        >
          <div style={{ display: "flex", transform: `translateX(${translateX}px)`, transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.16,1,0.3,1)", visibility: cardWidth > 0 ? "visible" : "hidden" }}>
            {shuffled.map(p => (
              <CarouselCard key={p.id} product={p} onSelect={p => { if (!hasDragged.current) onSelect(p); }} cardWidth={cardWidth} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "20px" }}>
          {Array.from({ length: numPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)} style={{ width: i === currentPage ? "22px" : "8px", height: "8px", borderRadius: "4px", background: i === currentPage ? CORAL : "#E2E8F0", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
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
            {["Privacidad", "Términos", "Contacto"].map(link => (
              <a key={link} href="#" style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12px", color: "#9B948E", textDecoration: "none" }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}

// ─── CART ITEM ────────────────────────────────────────────────────────────────
function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "14px", background: "#FAF7F4", borderRadius: "14px" }}>
      {/* Imagen / emoji */}
      <div style={{
        width: "76px", height: "76px", borderRadius: "10px", overflow: "hidden",
        flexShrink: 0, background: item.images?.length > 0 ? "#F5F0EA" : (item.color || "#F5F0EA"),
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px",
      }}>
        {item.images?.length > 0
          ? <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span>{item.emoji}</span>
        }
      </div>

      {/* Detalle */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.name}
          </p>
          <button
            onClick={() => onRemove(item.id)}
            title="Eliminar"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#C0B8B0", padding: "2px", flexShrink: 0, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = CORAL}
            onMouseLeave={e => e.currentTarget.style.color = "#C0B8B0"}
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Controles de cantidad */}
          <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E0D8CC", borderRadius: "20px", overflow: "hidden" }}>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
              style={{ width: "30px", height: "30px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6560" }}
            >
              <Minus size={12} />
            </button>
            <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", fontWeight: 700, color: "#1A1A1A", minWidth: "22px", textAlign: "center" }}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              disabled={item.stock != null && item.quantity >= item.stock}
              style={{ width: "30px", height: "30px", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6560", cursor: item.stock != null && item.quantity >= item.stock ? "not-allowed" : "pointer", opacity: item.stock != null && item.quantity >= item.stock ? 0.3 : 1 }}
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Subtotal */}
          <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", fontWeight: 800, color: "#1A1A1A" }}>
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onRemove, onUpdateQty, user }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError]     = useState("");
  const [couponInput, setCouponInput]         = useState("");
  const [couponError, setCouponError]         = useState("");
  const [appliedCoupon, setAppliedCoupon]     = useState(null); // { code, pct }

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const pct = COUPONS[code];
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

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      />

      {/* Panel deslizante */}
      <div
        className="cart-drawer"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 701,
          width: "100%", maxWidth: "420px",
          background: "#fff", display: "flex", flexDirection: "column",
          boxShadow: "-12px 0 50px rgba(0,0,0,0.18)",
        }}
      >
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
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
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
          <div style={{ padding: "20px 24px", borderTop: "1px solid #EDE8E2", display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Barra de envío gratis */}
            <div>
              {total < FREE_SHIP ? (
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12.5px", color: "#6B6560", marginBottom: "6px" }}>
                  Agrega <strong style={{ color: CORAL }}>{fmtCOP(FREE_SHIP - total)}</strong> más para envío gratis
                </p>
              ) : (
                <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "12.5px", color: "#2D7A4F", fontWeight: 600, marginBottom: "6px" }}>
                  ✓ ¡Envío gratis aplicado!
                </p>
              )}
              <div style={{ height: "6px", background: "#EDE8E2", borderRadius: "3px" }}>
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
                      fontFamily: "var(--font-roboto), sans-serif", fontSize: "13px", color: "#1A1A1A",
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#6B6560" }}>Subtotal</span>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#1A1A1A", fontWeight: 600 }}>{fmtCOP(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#2D7A4F" }}>Descuento ({appliedCoupon.pct}%)</span>
                  <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#2D7A4F", fontWeight: 600 }}>− {fmtCOP(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#6B6560" }}>Envío</span>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: total >= FREE_SHIP ? "#2D7A4F" : "#1A1A1A", fontWeight: 600 }}>
                  {total >= FREE_SHIP ? "Gratis" : "A calcular"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #EDE8E2" }}>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "16px", fontWeight: 700, color: "#1A1A1A" }}>Total</span>
                <span style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "22px", fontWeight: 800, color: "#1A1A1A" }}>{fmtCOP(total)}</span>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                width: "100%", padding: "16px",
                background: checkoutLoading ? "#c97060" : CORAL,
                color: "#fff", border: "none", borderRadius: "28px",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "15px", fontWeight: 700,
                cursor: checkoutLoading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
                boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
              }}
              onMouseEnter={e => { if (!checkoutLoading) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <ShoppingBag size={18} />
              {checkoutLoading ? "Redirigiendo…" : "Proceder al pago"}
            </button>

            {/* Botón seguir viendo */}
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "12px",
                background: "none", border: `1.5px solid ${CORAL}`,
                color: CORAL, borderRadius: "28px",
                fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", transition: "background 0.15s, color 0.15s",
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

            <p style={{ textAlign: "center", fontFamily: "var(--font-roboto), sans-serif", fontSize: "11.5px", color: "#9B948E" }}>
              🔒 Pago 100% seguro y encriptado
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({ product, wishlisted, onWishlist, onAddToCart, onClose, user, onDelete, onEdit }) {
  const [selectedImg, setSelectedImg]     = useState(0);
  const [added, setAdded]                 = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shared, setShared]               = useState(false);

  const isOwner = !!user && ADMIN_EMAILS.has(user.email);
  const imgs    = product.images?.length > 0 ? product.images : null;
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;

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
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(15,15,15,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        className="modal-inner"
        style={{
          background: "#fff", borderRadius: "24px",
          width: "100%", maxWidth: "880px",
          maxHeight: "92vh", overflowY: "auto",
          display: "flex", position: "relative",
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
            flex: "0 0 48%", padding: "24px",
            display: "flex", flexDirection: "column", gap: "12px",
            background: "#FAF7F4", borderRadius: "24px 0 0 24px",
          }}
        >
          <div style={{
            borderRadius: "16px", overflow: "hidden",
            height: "340px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: imgs ? "#fff" : (product.color || "#F5F0EA"),
            fontSize: "96px", border: "1px solid #EDE8E2",
          }}>
            {imgs ? (
              <img src={imgs[selectedImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.14))" }}>{product.emoji}</span>
            )}
          </div>

          {imgs && imgs.length > 1 && (
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
          )}
        </div>

        {/* ── Info ── */}
        <div style={{
          flex: 1, padding: "36px 32px",
          display: "flex", flexDirection: "column", gap: "18px",
          overflowY: "auto",
        }}>
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

          {product.description && (
            <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "14px", color: "#5A5A5A", lineHeight: 1.75, margin: 0 }}>
              {product.description}
            </p>
          )}

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
              { icon: Package,  text: "Garantía de calidad en todos los productos"  },
              { icon: ArrowRight, text: "Devoluciones fáciles en 30 días"           },
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
  const [dbProducts, setDbProducts]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [showScrollTop, setShowScrollTop]     = useState(false);
  const [cartBounce, setCartBounce]           = useState(false);

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
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setDbProducts(data ?? []);
    setLoadingProducts(false);
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

    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "products" }, fetchProducts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://project-dcnli.vercel.app" },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const displayProducts = dbProducts.length > 0
    ? dbProducts.map(p => ({
        id:          p.id,
        category:    p.category,
        name:        p.name,
        price:       p.price,
        oldPrice:    p.old_price ?? null,
        badge:       p.badge,
        images:      p.images ?? [],
        description: p.description,
        stock:       p.stock,
        user_id:     p.user_id,
        created_at:  p.created_at,
      }))
    : PRODUCTS;

  const filteredProducts = displayProducts.filter(p => {
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
          .pc-img-wrap { height: 130px !important; font-size: 40px !important; }
          .pc-body { padding: 10px !important; }
          .pc-price-row { flex-direction: column; align-items: flex-start; gap: 6px; }
          .pc-prices { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; }
          .pc-price { font-size: 13px; }
          .pc-old-price { font-size: 11px; margin-left: 0 !important; }
          .pc-add-btn { width: 100%; text-align: center; padding: 6px 8px; font-size: 11px; }
        }
        .product-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 56px rgba(26,26,26,0.14) !important;
        }
        .pc-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .product-card:hover .pc-img { transform: scale(1.09); }
        .pc-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 18px 12px 14px;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          transform: translateY(102%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          display: flex; align-items: center; justify-content: center; gap: 6px;
          pointer-events: none;
        }
        .product-card:hover .pc-overlay { transform: translateY(0); }

        /* ── Botones flotantes: ocultos en móvil ── */
        @media (max-width: 768px) { .floating-btns { display: none !important; } }

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

        /* ── Category pill hover ── */
        .cat-pill { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .cat-pill:hover { transform: scale(1.05); }

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
          onCartOpen={() => setShowCart(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {showCart && (
          <CartDrawer
            cart={cart}
            onClose={() => setShowCart(false)}
            onRemove={handleRemoveFromCart}
            onUpdateQty={handleUpdateQty}
            user={user}
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
          />
        )}

        {showPublish && (
          <PublishModal
            user={user}
            onClose={() => setShowPublish(false)}
            onPublished={fetchProducts}
          />
        )}

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

        <main style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "32px 32px 0", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "11px", color: "#9B948E", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
                {searchQuery.trim() ? "Búsqueda" : "Catálogo"}
              </p>
              <h2 style={{ fontFamily: "var(--font-roboto), sans-serif", fontSize: "30px", fontWeight: 800, color: "#1A1A1A", letterSpacing: "-0.5px" }}>
                {searchQuery.trim()
                  ? <>Resultados para <span style={{ color: CORAL }}>"{searchQuery.trim()}"</span></>
                  : activeCategory === "all" ? "Todos los productos" : CATEGORIES.find(c => c.id === activeCategory)?.label
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

          <Banner />
        </main>

        <Footer>
          <AnnouncementBar />
        </Footer>

        {/* Botones flotantes — solo en página principal, ocultos en móvil */}
        {!showCart && (
          <div className="floating-btns">
            {showScrollTop && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                title="Volver arriba"
                style={{
                  position: "fixed", bottom: "86px", right: "24px", zIndex: 800,
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
