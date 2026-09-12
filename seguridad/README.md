# Seguridad de Tienda S&K

Revisión hecha el **2026-09-04**. Aquí queda qué se encontró, qué se arregló y
cómo comprobar que sigue bien.

## Cómo comprobar el estado ahora mismo

```bash
node seguridad/auditoria.mjs
```

Se pone en el lugar de un desconocido: usa la misma llave pública que viaja en
el navegador de cualquier visitante e intenta leer, cambiar y borrar cosas.
Crea solo datos marcados como prueba y los borra al terminar. Pásalo después de
cada cambio en la base de datos.

---

## Lo que había abierto

Todo esto se comprobó de verdad contra la base de datos, no es teoría.

### 1. Cualquiera podía leer los pedidos de tus clientes

`orders` era de lectura pública: nombre, correo, dirección, teléfono, qué
compró cada persona y cuánto pagó. Bastaba con abrir la consola del navegador
en la tienda.

Se cerró con las políticas de `politicas.sql`: cada cliente ve solo sus pedidos
y tú los ves todos. **La tabla estaba vacía cuando se revisó**, así que no llegó
a filtrarse ningún dato real.

### 2. Cualquiera podía crear pedidos y marcarlos como pagados

Se podían insertar filas en `orders` con `status: "paid"` desde fuera. Sirve
para ensuciarte los reportes y, si algún día despachas mirando esa columna, para
provocar envíos que nadie pagó.

Ahora los pedidos solo los crea el servidor, con la llave secreta.

### 3. Tus cupones eran públicos

La tienda se descargaba la tabla `coupons` entera al navegador para validar los
códigos. Cualquiera podía leerlos todos, incluidos los desactivados y los que
aún no habías lanzado.

Ahora los valida el servidor en `/api/coupon`, que responde solo por el código
exacto que le preguntan y frena los intentos a lo bruto.

### 4. El descuento no llegaba al cobro *(te estaba costando dinero)*

El cupón solo existía en el navegador: el cliente veía el total rebajado y la
pasarela le cobraba el precio completo. No es un agujero de seguridad, es un
cobro de más a tu cliente.

Ahora el código del cupón viaja al servidor, que lo comprueba contra la base y
aplica el descuento al importe que se firma. Verificado: un carrito de 86.000
con `BIENVENIDO` firma un cobro de **77.400**.

### 5. Se podían crear pedidos a nombre de otra persona

`/api/checkout` guardaba el `userId` y el `userEmail` que mandaba el navegador,
sin comprobarlos. Ahora la identidad se saca del token de sesión: si mandas el
correo de otro, se ignora.

### 6. Un pago podía darse por bueno sin cuadrar

`/api/checkout/verify` marcaba el pedido como pagado si Wompi decía "aprobada" y
la referencia existía, **sin mirar el importe**. Ahora, si el dinero movido no
coincide con el del pedido, no se marca como pagado: queda en `revisar`.

### 7. Otros

- **Se podía enumerar el contenido del bucket de imágenes.** Las fotos siguen
  viéndose (un bucket público las sirve por su URL), pero ya no se puede pedir
  la lista de lo que hay dentro.

  **Corrección del 2026-09-11: esto NO quedó arreglado a la primera.** Al
  aplicar `politicas.sql` se cerraron los pedidos y los cupones, pero un
  desconocido seguía enumerando **171 archivos en 3 carpetas**, entre ellos las
  fotos de los 2 productos en borrador (uno de la sección de adultos, que se
  mantiene discreta a propósito). La causa: el script borraba solo las
  políticas cuyo nombre contenía `product-images`, y la que abre el bucket la
  crea el panel de Supabase con otro nombre. Peor aún, la consulta de
  comprobación filtraba por ese mismo patrón, así que el agujero tampoco salía
  al verificar y todo parecía correcto. Ambas cosas están arregladas en
  `politicas.sql`; hay que **volver a ejecutarlo** para cerrarlo.
- **Sin freno de peticiones.** Se podían crear pedidos en bucle. Ahora hay un
  límite por IP en `/api/checkout` y `/api/coupon`.
- **Cupones escritos en el código** (`BIENVENIDO`, `SK15`, `PROMO20`): viajaban
  dentro del JavaScript de la página y no se podían desactivar sin volver a
  publicar la tienda. Eliminados; ahora todos viven en la base de datos.
- **Redirección tras iniciar sesión sin validar.** El parámetro `next` ahora
  solo acepta rutas internas.
- **5 vulnerabilidades altas en dependencias** (nanoid, ws, postcss, sharp
  dentro de Next). Resueltas actualizando a Next 16.3.4: `npm audit` da 0.

---

## Lo que ya estaba bien

Conviene saberlo para no romperlo:

- Los **precios se recalculan en el servidor** contra la base de datos. Mandar
  `price: 1` en el carrito no sirve de nada: comprobado, sigue cobrando el
  precio real.
- Los **productos no se pueden crear, cambiar ni borrar** desde fuera, y los
  borradores (`is_active = false`) no se ven.
- **No se pueden subir archivos** al bucket desde fuera.
- La **firma de integridad de Wompi** ata referencia, importe y moneda.
- **Cabeceras de seguridad completas**: HSTS, CSP estricta, anti-clickjacking,
  anti-MIME-sniffing y Permissions-Policy.
- **Ninguna clave secreta** en el código ni en el historial de git.
- **Nada de XSS**: no se inyecta HTML de terceros en ninguna página.

---

## Quién es administrador

Está en **dos** sitios y deben coincidir:

1. `app/page.jsx` → `ADMIN_EMAILS`. Solo decide qué botones se ven.
2. `seguridad/politicas.sql` → función `es_admin()`. **Esta es la que manda**:
   es la que la base de datos consulta antes de dejar tocar nada.

Para dar acceso a alguien hay que añadirlo en los dos y volver a ejecutar el
SQL. Cambiar solo el primero no da ningún permiso real; cambiar solo el segundo
da los permisos pero deja los botones escondidos.

## El bot de carga sigue funcionando

`D:\Bot Tienda Syk` publica con la llave `service_role`, que no pasa por estas
reglas. Nada de lo cambiado aquí le afecta.

## Lo que queda por hacer

- **Webhook de Wompi.** Hoy un pedido se confirma cuando el cliente vuelve a la
  tienda tras pagar. Si cierra el navegador antes, el pedido se queda en
  `pending` aunque el pago se hiciera. Con un webhook, Wompi avisa directamente.
- **Descontar el stock al confirmarse el pago.** Ahora mismo no baja, así que se
  puede vender más de lo que hay.
