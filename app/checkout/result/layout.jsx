import { DM_Sans } from "next/font/google";

/**
 * DM Sans vive aqui y no en el layout raiz.
 *
 * Solo la usa la pagina de resultado del pago, que un cliente ve una vez y
 * despues de comprar. Cargandola en la raiz se descargaba en CADA visita a la
 * portada, la alcanzara o no; asi solo baja cuando de verdad hace falta.
 *
 * Se carga con next/font (auto-hospedada). Pedirla a fonts.googleapis.com la
 * bloquearia la politica de seguridad del sitio y la pagina se quedaria con
 * una tipografia de repuesto; ya paso antes con DM Sans en app/page.jsx.
 */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function ResultLayout({ children }) {
  return <div className={dmSans.variable}>{children}</div>;
}
