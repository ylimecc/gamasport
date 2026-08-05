# Pruebas automáticas

Abren el sitio en un navegador de verdad y comprueban 21 cosas que, de otro modo, habría que revisar
a mano cada vez que se toca el código: que las páginas carguen, que las cuentas del carrito cuadren,
que no se puedan reservar dos veces la misma cancha y que nada se salga de la pantalla en el celular.

**Ninguna prueba toca la base de datos real.** Las respuestas de la nube se simulan, así que se pueden
correr las veces que haga falta sin ensuciar datos ni gastar cuota.

## Cómo correrlas

La primera vez, instalar el navegador de pruebas:

```
npm install -D playwright
npx playwright install chromium
```

Y después, desde la carpeta del proyecto:

```
node pruebas/pruebas.mjs
```

No hace falta levantar nada más: el propio script sirve el sitio en el puerto 8799 mientras dura la
prueba y lo apaga al terminar.

## Qué comprueba

| Grupo | Qué revisa |
|---|---|
| **1. Carga** | Que el inicio se dibuje completo y que las ocho páginas secundarias respondan sin errores de código. |
| **2. Carrito** | Que el ISV del 15 % se calcule sobre el precio ya rebajado, que solo se acepten los cupones que existen, que no se pueda pedir más de los cupos disponibles y que un servicio agotado salga del carrito. |
| **3. Horarios** | Que la disponibilidad se consulte con la fecha de Honduras y no la de Greenwich, que no se puedan elegir días pasados y que una hora se bloquee solo cuando ya no queda ninguna cancha. |
| **4. Reserva** | Que un número de reserva repetido no haga perder la reserva, y que sin conexión el sitio avise en vez de dar por hecha una reserva que nadie tiene. |
| **5. Panel** | Que cancelar libere la cancha correcta, que un pedido sin cancha no libere la de otro, y que reactivar una reserva cancelada vuelva a apartar la hora o se niegue si otro cliente ya la tomó. |
| **6. Interfaz** | Que a 360, 768 y 1280 píxeles nada se desborde ni quede tapado por el asistente, que los botones de la página de error lleven a donde dicen y que el boletín guarde el correo. |

## Cómo leer el resultado

Cada línea dice qué se comprobó y con qué datos, para entenderlo sin abrir el código:

```
  OK    El impuesto se calcula sobre el precio ya rebajado
        sin cupón: subtotal 1600, ISV 240, total 1840 · con GAMA10: descuento 160, ISV 216, total 1656
```

Si algo falla, la línea empieza con `FALLA`, al final se listan las comprobaciones que no pasaron y el
comando termina con error, por si algún día se quiere ejecutar de forma automática.

## Cuándo correrlas

Antes de subir cualquier cambio a `js/` o a `css/`. Tardan alrededor de un minuto.
