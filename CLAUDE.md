# Prueba-ERAC

## Contexto

Este proyecto es la **preparación para una prueba técnica próxima**. El stack de la
prueba es **HTML, CSS, JavaScript, PHP y PostgreSQL**, sin frameworks.

El código actual (un CRUD de productos) es una **base de práctica**: la idea es
llegar a la prueba con el entorno probado y poder adaptar esta base rápido a lo
que pidan (otras tablas, formularios, login, relaciones, etc.).

Por eso el código debe ser fácil de leer y de **explicar en voz alta** durante la
prueba: se prefiere lo directo y conocido antes que lo ingenioso.

## Reglas del proyecto

Seguir siempre las reglas definidas en `rules.md`:

@rules.md

## Entorno

- PHP 8.5 puro, con PDO (`pdo_pgsql`). Sin Composer ni npm.
- PostgreSQL 18 local. Base `pruebaErac`, usuario `erac` (credenciales en
  `config/config.php`, sobrescribibles con `DB_HOST`, `DB_PORT`, `DB_NAME`,
  `DB_USER`, `DB_PASS`).
- Levantar el proyecto: `php -S localhost:8000 -t public`
- Recrear la base con los datos de ejemplo (borra la tabla `productos`):
  `psql -h localhost -U erac -d pruebaErac -f database/schema.sql`

## Estructura

```
config/config.php           Configuración de la base de datos
database/schema.sql         Tablas y datos de ejemplo
public/                     Raíz web: lo único que ve el navegador
  index.html, css/, js/     Interfaz (JS con fetch hacia la API)
  api/productos.php         Endpoint REST en JSON
src/                        PHP fuera de la raíz web
  BaseDatos.php             Conexión PDO compartida
  ProductoRepositorio.php   Consultas SQL de productos
  http.php                  responder_json(), responder_error(), leer_cuerpo_json(), obtener_id()
  validacion.php            validar_producto()
```

El detalle de la API (métodos, códigos de respuesta, formato JSON) está en `README.md`.

## Convenciones

- Todas las consultas con **sentencias preparadas** (`prepare` + `execute`).
- En JS, mostrar datos con `textContent`, nunca con `innerHTML`.
- Validar siempre en el servidor; los atributos HTML son solo una ayuda.
- La API responde JSON: `{ "error": "..." }` en los errores y `detalles` por
  campo cuando falla la validación (código 422).
- Los errores de base de datos se registran con `error_log` y no se muestran al cliente.

### Para agregar una entidad nueva (por ejemplo, categorías)

Seguir el mismo patrón que productos:

1. Tabla en `database/schema.sql`.
2. Repositorio en `src/` (copiar `ProductoRepositorio.php`).
3. Función de validación en `src/validacion.php`.
4. Endpoint en `public/api/` (copiar `productos.php`).
5. Interfaz en `public/`.

## Verificación

No hay suite de tests. Para comprobar un cambio:

- `php -l` sobre los archivos PHP modificados y `node --check public/js/app.js`.
- Probar los endpoints con `curl` (casos correctos y de error).
- Abrir la página en el navegador y probar el flujo completo.
