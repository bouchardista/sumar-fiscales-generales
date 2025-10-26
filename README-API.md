# API de Fiscales Electorales

API REST desarrollada con Express y PostgreSQL para gestionar escuelas, mesas, fiscales y reportes de incidencias durante la jornada electoral.

> **Última actualización**: 26 de octubre de 2025  
> **Versión**: 2.1.0  
> **Estado**: ✅ Todos los endpoints adaptados al esquema `dev`

## 📚 Tabla de contenido
- **Convenciones y formato**
- **Base URL**
- **Sistema de Roles** ⭐ NUEVO
- **Autenticación JWT** ⭐ ACTUALIZADO
- **Escuelas**
- **Elecciones**
- **Fiscales** ⭐ ACTUALIZADO
- **Departamentos** ⭐ NUEVO
- **Incidencias**
- **Links Únicos JWT**
- **Estructura del Proyecto**
- **Stack Tecnológico**

## 🧾 Convenciones y formato
- **Content-Type**: todas las peticiones deben enviarse como `application/json`.
- **Respuestas exitosas**: devuelven `success` (booleano) o los datos solicitados.
- **Respuestas de error**: devuelven `error` (string) y un código HTTP acorde (`4xx` o `5xx`).
- **Timestamps**: se serializan en formato `YYYY-MM-DD HH:mm:ss` (zona horaria del servidor).

## 📌 Base URL
```
https://api-fiscaleslla.onrender.com
```

## 👥 Sistema de Roles

La API utiliza un sistema de roles con permisos hardcodeados en código. Cada usuario puede tener uno o más roles con alcances territoriales específicos.

### Roles Disponibles

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **admin** | Administrador del sistema | Acceso total sin restricciones territoriales |
| **coordinador** | Coordinador territorial | Gestión de múltiples escuelas en su alcance |
| **fiscal_general** | Fiscal general de escuela | Gestión de su escuela y fiscales asignados |
| **fiscal_mesa** | Fiscal de mesa | Solo carga de acta de su mesa |
| **fiscal_suplente** | Fiscal suplente | Similar a fiscal_mesa |

### Alcance Territorial

Cada rol puede tener alcance a nivel de:
- **Provincia** (`idProvincia`)
- **Departamento** (`idDepartamento`)
- **Circuito** (`idCircuito`)
- **Escuela** (`idEscuela`)
- **Mesa** (`idMesa`)

El rol **admin** tiene acceso a todos los niveles sin restricciones.

## 🔐 Autenticación JWT

### `POST /login/loginUsuario`
- **Descripción**: autentica un usuario por DNI y contraseña, devuelve un JWT con sus roles y alcances. **Solo permite acceso a usuarios con rol de Fiscal General (rol_id = 4)**.
- **Body JSON**:
```json
{
  "DNI": "12345678",
  "clave": "password"
}
```
- **Respuesta 200**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "idUsuario": 1,
    "apellido": "Pérez",
    "nombre": "Juan",
    "telefono": "3511234567",
    "dni": "12345678",
    "fuerza_politica": "La Libertad Avanza"
  },
  "roles": [
    {
      "rol": "fiscal_general",
      "alcance": {
        "idProvincia": null,
        "idDepartamento": null,
        "idCircuito": null,
        "idEscuela": 5,
        "idMesa": null
      }
    }
  ]
}
```
- **Errores**:
  - **401**: credenciales inválidas, usuario inactivo o sin roles asignados.
  - **403**: usuario no tiene rol de Fiscal General.
  - **500**: error de conexión o consulta a la base de datos.

### Uso del Token JWT

Todos los endpoints protegidos requieren el token JWT en el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Variables de Entorno
```env
JWT_SECRET=tu-clave-secreta-muy-larga
JWT_EXPIRATION=24h
```

## 🏫 Escuelas

### `GET /escuela/InfoEscuela/:idEscuela`
- **Descripción**: devuelve la información completa de la escuela, incluyendo mesas con fiscales, fiscales suplentes, listas políticas y resultados de escrutinio.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idEscuela`**: entero mayor a 0.
- **Respuesta 200**:
```json
{
  "idEscuela": 1,
  "circuito": "Circuito Centro",
  "departamento": "Capital",
  "provincia": "Córdoba",
  "nombreEstablecimiento": "Colegio Nacional",
  "direccionEscuela": "Av. Siempre Viva 123",
  "cantElectores": 3200,
  "estado": true,
  "mesas": [
    {
      "idMesa": 10,
      "idUsuario": 5,
      "apellido": "Gómez",
      "nombre": "Ana",
      "dni": "25444555",
      "telefono": "3514448899",
      "cantVotos": 120,
      "ultimaHoraCargaVot": "2025-10-03 15:45:12",
      "cantElectores": 250,
      "asistencia": true,
      "fuerza_politica": "La Libertad Avanza",
      "observaciones": "Turno mañana"
    }
  ],
  "fiscalesSuplentes": [
    {
      "idFiscalMesa": 12,
      "apellido": "López",
      "nombre": "Carla",
      "dni": "32145879",
      "telefono": "3515550000",
      "fuerza_politica": "La Libertad Avanza",
      "observaciones": "Disponible desde las 08:00"
    }
  ],
  "listas": [
    { "idLista": 1, "nombre": "La Libertad Avanza", "rutaLogo": null },
    { "idLista": "blanco", "nombre": "Votos en blanco" },
    { "idLista": "nulos", "nombre": "Votos nulos" },
    { "idLista": "recurridos", "nombre": "Votos recurridos" },
    { "idLista": "impugnados", "nombre": "Votos de identidad impugnada" },
    { "idLista": "total", "nombre": "Total de votos" }
  ],
  "resultados": [
    {
      "idMesa": 10,
      "votos": {
        "1": 120,
        "2": 98,
        "blanco": 10,
        "nulos": 5,
        "total": 233
      }
    }
  ]
}
```
- **Notas**: 
  - Los flags de configuración global se obtienen mediante `/escuela/ConfiguracionEscrutinio`
  - Fiscales suplentes se listan por separado
  - Campo `asistencia` indica si el fiscal está presente
  - Resultados de escrutinio por mesa cuando existen
  - Siempre se anexan al final de `listas` los identificadores especiales
- **Errores**:
  - **404**: escuela no encontrada.
  - **500**: fallo al ejecutar la consulta.

### `PUT /escuela/AbrirEscuela/:idEscuela`
- **Descripción**: marca una escuela como abierta y registra la hora de apertura en base de datos. Valida que el flag `abrir_escuelas` esté habilitado en `seteo_manual`.
- **Autenticación**: requiere token JWT con rol `fiscal_general` o `admin`.
- **Parámetros**:
  - **Path `idEscuela`**: entero.
- **Body JSON**:
```json
{
  "fechaApertura": "2025-10-03T08:00:00-03:00"
}
```
- **Respuesta 200**:
```json
{
  "success": true,
  "mensaje": "Escuela abierta",
  "fechaApertura": "2025-10-03T08:00:00-03:00"
}
```
- **Errores**:
  - **403**: funcionalidad de abrir escuelas deshabilitada en configuración.
  - **404**: escuela no encontrada.
  - **500**: error al actualizar.

### `GET /escuela/departamento/:idDepartamento`
- **Descripción**: obtiene todas las escuelas de un departamento específico con su ID, nombre, dirección y circuito.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idDepartamento`**: entero (ID del departamento).
- **Respuesta 200**:
```json
{
  "success": true,
  "escuelas": [
    {
      "idEscuela": 15,
      "descripcion": "ESCUELA JOSE HERNANDEZ",
      "direccion": "AV. COLON 1234",
      "idCircuito": 5,
      "circuito": "CIRCUITO 1"
    },
    {
      "idEscuela": 28,
      "descripcion": "COLEGIO NACIONAL MONSERRAT",
      "direccion": "OBISPO TREJO 294",
      "idCircuito": 5,
      "circuito": "CIRCUITO 1"
    }
  ],
  "total": 2
}
```
- **Errores**:
  - **400**: `idDepartamento` inválido.
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **500**: error al consultar escuelas.

### `GET /escuela/ConfiguracionEscrutinio`
- **Descripción**: obtiene el estado de las configuraciones globales de escrutinio y apertura de escuelas.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Respuesta 200**:
```json
{
  "abrir_escuelas": true,
  "escrutinio_provisorio_habilitado": true,
  "escrutinio_definitivo_habilitado": false
}
```
- **Respuesta 200 (sin configuración)**:
```json
{
  "abrir_escuelas": false,
  "escrutinio_provisorio_habilitado": false,
  "escrutinio_definitivo_habilitado": false,
  "mensaje": "No hay configuración establecida, usando valores por defecto"
}
```
- **Notas**:
  - Devuelve valores por defecto (`false`) si no existe configuración
  - Útil para habilitar/deshabilitar funcionalidades en el frontend
- **Errores**:
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **500**: error al consultar.

## 🗳️ Elecciones

### `PUT /elecciones/ActualizarCantVotos/:idMesa`
- **Descripción**: actualiza la cantidad total de votos informados por una mesa.
- **Autenticación**: requiere token JWT con rol `fiscal_mesa`, `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idMesa`**: entero.
- **Body JSON**:
```json
{
  "cantVotos": 123
}
```
- **Respuesta 200**: `{ "success": true, "mensaje": "Cantidad de votos actualizada correctamente." }`
- **Errores**:
  - **400**: `idMesa` o `cantVotos` inválidos.
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **404**: mesa inexistente.
  - **500**: error al actualizar.

### `POST /elecciones/CargaActaEscrutinio/:idMesa`
- **Descripción**: registra el acta de escrutinio para una mesa mediante transacción SQL. Previene duplicados, actualiza automáticamente `cantVotos` en la mesa y marca el acta como `enviado=true`.
- **Autenticación**: requiere token JWT con rol `fiscal_mesa`, `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idMesa`**: entero.
- **Body JSON**:
```json
{
  "votosBlanco": 10,
  "votosNulos": 5,
  "votosRecurridos": 2,
  "votosImpugnados": 3,
  "total": 341,
  "URL_Acta": "https://example.com/actas/mesa-1.png",
  "detalleListas": [
    { "idLista": 1, "votos": 120 },
    { "idLista": 2, "votos": 98 },
    { "nombre": "Unión por la Patria", "votos": 103 }
  ]
}
```
- **Campos**:
  - `detalleListas`: obligatorio, al menos un elemento. Puede usar `idLista` (entero) o `nombre` (string que coincida con lista existente).
  - `URL_Acta`: opcional, URL o path de la imagen del acta.
  - `total`: suma total de votos (se valida).
- **Respuesta 201**:
```json
{
  "success": true,
  "idEscrutinio": 42,
  "detallesRegistrados": 3,
  "mensaje": "Acta de escrutinio cargada con éxito."
}
```
- **Errores**:
  - **400**: `idMesa` inválido, `total` negativo o `detalleListas` mal formado.
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **404**: mesa no encontrada.
  - **409**: ya existe un acta para esta mesa.
  - **500**: error al insertar el acta o sus detalles.

## 👤 Fiscales

### `GET /fiscales/escuela/:idEscuela`
- **Descripción**: lista todos los fiscales (mesa y suplentes) de una escuela.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idEscuela`**: entero.
- **Respuesta 200**:
```json
{
  "fiscalesMesa": [
    {
      "idUsuario": 5,
      "apellido": "Gómez",
      "nombre": "Ana",
      "dni": "25444555",
      "telefono": "3514448899",
      "fuerza_politica": "La Libertad Avanza",
      "observaciones": "Turno mañana",
      "activo": true,
      "rol": "fiscal_mesa",
      "idMesa": 10
    }
  ],
  "fiscalesSuplentes": [
    {
      "idUsuario": 12,
      "apellido": "López",
      "nombre": "Carla",
      "dni": "32145879",
      "telefono": "3515550000",
      "fuerza_politica": "La Libertad Avanza",
      "observaciones": "Disponible desde las 08:00",
      "activo": true,
      "rol": "fiscal_suplente",
      "idMesa": null
    }
  ],
  "total": 2,
  "mensaje": "Fiscales encontrados"
}
```
- **Errores**:
  - **401**: token inválido o expirado.
  - **403**: sin permisos para acceder a esta escuela.
  - **500**: error al consultar.

### `POST /fiscales/crear`
- **Descripción**: crea un nuevo fiscal (general o de mesa) con asignación a escuela. Valida que la escuela exista. **Nota**: DNI y teléfono ya no son únicos, se permiten duplicados.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Body JSON**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "id_rol": 4,
  "idEscuela": 5,
  "telefono": "3511234567",
  "fuerza_politica": "La Libertad Avanza",
  "observaciones": "Fiscal de turno mañana"
}
```
- **Campos**:
  - `nombre`, `apellido`, `dni`, `id_rol`, `idEscuela`: **requeridos**
  - `telefono`, `fuerza_politica`, `observaciones`: opcionales
  - `id_rol`: 3 (fiscal_mesa) o 4 (fiscal_general)
- **Respuesta 201**:
```json
{
  "success": true,
  "mensaje": "Fiscal General creado con éxito",
  "idUsuario": 123,
  "rol": "fiscal_general"
}
```
- **Errores**:
  - **400**: campos requeridos faltantes o rol inválido.
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **404**: escuela no encontrada.
  - **500**: error al crear fiscal.

### `POST /fiscales/agregar`
- **Descripción**: crea un nuevo fiscal (mesa o suplente). Valida que la mesa exista, que pertenezca a la escuela indicada y que no tenga otro fiscal asignado. **Nota**: DNI y teléfono ya no son únicos, se permiten duplicados.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Body JSON**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "telefono": "3511234567",
  "idEscuela": 5,
  "idMesa": 10,
  "rol": "fiscal_mesa",
  "fuerza_politica": "La Libertad Avanza",
  "observaciones": "Turno mañana"
}
```
- **Campos**:
  - `rol`: debe ser `"fiscal_mesa"` o `"fiscal_suplente"`
  - `idMesa`: requerido solo para `fiscal_mesa`
  - `idEscuela`: requerido para asignar el alcance territorial
- **Respuesta 201**:
```json
{
  "success": true,
  "mensaje": "Fiscal de mesa creado con éxito",
  "idUsuario": 123,
  "accion": "creado"
}
```
- **Errores**:
  - **400**: campos requeridos faltantes, rol inválido o mesa no pertenece a la escuela.
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **404**: mesa no encontrada.
  - **409**: la mesa ya tiene un fiscal asignado.
  - **500**: error al crear fiscal.

### `PUT /fiscales/:idUsuario`
- **Descripción**: actualiza los datos de un fiscal, incluyendo asistencia, DNI, rol y asignación de mesa/escuela. Si se actualiza `asistencia`, valida que el flag `boton_asistencia` esté habilitado en `seteo_manual`. **Nota**: DNI y teléfono ya no son únicos, se permiten duplicados.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idUsuario`**: entero.
- **Body JSON** (todos los campos son opcionales):
```json
{
  "nombre": "Claudia",
  "apellido": "Suarez",
  "dni": "30123456",
  "telefono": "3517778899",
  "fuerza_politica": "La Libertad Avanza",
  "observaciones": "Asignada a mesa 102",
  "activo": true,
  "asistencia": true,
  "rol": "fiscal_mesa",
  "idMesa": 15,
  "idEscuela": 5
}
```
- **Campos especiales**:
  - `dni`: se permite duplicados
  - `telefono`: se permite duplicados
  - `asistencia`: requiere que `boton_asistencia` esté habilitado en `seteo_manual`
  - `rol`: puede cambiar entre `fiscal_mesa` y `fiscal_suplente`, reasigna en `usuario_rol_alcance`
  - `idMesa`: solo para `fiscal_mesa`, valida que exista y no tenga otro fiscal
  - `idEscuela`: solo para `fiscal_suplente`, valida que exista
- **Respuesta 200**: `{ "success": true, "mensaje": "Datos actualizados correctamente" }`
- **Errores**:
  - **400**: `idUsuario` inválido, sin campos para actualizar o rol inválido.
  - **401**: token inválido o expirado.
  - **403**: sin permisos o funcionalidad de asistencia deshabilitada.
  - **404**: usuario, mesa o escuela no encontrada.
  - **409**: mesa ya tiene otro fiscal asignado.
  - **500**: error al actualizar.

### `DELETE /fiscales/:idUsuario`
- **Descripción**: desactiva un fiscal (marca `activo=false`) y elimina sus asignaciones de rol.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Parámetros**:
  - **Path `idUsuario`**: entero.
- **Respuesta 200**:
```json
{
  "success": true,
  "mensaje": "Fiscal eliminado correctamente"
}
```
- **Errores**:
  - **400**: `idUsuario` inválido.
  - **401**: token inválido o expirado.
  - **403**: sin permisos.
  - **404**: fiscal no encontrado.
  - **500**: error al eliminar.

## 🗺️ Departamentos

### `GET /departamentos`
- **Descripción**: obtiene todos los departamentos de Córdoba con su ID y descripción, ordenados alfabéticamente.
- **Autenticación**: requiere token JWT.
- **Respuesta 200**:
```json
{
  "success": true,
  "departamentos": [
    {
      "idDepartamento": 2,
      "descripcion": "CALAMUCHITA"
    },
    {
      "idDepartamento": 1,
      "descripcion": "CAPITAL"
    },
    {
      "idDepartamento": 3,
      "descripcion": "COLON"
    }
  ],
  "total": 26
}
```
- **Errores**:
  - **401**: token inválido o expirado.
  - **500**: error al consultar departamentos.

## ⚠️ Incidencias

### `POST /incidencias/AgregarIncidencia/:idCategoria`
- **Descripción**: registra una incidencia asociada al fiscal general indicado. Internamente se utiliza el `idUsuario` asociado a ese fiscal general.
- **Parámetros**:
  - **Path `idCategoria`**: entero (`CategoriasIncidentes.idCategoria`).
- **Body JSON**:
```json
{
  "idFiscalGeneral": 1,
  "observaciones": "Faltan boletas en la mesa 3"
}
```
- **Respuesta 200**:
```json
{
  "success": true,
  "mensaje": "Incidencia creada con éxito con el nº de ticket: 15."
}
```
- **Errores**:
  - **400**: parámetros inválidos o faltantes.
  - **404**: fiscal general inexistente.
  - **500**: error al registrar la incidencia.

## 🔗 Links Únicos JWT

Módulo de seguridad que permite generar links únicos de un solo uso para que fiscales de mesa accedan a un formulario de carga de actas. Los links son JWT firmados con HS256, tienen expiración configurable (24h por defecto) y se invalidan automáticamente al ser usados o cuando la mesa es marcada como enviada.

### Características de Seguridad
- ✅ **JWT HS256** con TTL configurable
- ✅ **One-time use**: cada link solo puede usarse una vez
- ✅ **Stateless**: no requiere almacenamiento de tokens
- ✅ **Validación automática**: links inválidos si la mesa ya fue enviada
- ✅ **Blacklist opcional**: revocación manual de tokens
- ✅ **Auditoría**: registro de IP y user-agent en cada envío

### Variables de Entorno Requeridas
```env
JWT_LINK_SECRET=una-clave-larga-y-segura-cambiar-en-produccion
JWT_LINK_TTL_HOURS=24
BASE_PUBLIC_URL=https://appfiscales.ar
```

### `POST /api/links/emit`
- **Descripción**: genera un link único JWT para que un fiscal de mesa acceda al formulario de carga. El link contiene el `idFiscal` y `idMesa` codificados y firmados.
- **Autenticación**: requiere token JWT con rol `fiscal_general`, `coordinador` o `admin`.
- **Body JSON**:
```json
{
  "idFiscal": 123,
  "idMesa": 456
}
```
- **Respuesta 200**:
```json
{
  "url": "https://appfiscales.ar/carga?tk=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "jti": "550e8400-e29b-41d4-a716-446655440000"
}
```
- **Errores**:
  - **400**: `idFiscal` o `idMesa` inválidos (deben ser enteros).
  - **409**: `{ "error": "No se puede generar link: la mesa ya fue enviada." }` - la mesa ya tiene un acta con `enviado=true`.
  - **500**: error al generar el link.

### `GET /api/form-access`
- **Descripción**: verifica que el token JWT sea válido y devuelve los datos del fiscal y mesa asociados. Permite al frontend validar el acceso antes de mostrar el formulario.
- **Autenticación**: token JWT en query param `tk` o header `Authorization: Bearer <token>`.
- **Query Params**:
  - `tk`: token JWT (requerido si no se envía en header).
- **Ejemplo**:
```bash
GET /api/form-access?tk=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Respuesta 200**:
```json
{
  "idFiscal": 123,
  "idMesa": 456,
  "permiteEditar": true
}
```
- **Errores**:
  - **401**: `{ "error": "Token requerido" }` - no se envió token.
  - **401**: `{ "error": "Link inválido o vencido" }` - token expirado, malformado o con firma inválida.
  - **401**: `{ "error": "Link inválido: la mesa ya fue enviada." }` - la mesa tiene `enviado=true`.
  - **401**: `{ "error": "Link revocado." }` - el token fue revocado manualmente (blacklist).

### `POST /api/carga`
- **Descripción**: envía el formulario de carga de acta. El link se invalida automáticamente al usarse (one-time use) mediante el campo `jti` único en la base de datos. Los datos de `idFiscal` e `idMesa` se toman del token JWT, no del body.
- **Autenticación**: token JWT en query param `tk` o header `Authorization: Bearer <token>`.
- **Query Params**:
  - `tk`: token JWT (requerido si no se envía en header).
- **Body JSON**:
```json
{
  "datos": {
    "votosBlancos": 5,
    "votosNulos": 3,
    "votosRecurridos": 0,
    "votosImpugnados": 0,
    "mesaImpugnada": false,
    "url_acta": "https://ejemplo.com/acta.jpg",
    "recurridos_lla": false,
    "carga_erronea": false,
    "acta_sospechosa": false,
    "votos": {
      "1": 100,
      "2": 25,
      "3": 50
    }
  }
}
```
- **Campos del objeto `datos`**:
  - `votosBlancos`, `votosNulos`, `votosRecurridos`, `votosImpugnados`: enteros (default: 0).
  - `mesaImpugnada`, `recurridos_lla`, `carga_erronea`, `acta_sospechosa`: booleanos (default: false).
  - `url_acta`: string opcional con URL de la imagen del acta.
  - `votos`: objeto con `idLista` como clave y cantidad de votos como valor.
- **Respuesta 201**:
```json
{
  "ok": true
}
```
- **Errores**:
  - **401**: errores de autenticación (ver `/api/form-access`).
  - **409**: `{ "error": "El formulario ya fue enviado (link usado)." }` - el link ya fue utilizado anteriormente (violación de constraint único en `jti`).
  - **500**: `{ "error": "Error al guardar el formulario" }` - error en la transacción de base de datos.

### Flujo Completo de Uso

1. **Fiscal General genera link**:
```bash
curl -X POST http://localhost:3001/api/links/emit \
  -H "Content-Type: application/json" \
  -d '{"idFiscal": 123, "idMesa": 456}'
```

2. **Fiscal de Mesa accede al formulario**:
```bash
curl "http://localhost:3001/api/form-access?tk=<TOKEN>"
```

3. **Fiscal de Mesa envía el formulario** (primera vez):
```bash
curl -X POST "http://localhost:3001/api/carga?tk=<TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"datos": {"votosBlancos": 5, "votos": {"1": 100}}}'
# → 201 { "ok": true }
```

4. **Intento de reenvío** (falla por one-time use):
```bash
curl -X POST "http://localhost:3001/api/carga?tk=<TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"datos": {}}'
# → 409 { "error": "El formulario ya fue enviado (link usado)." }
```

### Migración de Base de Datos

Antes de usar este módulo, ejecutar la migración SQL:
```bash
psql -U your_db_user -d your_db_name -f scripts/migration-jwt-links.sql
```

Esta migración agrega:
- Columna `jti` a la tabla `ActaEscrutinio`
- Índice único `ux_acta_jti` para garantizar one-time use
- Índice de performance `idx_acta_enviada_por_mesa`
- Tabla opcional `jwt_jti_blacklist` para revocación manual

## 🧱 Estructura del Proyecto
- **`index.js`**: punto de entrada del servidor Express.
- **`data/db.js`**: configuración y helpers del pool de PostgreSQL.
- **`routes/`**: agrupa los archivos de rutas:
  - `login.routes.js` - autenticación JWT con roles ⭐
  - `escuela.routes.js` - gestión de escuelas ⭐
  - `elecciones.routes.js` - carga de actas y resultados ⭐
  - `fiscales.routes.js` - gestión de fiscales (CRUD completo) ⭐
  - `incidencias.routes.js` - registro de incidencias
  - `links.routes.js` - emisión de links únicos JWT
  - `access.routes.js` - acceso y carga mediante links JWT
- **`middleware/`**: middlewares personalizados:
  - `auth.js` - autenticación JWT y verificación de roles ⭐
  - `jwtLinkAuth.js` - validación de tokens JWT para links únicos
- **`services/`**: lógica de negocio:
  - `roleService.js` - permisos hardcodeados por rol ⭐
  - `linkService.js` - generación de links JWT
  - `blacklistService.js` - gestión de revocación de tokens
- **`scripts/`**: migraciones y esquemas SQL:
  - `schema-db-app.sql` - definición del esquema de base de datos ⭐
  - `datos-prueba.sql` - datos de prueba para testing ⭐ NUEVO
  - `migration-jwt-links.sql` - migración para módulo de links únicos
- **Documentación**:
  - `ENDPOINTS_ADAPTADOS.md` - documentación detallada de endpoints ⭐ NUEVO
  - `RESUMEN_ADAPTACION.md` - resumen ejecutivo de cambios ⭐ NUEVO
  - `GUIA_RAPIDA.md` - guía rápida de uso ⭐ NUEVO

## ⚙️ Stack Tecnológico
- **Servidor**: Node.js + Express 5.
- **Base de datos**: PostgreSQL 17.4 (esquema `dev`).
- **Autenticación**: JWT (jsonwebtoken) con HS256.
- **Manejo de fechas**: `dayjs`.
- **Generación de UUIDs**: `uuid` v4.
- **Puerto por defecto**: `3001`.

## 📖 Documentación Adicional

Para información más detallada, consultar:

- **`GUIA_RAPIDA.md`**: Configuración inicial, credenciales de prueba y ejemplos con curl
- **`ENDPOINTS_ADAPTADOS.md`**: Documentación completa de cada endpoint con ejemplos
- **`RESUMEN_ADAPTACION.md`**: Resumen ejecutivo de cambios y breaking changes
- **`RESUMEN_IMPLEMENTACION.md`**: Arquitectura del sistema de roles
- **`INSTRUCCIONES_FINALES.md`**: Pasos para completar la migración

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crear archivo `.env`:
```env
DB_USER=tu_usuario
DB_HOST=localhost
DB_DATABASE=nombre_bd
DB_PASSWORD=tu_password
DB_PORT=5432

JWT_SECRET=clave-secreta-muy-larga-cambiar-en-produccion
JWT_EXPIRATION=24h

PORT=3001
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Cargar Datos de Prueba
```bash
psql -U tu_usuario -d nombre_bd -f scripts/datos-prueba.sql
```

### 4. Iniciar Servidor
```bash
npm start
```

### 5. Probar Login
```bash
curl -X POST http://localhost:3001/login/loginUsuario \
  -H "Content-Type: application/json" \
  -d '{"DNI": "00000000", "clave": "admin123"}'
```

## ⚠️ Notas Importantes

### Seguridad en Producción
- 🔴 **Cambiar contraseñas a bcrypt** (actualmente en texto plano)
- 🔴 **Cambiar JWT_SECRET** a una clave segura (mínimo 32 caracteres)
- 🔴 **Configurar CORS** adecuadamente
- 🔴 **Implementar rate limiting**

### Breaking Changes
- Todos los endpoints ahora usan esquema `dev` en lugar de `public`
- Sistema de roles completamente nuevo basado en `usuario_rol_alcance`
- JWT obligatorio en todos los endpoints protegidos
- Endpoints de fiscales cambiaron (ver documentación)

### Credenciales de Prueba

| Rol | DNI | Clave |
|-----|-----|-------|
| Admin | `00000000` | `admin123` |
| Coordinador | `11111111` | `coord123` |
| Fiscal General | `12345678` | `fiscal123` |
| Fiscal Mesa | `25444555` | `mesa123` |
| Fiscal Suplente | `32145879` | `suplente123` |
