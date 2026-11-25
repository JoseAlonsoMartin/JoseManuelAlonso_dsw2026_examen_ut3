# Respuestas del simulacro

## 7. Listado, búsqueda y paginación de avisos

`GET /api/v1/notices` acepta `page` (predeterminado `1`), `limit` (predeterminado `2`) y `search`. El controlador valida `page` y `limit` como enteros positivos y pasa el texto de búsqueda al servicio. El servicio busca sin distinguir mayúsculas en el título, calcula `total` antes de paginar y devuelve una página vacía si el desplazamiento queda fuera de la lista. Una búsqueda ausente o en blanco no filtra.

Las entradas inválidas se convierten en `AppError` y las responde el manejador central con estado 400. La forma de respuesta es `{ data, pagination: { page, limit, total } }`.

## 8. Crear, consultar y actualizar avisos

La creación requiere un título de texto no vacío después de `trim()`. Una descripción omitida se guarda como `''`; una descripción enviada debe ser texto. El servicio genera `id` con `randomUUID()` y `createdAt` con la fecha actual; el controlador responde 201.

La consulta y actualización propagan `ResourceNotFoundError` con el identificador solicitado. El manejador central devuelve ese identificador, no un valor fijo. En PATCH solo se aplican `title` y `description`; los campos omitidos quedan sin cambios. Los datos se validan antes de llamar al servicio, por lo que un error no modifica el aviso.

La descripción enviada se conserva exactamente; el título válido se recorta. La prueba PATCH de la colección envía solo `description` al aviso sembrado y la petición GET siguiente permite comprobar que `title` permanece igual. El título vacío en PATCH se responde directamente desde el controlador para cubrir expresamente el recorrido solicitado en el punto 11; las demás validaciones inválidas pasan por `AppError`.

## 9. Comportamiento según NODE_ENV

El logger no se desactiva al cambiar `NODE_ENV`: `app.ts` lo registra cuando `LOG !== 'OFF'`, y el `.env` de desarrollo deja `LOG=ON`. El manejador de errores registra siempre JSON con `requestId` y el mensaje; fuera de producción incluye `stack`, mientras que en producción `stack` queda como `undefined` y se omite al serializar JSON.

Ante un error inesperado, el manejador responde 500. En desarrollo expone `err.message`; en producción devuelve `An unexpected error occurred`. Lo explican la condición sobre `env.NODE_ENV` en `errorHandler.ts` y el registro condicionado por `env.LOG` en `app.ts`.

**Prueba experimental pendiente:** no se inició el servidor ni se provocó el error temporal en esta entrega, así que no hay respuestas ni registros capturados que presentar como observaciones reales. Para completar la evidencia, inicia por separado con `$env:NODE_ENV='development'` y `$env:NODE_ENV='production'`, realiza una petición correcta y otra a una ruta temporal que lance `throw new Error('Fallo interno de prueba')`, guarda respuesta y consola de cada ejecución, elimina la ruta temporal y reinicia.

## 10. Diagnóstico de los fallos de middleware

El código entregado tiene el orden correcto: `requestId`, logger, `express.json()`, routers, `notFound` y, al final, `errorHandler`. El logger llama a `next()`. `notFound` responde 404 y termina porque una ruta inexistente ya no debe continuar por la cadena normal.

**Primera prueba, `notFound` antes de los routers:** se espera que una ruta válida reciba 404, ya que el middleware termina la respuesta antes de que el router pueda atenderla. La respuesta la genera `notFound`; no llega al controlador ni a `errorHandler`.

**Segunda prueba, logger sin `next()`:** se espera que la petición quede esperando, porque el logger solo instala el callback `finish` y no entrega el control a los siguientes middleware. Sin respuesta ni `next()`, ningún router puede responder.

**Pruebas experimentales pendientes:** no se movió ni alteró el middleware porque no se autorizó iniciar el servidor. Por tanto, las expectativas anteriores se deducen del flujo del código, no son resultados observados. Para obtener evidencias, realiza cada cambio por separado, reinicia, registra respuesta/timeout y consola, y restaura el código antes de la siguiente prueba.

## 11. Recorrido de las peticiones

En todos los casos, `requestId` asigna el identificador al entrar la petición. Si `LOG` no es `OFF`, el logger instala el callback `finish` y luego llama a `next()`. La entrada al logger ocurre al principio; el callback se ejecuta después de finalizar la respuesta y registra el estado final.

1. **Documento existente:** requestId → logger → parser JSON → router de documentos → controlador → servicio → respuesta 200. Al terminar, se ejecuta el callback `finish`. No se ejecuta `errorHandler`.
2. **Documento inexistente:** el controlador recibe `undefined` del servicio y pasa `ResourceNotFoundError` mediante `next(err)`. Express salta los middleware normales y ejecuta `errorHandler`, que genera el 404; luego ocurre `finish`.
3. **URL inexistente:** tras los routers, `notFound` genera el 404 y termina. No se ejecuta `errorHandler`; al terminar la respuesta, ocurre `finish`.
4. **Crear aviso con JSON válido y título inválido:** parser → router/controlador de avisos → `AppError` → `next(err)` → `errorHandler` (400). El callback `finish` registra el estado final.
5. **JSON mal formado:** el parser falla antes de los routers y entrega el error a `errorHandler`, que responde 400. El callback `finish` se ejecuta al terminar.
6. **PATCH con título vacío:** el controlador responde directamente 400 y retorna. No llama a `next(err)`, así que no ejecuta `errorHandler`; el callback `finish` registra la respuesta.

`notFound` no llama a `next()` porque ya respondió a una ruta que no existe. Cuando un controlador llama a `next(err)`, Express omite los middleware normales posteriores, incluido `notFound`, y busca el manejador de errores.

El manejador de errores necesita cuatro parámetros para que Express lo identifique como tal; el cuarto (`next`) puede no usarse, pero no se puede omitir. Una ruta inexistente significa que ningún router reconoce la URL; un recurso inexistente significa que una ruta válida buscó un identificador y no encontró el dato.

El logger escucha `finish` para registrar el código de estado final, una vez que la respuesta ya terminó. `requestId` relaciona el log de acceso y el log de error de una misma petición; ambos incluyen el mismo UUID. La colección Bruno permite repetir peticiones y observar esos registros, pero no se adjuntan registros reales de esta ejecución.

Separar router, controlador y servicio no es obligatorio en Express. La separación ayuda a mantener rutas, HTTP/validación y lógica/datos en responsabilidades distintas, facilita pruebas y evita duplicar lógica. Los avisos y documentos actuales viven en arrays en memoria; al reiniciar el proceso se pierden los avisos creados y vuelve la lista inicial porque no hay almacenamiento persistente.

## 12. Comprobaciones y entrega

`npm run typecheck` y `npm run lint` pasan desde `simulacro`. El proyecto se configura para puerto 4000 y `.env.example` contiene los valores de referencia sin secretos. La colección Bruno está en `bruno/`.

**Pendiente de evidencia runtime:** el servidor no se arrancó en esta ejecución; por ello falta confirmar mediante peticiones que documentos, preguntas, health y avisos responden en ejecución, y falta guardar las respuestas y logs de las pruebas de los puntos 9 y 10. No se introdujo ni quedó ningún error temporal en el código.
