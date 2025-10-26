// Servicio para interactuar con la API de fiscales
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-fiscalizacion-2025.onrender.com';

// Credenciales hardcodeadas para autenticación
const AUTH_CREDENTIALS = {
  DNI: "37732822",
  clave: "37732822"
};

// IMPORTANTE: Las escuelas DEBEN venir de la API real
// Si falla la autenticación, el formulario mostrará un error
const USE_MOCK_ON_AUTH_FAIL = false;

export interface Departamento {
  idDepartamento: number;
  descripcion: string;
}

export interface Escuela {
  idEscuela: number;
  descripcion: string;
  direccion: string;
  idCircuito: number;
  circuito: string;
}

export interface CrearFiscalPayload {
  nombre: string;
  apellido: string;
  dni: string;
  id_rol: number; // 3 = fiscal_mesa, 4 = fiscal_general
  idEscuela: number;
  telefono?: string;
  fuerza_politica?: string;
  observaciones?: string;
}

class FiscalesApiService {
  private token: string | null = null;

  // Login para obtener el token JWT
  private async login(): Promise<string> {
    try {
      console.log('🔐 Intentando login con DNI:', AUTH_CREDENTIALS.DNI);
      const response = await fetch(`${API_BASE_URL}/login/loginUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(AUTH_CREDENTIALS)
      });

      console.log('📡 Respuesta de login:', response.status, response.statusText);

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error('❌ Error en login:', data.mensaje);
        throw new Error(`❌ Autenticación fallida: ${data.mensaje}. Por favor, verifica las credenciales en fiscalesApi.ts`);
      }

      console.log('✅ Login exitoso, token obtenido');
      this.token = data.token;
      return data.token;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    // Si no hay token, hacer login primero
    if (!this.token) {
      await this.login();
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  async obtenerDepartamentos(): Promise<Departamento[]> {
    try {
      console.log('📍 Obteniendo departamentos desde API...');
      const headers = await this.getHeaders();
      
      console.log('🔑 Headers listos, haciendo fetch a /departamentos');
      
      const response = await fetch(`${API_BASE_URL}/departamentos`, {
        headers
      });

      console.log('📡 Respuesta departamentos:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar relogin
          console.log('🔄 Token expirado, reintentando con nuevo login...');
          this.token = null;
          const newHeaders = await this.getHeaders();
          const retryResponse = await fetch(`${API_BASE_URL}/departamentos`, {
            headers: newHeaders
          });
          if (!retryResponse.ok) {
            throw new Error('❌ Error de autenticación después de reintentar.');
          }
          const retryData = await retryResponse.json();
          console.log('✅ Departamentos obtenidos después de relogin:', retryData.total);
          return retryData.departamentos || [];
        }
        if (response.status === 404) {
          throw new Error('❌ Endpoint /departamentos no encontrado. Verifica la URL de la API.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('✅ Departamentos obtenidos desde API:', data.total || data.departamentos?.length);
      return data.departamentos || [];
    } catch (error) {
      console.error('❌ Error al obtener departamentos:', error);
      throw error;
    }
  }

  async obtenerEscuelasPorDepartamento(idDepartamento: number): Promise<Escuela[]> {
    try {
      console.log(`🏫 Obteniendo escuelas para departamento ${idDepartamento} desde API...`);
      const headers = await this.getHeaders();
      
      const response = await fetch(`${API_BASE_URL}/escuela/departamento/${idDepartamento}`, {
        headers
      });

      console.log('📡 Respuesta escuelas:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔄 Token expirado, reintentando...');
          this.token = null;
          const newHeaders = await this.getHeaders();
          const retryResponse = await fetch(`${API_BASE_URL}/escuela/departamento/${idDepartamento}`, {
            headers: newHeaders
          });
          if (!retryResponse.ok) {
            throw new Error('❌ Error de autenticación después de reintentar.');
          }
          const retryData = await retryResponse.json();
          console.log('✅ Escuelas obtenidas después de relogin:', retryData.total);
          return retryData.escuelas || [];
        }
        throw new Error(`❌ Error al obtener escuelas: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Escuelas obtenidas desde API para departamento ${idDepartamento}:`, data.total || data.escuelas?.length);
      return data.escuelas || [];
    } catch (error) {
      console.error('❌ Error al obtener escuelas:', error);
      throw error;
    }
  }

  async crearFiscal(payload: CrearFiscalPayload) {
    try {
      console.log('📝 Creando fiscal en API...', payload);
      const headers = await this.getHeaders();
      
      const response = await fetch(`${API_BASE_URL}/fiscales/crear`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      console.log('📡 Respuesta crear fiscal:', response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔄 Token expirado, reintentando...');
          this.token = null;
          const newHeaders = await this.getHeaders();
          const retryResponse = await fetch(`${API_BASE_URL}/fiscales/crear`, {
            method: 'POST',
            headers: newHeaders,
            body: JSON.stringify(payload)
          });
          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryData.error || '❌ Error al crear fiscal después de reintentar');
          }
          console.log('✅ Fiscal creado después de relogin');
          return retryData;
        }
        throw new Error(data.error || `❌ Error al crear fiscal: ${response.status}`);
      }

      console.log('✅ Fiscal creado exitosamente en API');
      return data;
    } catch (error) {
      console.error('❌ Error al crear fiscal:', error);
      throw error;
    }
  }
}

export const fiscalesApi = new FiscalesApiService();
