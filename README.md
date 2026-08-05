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
| `nosotros.html` | Quiénes somos, instalaciones y valores del centro |
| `contacto.html` | Formulario de contacto y ubicación |
| `privacidad.html` / `terminos.html` | Legales |
| `404.html` | Página de error |

## Cómo está armado

| Archivo | Para qué sirve |
|---|---|
| `js/products.js` | Catálogo, categorías, promociones y datos del negocio |
| `js/app.js` | Carrito, cuentas, pedidos, inventario y lógica de cada página |
| `js/auth.js` | Cuentas contra Firebase Authentication (registro, sesión e invitados) |
| `js/cloud.js` | Lectura y escritura en Firestore, con la credencial de cada sesión |
| `js/firebase-config.js` | Identificadores públicos del proyecto de Firebase |
| `firestore.rules` | Quién puede leer y escribir cada colección |
| `js/assets.js` | Íconos e imágenes en SVG, sin peticiones externas |
| `js/effects.js` | Animaciones al hacer scroll |
| `css/styles.css` · `css/animations.css` | Estilos y animaciones |

## Tecnología

HTML + CSS + JavaScript puro, sin frameworks ni build. Hospedado en GitHub Pages con HTTPS.

Las cuentas las maneja **Firebase Authentication**: la contraseña viaja cifrada y el sitio nunca la
guarda. Quien reserva sin registrarse entra como invitado, y si después crea su cuenta desde el mismo
navegador conserva las reservas que ya había hecho.

Las reservas, los perfiles, los precios y los horarios bloqueados viven en **Firebase Firestore**.
Cada petición va firmada con la sesión de quien la hace, y `firestore.rules` decide qué alcanza: un
cliente solo ve sus propias reservas y el personal las ve todas. Lo único público es qué horas están
tomadas, que no lleva datos de ninguna persona.

Cada hora se aparta como un documento con identificador `fecha_hora_cancha`, así que dos personas que
confirmen al mismo tiempo no pueden llevarse la misma cancha: la segunda recibe la otra cancha libre
o el aviso de que la hora se acaba de ocupar. Por eso confirmar una reserva necesita conexión; el
resto del sitio (catálogo, carrito, precios) se sigue navegando con la copia local.

El pago con tarjeta y PayPal está en **modo de prueba (sandbox)**: no se procesan cobros reales.

**Cupones:** `GAMA10` (10 %) · `EQUIPO15` (15 %) · `SEMANA15` (15 %)
**Tarjeta de prueba:** 4242 4242 4242 4242, cualquier fecha futura y cualquier CVV

## Puesta en marcha en Firebase

El sitio es estático y no necesita instalación, pero el proyecto de Firebase sí necesita tres cosas
configuradas una sola vez:

1. **Authentication › Sign-in method**: habilitar *Correo electrónico/contraseña* y *Anónimo*
   (el segundo es el que permite reservar sin crear cuenta).
2. **Firestore › Reglas**: pegar el contenido de `firestore.rules` y publicar.
3. **Personal**: registrarse en el sitio con el correo del negocio, copiar el UID que aparece en
   *Authentication › Users* y crear con él un documento en la colección `admins`
   (el identificador del documento es el UID; el contenido da igual). Ese documento es el único
   que convierte una cuenta en administradora, y no se puede crear desde el sitio.

Sin el paso 3 nadie entra al panel, aunque sepa la contraseña de una cuenta.

---

Proyecto académico · DIA-309 Negocios Electrónicos · UNAH · II PAC 2026

© 2026 GamaSport · Tegucigalpa, Honduras - *¡Tu pasión, nuestro campo!*
