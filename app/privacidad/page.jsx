import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad",
  description: "Conoce cómo Tienda S&K protege y maneja tu información personal.",
};

const BLUE = "#2563EB";
const DARK = "#0F172A";

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "var(--font-roboto, sans-serif)" }}>
      <header style={{ background: DARK, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "#fff", textDecoration: "none", fontSize: 14, opacity: 0.8 }}>
          ← Volver a la tienda
        </Link>
        <span style={{ color: "#fff", opacity: 0.3 }}>|</span>
        <span style={{ color: "#fff", fontFamily: "var(--font-azonix, sans-serif)", fontWeight: 700, fontSize: 16 }}>
          Tienda S&K
        </span>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: DARK, marginBottom: 8, fontFamily: "var(--font-azonix, sans-serif)" }}>
          Política de Privacidad
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 40 }}>
          Última actualización: 23 de mayo de 2026
        </p>

        <Section title="1. Información que recopilamos">
          <p>Cuando creas una cuenta o realizas una compra en Tienda S&K, podemos recopilar:</p>
          <ul>
            <li><strong>Datos de cuenta:</strong> nombre, dirección de correo electrónico y foto de perfil (cuando inicias sesión con Google).</li>
            <li><strong>Datos de compra:</strong> productos seleccionados, cantidades y valor del pedido.</li>
            <li><strong>Datos de contacto:</strong> número de WhatsApp para coordinar la entrega cuando aplica.</li>
          </ul>
        </Section>

        <Section title="2. Cómo usamos tu información">
          <p>Usamos tu información exclusivamente para:</p>
          <ul>
            <li>Gestionar tu cuenta y autenticarte de forma segura.</li>
            <li>Procesar y coordinar tus pedidos.</li>
            <li>Enviarte confirmaciones y actualizaciones sobre tu compra.</li>
            <li>Mejorar la experiencia de compra en nuestra tienda.</li>
          </ul>
          <p>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales.</p>
        </Section>

        <Section title="3. Inicio de sesión con Google">
          <p>
            Ofrecemos la opción de iniciar sesión con tu cuenta de Google. Al hacerlo, recibimos únicamente tu
            nombre y correo electrónico para crear o identificar tu cuenta. No accedemos a tu contraseña de Google
            ni a ningún otro dato de tu cuenta.
          </p>
          <p style={{ marginTop: 12 }}>
            El proceso de autenticación es gestionado por <strong>Supabase</strong> y sigue los estándares de
            seguridad OAuth 2.0 de Google.
          </p>
        </Section>

        <Section title="4. Almacenamiento y seguridad">
          <p>
            Tu información se almacena de forma segura en los servidores de <strong>Supabase</strong>,
            proveedor de base de datos con cifrado en tránsito (TLS) y en reposo. Aplicamos medidas técnicas
            y organizativas para proteger tus datos contra acceso no autorizado.
          </p>
        </Section>

        <Section title="5. Tus derechos">
          <p>Tienes derecho a:</p>
          <ul>
            <li>Acceder a los datos personales que tenemos sobre ti.</li>
            <li>Solicitar la corrección de datos incorrectos.</li>
            <li>Solicitar la eliminación de tu cuenta y datos asociados.</li>
          </ul>
          <p>Para ejercer cualquiera de estos derechos, contáctanos por WhatsApp o correo electrónico.</p>
        </Section>

        <Section title="6. Cookies">
          <p>
            Usamos cookies de sesión estrictamente necesarias para mantener tu inicio de sesión activo.
            No usamos cookies de seguimiento ni publicidad.
          </p>
        </Section>

        <Section title="7. Cambios a esta política">
          <p>
            Podemos actualizar esta política ocasionalmente. Publicaremos la nueva versión en esta página
            con la fecha de actualización correspondiente.
          </p>
        </Section>

        <Section title="8. Contacto">
          <p>Si tienes preguntas sobre esta política de privacidad, contáctanos:</p>
          <ul>
            <li><strong>WhatsApp:</strong> +57 322 530 6651</li>
            <li><strong>Correo:</strong> syktiendaenlinea@gmail.com</li>
            <li><strong>Sitio web:</strong> tiendasyk.store</li>
          </ul>
        </Section>
      </main>

      <footer style={{ borderTop: "1px solid #E2E8F0", padding: "24px", textAlign: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 13 }}>
          © 2026 Tienda S&K — Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 18,
        fontWeight: 700,
        color: DARK,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: "2px solid #E2E8F0",
        fontFamily: "var(--font-azonix, sans-serif)",
      }}>
        {title}
      </h2>
      <div style={{ color: "#334155", fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}
