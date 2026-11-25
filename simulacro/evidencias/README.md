# Evidencias del simulacro

Las evidencias de las pruebas HTTP y de consola aún no están capturadas: no se inició el servidor en esta ejecución. No se incluyen respuestas ni logs inventados.

Guarda aquí, identificados por prueba, los pares de respuesta HTTP y log de servidor de:

- Punto 9: `development` y `production`, petición correcta y error inesperado temporal.
- Punto 10: `notFound` antes de routers y logger sin `next()`, cada fallo por separado.
- Punto 12: comprobaciones de documentos, preguntas, health y avisos.

La colección reproducible está en `../bruno/`; restaura cualquier fallo temporal y reinicia el servidor antes de cerrar las pruebas.
