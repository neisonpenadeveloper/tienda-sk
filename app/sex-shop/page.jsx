import Tienda from "../_components/Tienda";

// Sección para adultos. Fuera de Google, y con un título de pestaña neutro para
// que "Sex Shop" no aparezca en la barra de pestañas ni en el historial.
export const metadata = {
  title: { absolute: "Tienda S&K" },
  robots: { index: false, follow: false },
};

export default function SexShopPage() {
  return <Tienda zona="adultos" />;
}
