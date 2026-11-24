# Carpeta donde realizaremos el simulacro de examen

----------------------
## Cómo se instala y arranca tu proyecto.

npm i <- para instalar modulos 
npm run dev <- lo inicia en modo desarrollo
----------------------------------------------
npm run build <- compila el codigo
npm run start <- ejecuta el codigo compilado


## Dónde se configura el puerto y cómo llega ese valor hasta el arranque del servidor.

se modifica en .env este pasa a una constante llamada env en env.ts que se usa en server.ts

---------
## Por qué se sube a GitHub el .env.example y se excluye .env.
El .env.example se usa de modelo para saber que valores poner pero no el valor exacto
El env se excluye para no publicar claves de valor al público(informacion sensible).
