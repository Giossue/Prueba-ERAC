| Archivo | Explicación fácil |
| --- | --- |
| `public/index.html` | La página web: formulario, pestañas y reportes. |
| `public/movil.html` | Las pantallas de solicitud y consulta para móvil. |
| `public/css/estilos.css` | La apariencia de ambas páginas. |
| `public/js/app.js` | Los botones, la fecha mínima y la comunicación con PHP. |
| `public/api/reservas.php` | Recibe las peticiones y decide qué hacer. |
| `src/validacion.php` | Comprueba los datos antes de guardarlos. |
| `src/ReservaRepositorio.php` | Contiene las consultas a la base de datos. |
| `src/BaseDatos.php` | Conecta PHP con PostgreSQL usando PDO. |
| `src/http.php` | Lee y devuelve datos en JSON; también responde errores. |
| `config/config.php` | Configuración de conexión a la base de datos. |
| `database/reservasdeportivas.sql` | Crea tablas, vista y datos de ejemplo. |


## cómo guarda y consulta?

En `public/api/reservas.php`:

- `GET` consulta solicitantes, espacios o reportes.
- `POST` registra una reserva.
- `PATCH` cambia el estado de una reserva pendiente.

Al recibir un `POST`, PHP llama a `validar_reserva()` en `src/validacion.php`. Esta función revisa la cédula, el espacio y que la fecha sea válida y no sea anterior a hoy, usando la zona horaria de Guayaquil. Si hay errores, responde `422`; si todo está bien, llama a `crear()`.

Las funciones principales de `src/ReservaRepositorio.php` son:

- `catalogos()`: obtiene los solicitantes y espacios.
- `listar()`: obtiene los reportes. Usa `JOIN` para unir reservas con los nombres de personas y espacios.
- `crear()`: inserta la reserva.
- `cambiarEstado()`: actualiza una reserva pendiente.

Ejemplo de cambio de estado:

```php
$consulta = $this->pdo->prepare("UPDATE reserva SET estado = :estado
    WHERE id_reserva = :id AND estado = 'Pendiente'");
$consulta->execute(['estado' => $estado, 'id' => $id]);
```

`UPDATE` cambia el estado. `WHERE` busca el identificador y exige que siga pendiente. `prepare()` y `execute()` envían los valores por separado: es una **consulta preparada** y ayuda a evitar inyección SQL.

## 5. JavaScript: ¿qué pasa en la página?

En `public/js/app.js`:

- `cargarCatalogos()` llena las listas de solicitantes y espacios.
- El evento `submit` ocurre al enviar el formulario; `preventDefault()` evita recargar la página.
- `llamarApi()` usa `fetch` para comunicarse con PHP.
- `mostrarErrores()` enseña qué campo necesita corrección.
- `mostrarTabla()` construye las filas de los reportes.
- `cambiarEstado()` envía la confirmación o el rechazo.
- `cargarReportes()` vuelve a pedir los datos después de un cambio.
- `data-pantalla` y `hidden` permiten cambiar de pestaña.

Los datos se colocan con `textContent`, para mostrarlos como texto y no como código HTML.

## 6. Preguntas rápidas

**¿Por qué validar en PHP si el navegador ya valida?** Porque se puede enviar una petición directamente a PHP sin usar el formulario.

**¿Qué hace `JOIN`?** Une tablas para mostrar, por ejemplo, el nombre del solicitante y del espacio de una reserva.

**¿Qué es JSON?** Un formato de texto para intercambiar datos entre JavaScript y PHP.

**¿Qué es una API?** El punto donde JavaScript solicita datos o envía acciones a PHP.

**¿Qué diferencia hay entre las fechas?** La fecha de uso es el día solicitado; la de registro es el día en que se creó la reserva.

**¿Qué pasa al confirmar o rechazar?** Se guarda el nuevo estado y se actualizan ambos reportes. La reserva desaparece de pendientes, pero sigue en el general.

**¿La vista móvil usa datos simulados?** No. Usa la misma API y base de datos que la página web.

## 7. Para explicarlo en voz alta

> «El formulario envía los datos con JavaScript a una API en PHP. PHP valida y usa consultas preparadas para guardar en PostgreSQL. La base relaciona solicitantes, espacios y reservas. El reporte general usa JOIN y el de pendientes usa una vista. Desde el reporte general se confirma o rechaza y se actualizan ambos reportes».

Para abrir el proyecto, ejecuta `php -S localhost:8000 -t public` y visita `http://localhost:8000`. PostgreSQL debe estar activo.
