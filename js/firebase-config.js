/* Configuración del proyecto de Firebase de GamaSport.

   Estos dos valores identifican el proyecto y son públicos por diseño: viajan
   dentro del sitio web, así que cualquiera puede verlos. La seguridad real no
   está aquí sino en las reglas de Firestore, que definen quién puede leer y
   escribir cada colección.

   Hablamos con Firestore por su API REST, sin cargar el SDK, para que el sitio
   siga siendo liviano y sin dependencias externas.

   Si se borran estos valores, el sitio sigue funcionando guardando todo en el
   navegador. */
window.GS_FIREBASE = {
  apiKey:    "AIzaSyA6JsoGqjfQ2tBv9sNWKeiJdwL_JjvL_0A",
  projectId: "gamasport-1019d"
};
