# Tienda SK

Tienda en línea completa y **en producción**: catálogo con control de stock, carrito, cupones, pagos con Wompi y panel de administración.

**🔗 [tiendasyk.store](https://tiendasyk.store)**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)

---

## Qué hace

- **Catálogo** con control de stock y productos activos/inactivos
- **Carrito** persistente en el navegador
- **Cupones** de descuento validados en el servidor
- **Checkout con Wompi**, con soporte para Bold, Nequi y PSE
- **Verificación de la transacción** contra la API de Wompi antes de confirmar la orden
- **Autenticación por enlace mágico** (Supabase Auth), sin contraseñas que gestionar
- **Panel de administración** para productos, stock y órdenes
- **SEO técnico**: `sitemap.xml` dinámico, `robots.txt` e imágenes OpenGraph generadas por producto
- **Páginas legales**: términos y condiciones, política de privacidad

---

## Decisiones técnicas

Las partes del proyecto donde hubo que pensar, no solo escribir código.

### El precio nunca lo pone el cliente

El carrito que llega del navegador aporta únicamente **ids y cantidades**. Antes de crear la orden, `app/api/checkout/route.js` vuelve a consultar en la base de datos el precio, el stock y el estado de cada producto:

```js
// Verificar precios y stock reales contra la base de datos
const { data: dbProducts } = await supabaseVerify
  .from("products")
  .select("id, price, stock, is_active")
```

Si se confiara en el precio que envía el navegador, cualquiera podría abrir las herramientas de desarrollo y comprar un producto de $500.000 por $1.000. El total se recalcula siempre en el servidor.

### La firma de integridad se calcula en el servidor

Wompi exige una firma SHA-256 que incluye una llave secreta de integridad. Se genera con `crypto.createHash` dentro de la ruta de API, de modo que **esa llave nunca se envía al navegador**:

```js
const signature = createHash("sha256")
  // ...
  .digest("hex");
```

### La orden no se confirma por lo que diga el navegador

Cuando el usuario vuelve de la pasarela, el estado que trae la URL no se toma como verdad. `app/api/checkout/verify/route.js` consulta la transacción **directamente contra la API de Wompi** y solo entonces actualiza la orden. Evita que alguien falsifique una confirmación de pago manipulando la dirección.

### Separación estricta de llaves

| Variable | Dónde vive |
|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Navegador. Protegida por Row Level Security |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo en rutas de API del servidor. Salta RLS, jamás sale del backend |

### Validación defensiva antes de tocar la base de datos

Las cantidades se validan como enteros entre 1 y 100 antes de cualquier consulta. Una petición mal formada se rechaza con `400` sin gastar un viaje a la base de datos.

### Imágenes OpenGraph por producto

`app/producto/[id]/opengraph-image.tsx` genera en tiempo de ejecución una imagen propia para cada producto. Cuando alguien comparte un enlace por WhatsApp, aparece ese producto y no un logo genérico — que es como se comparten los productos en Colombia.

---

## Estructura

```
app/
├── api/
│   ├── checkout/route.js          Crea la orden y firma la transacción
│   ├── checkout/verify/route.js   Verifica el pago contra Wompi
│   └── og-img/[id]/route.ts       Imagen OpenGraph dinámica
├── auth/callback/route.js         Retorno del enlace mágico
├── producto/[id]/page.tsx         Detalle de producto
├── checkout/result/page.jsx       Resultado del pago
├── terminos/  privacidad/         Páginas legales
├── sitemap.ts  robots.ts          SEO
└── page.jsx                       Catálogo, carrito y panel de administración

lib/
└── supabase.js                    Clientes de Supabase
```

**Base de datos:** `products`, `orders`, `coupons`.

---

## Ejecutar localmente

```bash
git clone https://github.com/neisonpenadeveloper/tienda-sk.git
cd tienda-sk
npm install
cp .env.example .env.local   # completa tus propias llaves
npm run dev
```

Abre <http://localhost:3000>.

### Variables de entorno

Crea `.env.local` con estas cuatro variables:

| Variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública, se usa desde el navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave privada de servidor. **Nunca la publiques** |
| `NEXT_PUBLIC_APP_URL` | URL base de la app, para los retornos de la pasarela |

`.env.local` está en `.gitignore` y no debe subirse nunca al repositorio.

---

## Estado y siguientes pasos

El proyecto está desplegado y operativo. Lo que sigue en la lista:

- [ ] Pruebas automatizadas del flujo de checkout
- [ ] Historial de órdenes visible para el cliente
- [ ] Notificaciones por correo al confirmarse el pago
- [ ] Búsqueda y filtros en el catálogo

---

## Autor

**Neison Estiven Peña González** — Desarrollador
[LinkedIn](https://linkedin.com/in/neison-estiven) · [tiendasyk.store](https://tiendasyk.store)

Construido con asistencia de Claude AI para acelerar el desarrollo. Las decisiones de arquitectura, el modelo de datos y la lógica de seguridad del checkout son propias.
