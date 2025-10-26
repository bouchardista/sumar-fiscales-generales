# 🔐 Cómo Obtener el Token JWT

Para que el formulario funcione correctamente, necesitas un token JWT válido de la API.

## Paso 1: Obtener el Token

Necesitas hacer login en la API con credenciales de un usuario con rol **Fiscal General** (rol_id = 4).

### Usando curl:

```bash
curl -X POST https://api-fiscalizacion-2025.onrender.com/login/loginUsuario \
  -H "Content-Type: application/json" \
  -d '{
    "DNI": "TU_DNI_AQUI",
    "clave": "TU_PASSWORD_AQUI"
  }'
```

### Usando Postman o Insomnia:

```
POST https://api-fiscalizacion-2025.onrender.com/login/loginUsuario
Content-Type: application/json

{
  "DNI": "12345678",
  "clave": "tu_password"
}
```

### Respuesta exitosa:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjEsInJvbGVzIjpbey...",
  "usuario": {
    "idUsuario": 1,
    "apellido": "Pérez",
    "nombre": "Juan",
    "dni": "12345678"
  },
  "roles": [...]
}
```

## Paso 2: Configurar el Token en .env

Copia el valor del campo `token` de la respuesta y pégalo en el archivo `.env`:

```properties
VITE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjEsInJvbGVzIjpbey...
```

## Paso 3: Reiniciar el servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C si está corriendo)
# Luego volver a iniciar:
yarn dev
```

## ⚠️ Notas Importantes

1. **El token expira**: Si ves errores 401, necesitas obtener un nuevo token
2. **Rol requerido**: El usuario debe tener rol de Fiscal General (rol_id = 4)
3. **Seguridad**: Nunca subas el archivo `.env` a Git (ya está en `.gitignore`)

## 🆘 Necesitas credenciales?

Si no tienes un usuario con rol de Fiscal General, contacta al administrador del sistema para que:
- Te cree una cuenta
- Te asigne el rol correcto (Fiscal General, rol_id = 4)
- Te proporcione las credenciales (DNI y contraseña)
