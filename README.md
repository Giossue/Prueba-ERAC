# CRUD de productos — HTML, CSS, JS, PHP y PostgreSQL

Proyecto base: un CRUD de productos con un frontend en JavaScript puro (`fetch`)
y una API REST en JSON hecha con PHP sin frameworks, usando PDO y sentencias
preparadas.

## Estructura

```
config/config.php          Configuración de la base de datos (sobrescribible con variables de entorno)
database/schema.sql        Definición de la tabla y datos de ejemplo
public/                    Raíz web (la única carpeta que se sirve)
  index.html               Interfaz: formulario + tabla
  css/estilos.css          Estilos
  js/app.js                Lógica del frontend (fetch API)
  api/productos.php        Endpoint REST
src/
  BaseDatos.php            Conexión PDO compartida
  ProductoRepositorio.php  Consultas SQL
  http.php                 Funciones para responder JSON
  validacion.php           Validación de datos de entrada
```

Al dejar `src/` y `config/` fuera de `public/`, el navegador nunca puede
descargar el código PHP ni las credenciales.

## Instalación (una sola vez)

1. Crear el usuario y la base de datos: 

   ```bash
   sudo -iu postgres psql
   ```

   ```sql
   CREATE ROLE erac WITH LOGIN PASSWORD 'erac123';
   CREATE DATABASE "pruebaErac" OWNER erac ENCODING 'UTF8';
   \q
   ```

   Las comillas dobles en `"pruebaErac"` conservan la mayúscula; sin ellas
   PostgreSQL crearía `pruebaerac`.

2. Cargar el esquema y los datos de ejemplo:

   ```bash
   psql -h localhost -U erac -d pruebaErac -f database/schema.sql
   ```

## Ejecución

```bash
php -S localhost:8000 -t public
```

Abrir <http://localhost:8000>.

¿Otras credenciales? Se pueden cambiar sin tocar el código:

```bash
DB_USER=otro DB_PASS=secreto DB_NAME=mibase php -S localhost:8000 -t public
```

Variables disponibles: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.

## API

| Método | URL                        | Cuerpo | Respuesta correcta    |
|--------|----------------------------|--------|-----------------------|
| GET    | `/api/productos.php`        | —      | 200, lista            |
| GET    | `/api/productos.php?id=1`   | —      | 200, producto         |
| POST   | `/api/productos.php`        | JSON   | 201, producto creado  |
| PUT    | `/api/productos.php?id=1`   | JSON   | 200, producto editado |
| DELETE | `/api/productos.php?id=1`   | —      | 204, sin cuerpo       |

Cuerpo JSON:

```json
{ "nombre": "Teclado", "descripcion": "Mecánico", "precio": 49.9, "stock": 12 }
```

Los errores devuelven `{ "error": "..." }`. Si falla la validación, además
incluyen `detalles` con un mensaje por cada campo:

| Código | Significado                                   |
|--------|-----------------------------------------------|
| 400    | JSON inválido o `id` inválido                 |
| 404    | Producto no encontrado                        |
| 405    | Método no permitido                           |
| 422    | Validación fallida (ver `detalles`)            |
| 500    | Error de base de datos (se registra, no se muestra) |

Prueba rápida desde la terminal:

```bash
curl -s localhost:8000/api/productos.php
curl -s -X POST localhost:8000/api/productos.php \
     -H 'Content-Type: application/json' \
     -d '{"nombre":"Webcam","precio":35,"stock":4}'
```

## Buenas prácticas de seguridad aplicadas

- Sentencias preparadas en todas las consultas (evita la inyección SQL).
- Los datos se muestran en JS con `textContent` (evita XSS).
- Validación en el servidor; los atributos HTML del formulario son solo una ayuda.
- Los errores de base de datos se registran en el log y nunca se muestran al cliente.
