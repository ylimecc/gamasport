# ⚽ GamaSport

Tienda y reservas en línea para **GamaSport**, centro de canchas de fútbol 5 en Tegucigalpa. Reserva tu cancha sin complicaciones: iluminación nocturna, parqueo privado y restaurante en el mismo lugar.

**🌐 Sitio en vivo: [ylimecc.github.io/gamasport](https://ylimecc.github.io/gamasport/)**

## Qué ofrece

- 📅 **Reserva de canchas**: flujo de reserva en 4 pasos, directo desde el navegador
- 🏆 **Torneos y eventos**: organización de ligas y eventos privados
- 🍔 **Restaurante**: para el tercer tiempo
- 💳 **Membresías**: planes para equipos que juegan seguido
- 🛒 **Tienda en línea**: catálogo, carrito y checkout completos
- 🎟️ **Promociones**: cupones de descuento que se aplican en el carrito
- 👤 **Cuentas de usuario**: registro, inicio de sesión e historial de reservas
- 🛠️ **Panel administrativo**: pedidos, precios, cupos y horarios bloqueados
- 💬 **Asistente de preguntas frecuentes**: responde dudas comunes sin salir de la página

## Páginas

| Página | Función |
|---|---|
| `index.html` | Home: servicios, promociones, carrusel y contacto |
| `catalogo.html` / `producto.html` | Catálogo con filtros y disponibilidad, y detalle del servicio |
| `carrito.html` / `checkout.html` / `confirmacion.html` | Flujo de compra completo, con cupones e ISV |
| `promociones.html` | Promociones vigentes y cupones |
| `cuenta.html` | Iniciar sesión, registrarse y ver el historial de reservas |
| `admin.html` | Panel administrativo (pedidos, inventario, precios y horarios) |
| `nosotros.html` | Historia del centro, instalaciones y equipo |
| `contacto.html` | Formulario de contacto y ubicación |
| `privacidad.html` / `terminos.html` | Legales |
| `404.html` | Página de error |

## Cómo está armado

| Archivo | Para qué sirve |
|---|---|
| `js/products.js` | Catálogo, categorías, promociones y datos del negocio |
| `js/app.js` | Carrito, cuentas, pedidos, inventario y lógica de cada página |
| `js/cloud.js` | Sincronización con Firestore por API REST |
| `js/firebase-config.js` | Credenciales públicas del proyecto de Firebase |
| `js/assets.js` | Íconos e imágenes en SVG, sin peticiones externas |
| `js/effects.js` | Animaciones al hacer scroll |
| `css/styles.css` · `css/animations.css` | Estilos y animaciones |

## Tecnología

HTML + CSS + JavaScript puro, sin frameworks ni build. Hospedado en GitHub Pages con HTTPS.

Los datos (reservas, usuarios, cupos y horarios bloqueados) se guardan en **Firebase Firestore** y se
consultan por su API REST. El navegador conserva una copia local, así que si la nube no responde el
sitio sigue funcionando y todo se fusiona cuando vuelve la conexión.

El pago con tarjeta y PayPal está en **modo de prueba (sandbox)**: no se procesan cobros reales.

**Cupones:** `GAMA10` (10 %) · `EQUIPO15` (15 %) · `SEMANA15` (15 %)
**Tarjeta de prueba:** 4242 4242 4242 4242, cualquier fecha futura y cualquier CVV

---

Proyecto académico · DIA-309 Negocios Electrónicos · UNAH · II PAC 2026

© 2026 GamaSport · Tegucigalpa, Honduras - *¡Tu pasión, nuestro campo!*
