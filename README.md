# GamaSport

Sitio web de comercio electrónico para GamaSport, un centro de canchas de fútbol 5
en Tegucigalpa. Permite reservar canchas, inscribirse a torneos, pedir del restaurante
y comprar membresías, con carrito de compras, pago en línea (en modo de prueba) y
confirmación de pedido.

Hecho con HTML, CSS y JavaScript, sin frameworks.

## Archivos

- `index.html` — página de inicio
- `catalogo.html` — lista de servicios con filtros y buscador
- `producto.html` — detalle de cada servicio
- `carrito.html` — carrito de compras
- `checkout.html` — datos del cliente y pago
- `confirmacion.html` — comprobante con número de pedido
- `contacto.html` — contacto y ubicación
- `privacidad.html` y `terminos.html` — páginas legales
- `css/` — estilos
- `js/` — datos del catálogo y lógica del carrito

Las imágenes son ilustraciones en SVG hechas dentro del propio código, así que el sitio
carga rápido y no depende de archivos externos.

## Ver el sitio

Abre `index.html` en el navegador. Para que el carrito funcione igual que publicado,
conviene usar un servidor local:

```
python -m http.server 8080
```

y entrar a http://localhost:8080

## Publicar en GitHub Pages

1. Crear una cuenta en github.com.
2. Crear un repositorio nuevo (público).
3. Subir el contenido de esta carpeta (que `index.html` quede en la raíz del repositorio).
4. En Settings > Pages, elegir la rama `main` y la carpeta `/ (root)`, y guardar.
5. A los pocos minutos aparece la dirección pública con https. Esa es la URL del sitio.

(Otra opción rápida: arrastrar la carpeta a https://app.netlify.com/drop)

## Datos que hay que cambiar

En `js/products.js`, al inicio, está el objeto `CONFIG` con el teléfono, WhatsApp,
correo y redes sociales. Hay que poner los datos reales de GamaSport. El número de
WhatsApp se usa en todos los botones del sitio.

Para cambiar precios o servicios, editar la lista `PRODUCTS` en ese mismo archivo.

## Para probar

- Cupones de descuento: GAMA10 y EQUIPO15.
- Pago de prueba: tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVV.
  No se cobra dinero real.
