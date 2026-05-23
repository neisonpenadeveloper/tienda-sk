import Link from "next/link";

export const metadata = {
  title: "Términos de Servicio",
  description: "Términos y condiciones de uso de Tienda S&K — compras, envíos y devoluciones.",
};

const DARK = "#0F172A";

export default function TerminosPage() {
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
          Términos de Servicio
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginBottom: 40 }}>
          Última actualización: 23 de mayo de 2026
        </p>

        <Section title="1. Aceptación de los términos">
          <p>
            Al acceder y usar el sitio web <strong>tiendasyk.store</strong>, aceptas cumplir con estos
            términos de servicio. Si no estás de acuerdo con alguno de ellos, te pedimos que no uses
            nuestra tienda.
          </p>
        </Section>

        <Section title="2. Productos y disponibilidad">
          <p>
            Todos los productos publicados en Tienda S&K están sujetos a disponibilidad de stock.
            Nos reservamos el derecho de modificar precios, descripciones o retirar productos en
            cualquier momento sin previo aviso.
          </p>
          <p style={{ marginTop: 12 }}>
            Las imágenes de los productos son ilustrativas. Hacemos el mayor esfuerzo para que
            representen fielmente el producto real.
          </p>
        </Section>

        <Section title="3. Precios">
          <p>
            Todos los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplica.
            Tienda S&K se reserva el derecho de modificar los precios en cualquier momento.
          </p>
        </Section>

        <Section title="4. Proceso de compra">
          <p>
            Las compras se realizan a través de nuestra tienda en línea. Al finalizar tu pedido,
            serás redirigido a <strong>WhatsApp</strong> (+57 322 530 6651) donde uno de nuestros
            asesores confirmará tu pedido y coordinará la entrega.
          </p>
          <p style={{ marginTop: 12 }}>
            El método de pago disponible es <strong>contra entrega</strong>: pagas cuando recibes
            tu pedido, disponible para todo el territorio colombiano.
          </p>
          <p style={{ marginTop: 12 }}>
            El pedido se confirma una vez coordinado con nuestro equipo por WhatsApp.
          </p>
        </Section>

        <Section title="5. Envíos y entregas">
          <p>
            Realizamos envíos a todo el territorio colombiano. Los tiempos y costos de envío se
            informan al momento de coordinar el pedido por WhatsApp según la ciudad de destino.
          </p>
          <p style={{ marginTop: 12 }}>
            Tienda S&K no se hace responsable por demoras causadas por la empresa transportadora
            una vez el paquete haya sido despachado.
          </p>
        </Section>

        <Section title="6. Devoluciones y garantía">
          <p>
            Ofrecemos <strong>10 días de garantía</strong> en todos nuestros productos contados
            desde la fecha de entrega. Si el producto presenta defectos de fábrica o llegó en mal
            estado, coordina la devolución o cambio por WhatsApp.
          </p>
          <p style={{ marginTop: 12 }}>
            No se aceptan devoluciones por cambio de opinión una vez el producto haya sido usado.
            El producto debe estar en su estado original y con empaque.
          </p>
        </Section>

        <Section title="7. Cupones de descuento">
          <p>
            Los cupones de descuento son de uso personal, intransferibles y válidos para una sola
            compra salvo que se indique lo contrario. No son acumulables entre sí.
          </p>
        </Section>

        <Section title="8. Limitación de responsabilidad">
          <p>
            Tienda S&K no se hace responsable por daños indirectos, pérdidas de datos o perjuicios
            derivados del uso de nuestro sitio web. Nuestra responsabilidad máxima se limita al
            valor del producto adquirido.
          </p>
        </Section>

        <Section title="9. Modificaciones">
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
            entran en vigencia desde su publicación en esta página. El uso continuo de la tienda
            implica la aceptación de los términos actualizados.
          </p>
        </Section>

        <Section title="10. Contacto">
          <p>Para cualquier duda sobre estos términos, contáctanos:</p>
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
