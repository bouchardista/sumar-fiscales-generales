// Servicio para interactuar con la API de fiscales
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-fiscaleslla.onrender.com';

// Credenciales hardcodeadas para autenticación
const AUTH_CREDENTIALS = {
  DNI: "37732822",
  clave: "37732822"
};

// Modo de desarrollo: usar datos mock si falla la autenticación
const USE_MOCK_ON_AUTH_FAIL = true;

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

// Datos mock para desarrollo cuando falla la autenticación
const MOCK_DEPARTAMENTOS: Departamento[] = [
  { idDepartamento: 1, descripcion: "CAPITAL" },
  { idDepartamento: 2, descripcion: "CALAMUCHITA" },
  { idDepartamento: 3, descripcion: "COLON" },
  { idDepartamento: 4, descripcion: "CRUZ DEL EJE" },
  { idDepartamento: 5, descripcion: "GENERAL ROCA" },
  { idDepartamento: 6, descripcion: "GENERAL SAN MARTIN" },
  { idDepartamento: 7, descripcion: "ISCHILÍN" },
  { idDepartamento: 8, descripcion: "JUÁREZ CELMAN" },
  { idDepartamento: 9, descripcion: "MARCOS JUÁREZ" },
  { idDepartamento: 10, descripcion: "MINAS" },
  { idDepartamento: 11, descripcion: "POCHO" },
  { idDepartamento: 12, descripcion: "PUNILLA" },
  { idDepartamento: 13, descripcion: "RÍO CUARTO" },
  { idDepartamento: 14, descripcion: "RÍO PRIMERO" },
  { idDepartamento: 15, descripcion: "RÍO SECO" },
  { idDepartamento: 16, descripcion: "RÍO SEGUNDO" },
  { idDepartamento: 17, descripcion: "ROQUE SÁENZ PEÑA" },
  { idDepartamento: 18, descripcion: "SAN ALBERTO" },
  { idDepartamento: 19, descripcion: "SAN JAVIER" },
  { idDepartamento: 20, descripcion: "SAN JUSTO" },
  { idDepartamento: 21, descripcion: "SANTA MARÍA" },
  { idDepartamento: 22, descripcion: "SOBREMONTE" },
  { idDepartamento: 23, descripcion: "TERCERO ARRIBA" },
  { idDepartamento: 24, descripcion: "TOTORAL" },
  { idDepartamento: 25, descripcion: "TULUMBA" },
  { idDepartamento: 26, descripcion: "UNIÓN" },
];

const MOCK_ESCUELAS: Record<number, Escuela[]> = {
  1: [ // CAPITAL
    { idEscuela: 1, descripcion: "ESCUELA CAPITAL - CENTRO", direccion: "Av. Colón 100", idCircuito: 1, circuito: "CIRCUITO 1" },
    { idEscuela: 2, descripcion: "ESCUELA CAPITAL - NORTE", direccion: "Av. Recta Martinoli 5000", idCircuito: 2, circuito: "CIRCUITO 2" },
    { idEscuela: 3, descripcion: "ESCUELA CAPITAL - SUR", direccion: "Av. Donato Álvarez 7000", idCircuito: 3, circuito: "CIRCUITO 3" },
    { idEscuela: 101, descripcion: "ESCUELA CAPITAL - NUEVA CÓRDOBA", direccion: "Av. Hipólito Yrigoyen 500", idCircuito: 4, circuito: "CIRCUITO 4" },
    { idEscuela: 102, descripcion: "ESCUELA CAPITAL - CERRO DE LAS ROSAS", direccion: "Rafael Núñez 4000", idCircuito: 5, circuito: "CIRCUITO 5" },
  ],
  2: [ // CALAMUCHITA
    { idEscuela: 4, descripcion: "ESCUELA CALAMUCHITA - VILLA GENERAL BELGRANO", direccion: "Calle Principal 123", idCircuito: 4, circuito: "CIRCUITO 1" },
    { idEscuela: 5, descripcion: "ESCUELA CALAMUCHITA - SANTA ROSA DE CALAMUCHITA", direccion: "Av. Libertad 456", idCircuito: 5, circuito: "CIRCUITO 2" },
    { idEscuela: 103, descripcion: "ESCUELA CALAMUCHITA - VILLA RUMIPAL", direccion: "Costanera 200", idCircuito: 6, circuito: "CIRCUITO 3" },
  ],
  3: [ // COLON
    { idEscuela: 6, descripcion: "ESCUELA COLON - JESUS MARIA", direccion: "9 de Julio 456", idCircuito: 6, circuito: "CIRCUITO 1" },
    { idEscuela: 7, descripcion: "ESCUELA COLON - COLONIA CAROYA", direccion: "San Martín 789", idCircuito: 7, circuito: "CIRCUITO 2" },
    { idEscuela: 104, descripcion: "ESCUELA COLON - SINSACATE", direccion: "Ruta 9 Km 20", idCircuito: 8, circuito: "CIRCUITO 3" },
  ],
  4: [ // CRUZ DEL EJE
    { idEscuela: 8, descripcion: "ESCUELA CRUZ DEL EJE - CENTRO", direccion: "San Martín 789", idCircuito: 8, circuito: "CIRCUITO 1" },
    { idEscuela: 105, descripcion: "ESCUELA CRUZ DEL EJE - VILLA DE SOTO", direccion: "Belgrano 300", idCircuito: 9, circuito: "CIRCUITO 2" },
    { idEscuela: 106, descripcion: "ESCUELA CRUZ DEL EJE - DEAN FUNES ANEXO", direccion: "Rivadavia 150", idCircuito: 10, circuito: "CIRCUITO 3" },
  ],
  5: [ // GENERAL ROCA
    { idEscuela: 9, descripcion: "ESCUELA GENERAL ROCA - VILLA MARIA CENTRO", direccion: "Belgrano 321", idCircuito: 9, circuito: "CIRCUITO 1" },
    { idEscuela: 107, descripcion: "ESCUELA GENERAL ROCA - VILLA MARIA NORTE", direccion: "Entre Ríos 500", idCircuito: 11, circuito: "CIRCUITO 2" },
    { idEscuela: 108, descripcion: "ESCUELA GENERAL ROCA - VILLA NUEVA", direccion: "San Martín 800", idCircuito: 12, circuito: "CIRCUITO 3" },
    { idEscuela: 109, descripcion: "ESCUELA GENERAL ROCA - BALLESTEROS", direccion: "Mitre 200", idCircuito: 13, circuito: "CIRCUITO 4" },
  ],
  6: [ // GENERAL SAN MARTIN
    { idEscuela: 10, descripcion: "ESCUELA GENERAL SAN MARTIN - VILLA MARIA", direccion: "Mitre 654", idCircuito: 10, circuito: "CIRCUITO 1" },
    { idEscuela: 110, descripcion: "ESCUELA GENERAL SAN MARTIN - VILLA MARIA SUR", direccion: "Sarmiento 900", idCircuito: 14, circuito: "CIRCUITO 2" },
    { idEscuela: 111, descripcion: "ESCUELA GENERAL SAN MARTIN - TANCACHA", direccion: "Córdoba 400", idCircuito: 15, circuito: "CIRCUITO 3" },
  ],
  7: [ // ISCHILIN
    { idEscuela: 11, descripcion: "ESCUELA ISCHILIN - DEÁN FUNES", direccion: "Córdoba 100", idCircuito: 11, circuito: "CIRCUITO 1" },
    { idEscuela: 112, descripcion: "ESCUELA ISCHILIN - VILLA GUTIÉRREZ", direccion: "San Martín 250", idCircuito: 16, circuito: "CIRCUITO 2" },
  ],
  8: [ // JUAREZ CELMAN
    { idEscuela: 12, descripcion: "ESCUELA JUAREZ CELMAN - LA CARLOTA", direccion: "San Martín 200", idCircuito: 12, circuito: "CIRCUITO 1" },
    { idEscuela: 113, descripcion: "ESCUELA JUAREZ CELMAN - GENERAL DEHEZA", direccion: "Belgrano 600", idCircuito: 17, circuito: "CIRCUITO 2" },
    { idEscuela: 114, descripcion: "ESCUELA JUAREZ CELMAN - UCACHA", direccion: "9 de Julio 350", idCircuito: 18, circuito: "CIRCUITO 3" },
  ],
  9: [ // MARCOS JUAREZ
    { idEscuela: 13, descripcion: "ESCUELA MARCOS JUAREZ - CENTRO", direccion: "Mitre 300", idCircuito: 13, circuito: "CIRCUITO 1" },
    { idEscuela: 115, descripcion: "ESCUELA MARCOS JUAREZ - CORRAL DE BUSTOS", direccion: "San Martín 700", idCircuito: 19, circuito: "CIRCUITO 2" },
    { idEscuela: 116, descripcion: "ESCUELA MARCOS JUAREZ - SAIRA", direccion: "Principal 100", idCircuito: 20, circuito: "CIRCUITO 3" },
  ],
  10: [ // MINAS
    { idEscuela: 14, descripcion: "ESCUELA MINAS - CERRO COLORADO", direccion: "Principal s/n", idCircuito: 14, circuito: "CIRCUITO 1" },
    { idEscuela: 117, descripcion: "ESCUELA MINAS - SAN CARLOS MINAS", direccion: "Central 50", idCircuito: 21, circuito: "CIRCUITO 2" },
  ],
  11: [ // POCHO
    { idEscuela: 15, descripcion: "ESCUELA POCHO - SALSACATE", direccion: "Central 50", idCircuito: 15, circuito: "CIRCUITO 1" },
    { idEscuela: 118, descripcion: "ESCUELA POCHO - VILLA DE POCHO", direccion: "San Martín 80", idCircuito: 22, circuito: "CIRCUITO 2" },
  ],
  12: [ // PUNILLA
    { idEscuela: 16, descripcion: "ESCUELA PUNILLA - CARLOS PAZ", direccion: "Av. San Martín 400", idCircuito: 16, circuito: "CIRCUITO 1" },
    { idEscuela: 17, descripcion: "ESCUELA PUNILLA - LA FALDA", direccion: "Av. Eden 500", idCircuito: 17, circuito: "CIRCUITO 2" },
    { idEscuela: 119, descripcion: "ESCUELA PUNILLA - VILLA CARLOS PAZ SUR", direccion: "Cárcano 1200", idCircuito: 23, circuito: "CIRCUITO 3" },
    { idEscuela: 120, descripcion: "ESCUELA PUNILLA - COSQUIN", direccion: "San Martín 900", idCircuito: 24, circuito: "CIRCUITO 4" },
  ],
  13: [ // RIO CUARTO
    { idEscuela: 18, descripcion: "ESCUELA RIO CUARTO - CENTRO", direccion: "Constitución 600", idCircuito: 18, circuito: "CIRCUITO 1" },
    { idEscuela: 19, descripcion: "ESCUELA RIO CUARTO - ALBERDI", direccion: "Alberdi 700", idCircuito: 19, circuito: "CIRCUITO 2" },
    { idEscuela: 121, descripcion: "ESCUELA RIO CUARTO - BANDAS", direccion: "Ruta 8 Km 5", idCircuito: 25, circuito: "CIRCUITO 3" },
    { idEscuela: 122, descripcion: "ESCUELA RIO CUARTO - LAS HIGUERAS", direccion: "Mitre 400", idCircuito: 26, circuito: "CIRCUITO 4" },
  ],
  14: [ // RIO PRIMERO
    { idEscuela: 20, descripcion: "ESCUELA RIO PRIMERO - SANTA ROSA", direccion: "Belgrano 800", idCircuito: 20, circuito: "CIRCUITO 1" },
    { idEscuela: 123, descripcion: "ESCUELA RIO PRIMERO - OBISPO TREJO", direccion: "San Martín 150", idCircuito: 27, circuito: "CIRCUITO 2" },
  ],
  15: [ // RIO SECO
    { idEscuela: 21, descripcion: "ESCUELA RIO SECO - VILLA DE MARÍA", direccion: "Sarmiento 900", idCircuito: 21, circuito: "CIRCUITO 1" },
    { idEscuela: 124, descripcion: "ESCUELA RIO SECO - SEBASTIAN EL CANO", direccion: "Principal 200", idCircuito: 28, circuito: "CIRCUITO 2" },
  ],
  16: [ // RIO SEGUNDO
    { idEscuela: 22, descripcion: "ESCUELA RIO SEGUNDO - PILAR", direccion: "9 de Julio 1000", idCircuito: 22, circuito: "CIRCUITO 1" },
    { idEscuela: 125, descripcion: "ESCUELA RIO SEGUNDO - VILLA DEL ROSARIO", direccion: "Belgrano 500", idCircuito: 29, circuito: "CIRCUITO 2" },
    { idEscuela: 126, descripcion: "ESCUELA RIO SEGUNDO - ONCATIVO", direccion: "San Martín 300", idCircuito: 30, circuito: "CIRCUITO 3" },
  ],
  17: [ // ROQUE SAENZ PEÑA
    { idEscuela: 23, descripcion: "ESCUELA ROQUE SAENZ PEÑA - LABOULAYE", direccion: "Mitre 1100", idCircuito: 23, circuito: "CIRCUITO 1" },
    { idEscuela: 127, descripcion: "ESCUELA ROQUE SAENZ PEÑA - SERRANO", direccion: "Córdoba 250", idCircuito: 31, circuito: "CIRCUITO 2" },
  ],
  18: [ // SAN ALBERTO
    { idEscuela: 24, descripcion: "ESCUELA SAN ALBERTO - MINA CLAVERO", direccion: "Av. Mitre 1200", idCircuito: 24, circuito: "CIRCUITO 1" },
    { idEscuela: 128, descripcion: "ESCUELA SAN ALBERTO - NONO", direccion: "Principal 100", idCircuito: 32, circuito: "CIRCUITO 2" },
  ],
  19: [ // SAN JAVIER
    { idEscuela: 25, descripcion: "ESCUELA SAN JAVIER - VILLA DOLORES", direccion: "San Martín 1300", idCircuito: 25, circuito: "CIRCUITO 1" },
    { idEscuela: 129, descripcion: "ESCUELA SAN JAVIER - SAN JAVIER ANEXO", direccion: "Belgrano 200", idCircuito: 33, circuito: "CIRCUITO 2" },
    { idEscuela: 130, descripcion: "ESCUELA SAN JAVIER - LAS TAPIAS", direccion: "Ruta 20 s/n", idCircuito: 34, circuito: "CIRCUITO 3" },
  ],
  20: [ // SAN JUSTO
    { idEscuela: 26, descripcion: "ESCUELA SAN JUSTO - SAN FRANCISCO", direccion: "Córdoba 1400", idCircuito: 26, circuito: "CIRCUITO 1" },
    { idEscuela: 131, descripcion: "ESCUELA SAN JUSTO - ARROYITO", direccion: "Mitre 600", idCircuito: 35, circuito: "CIRCUITO 2" },
    { idEscuela: 132, descripcion: "ESCUELA SAN JUSTO - FREYRE", direccion: "San Martín 450", idCircuito: 36, circuito: "CIRCUITO 3" },
  ],
  21: [ // SANTA MARIA
    { idEscuela: 27, descripcion: "ESCUELA SANTA MARIA - ALTA GRACIA", direccion: "Belgrano 1500", idCircuito: 27, circuito: "CIRCUITO 1" },
    { idEscuela: 133, descripcion: "ESCUELA SANTA MARIA - VILLA CIUDAD DE AMERICA", direccion: "Av. Libertador 800", idCircuito: 37, circuito: "CIRCUITO 2" },
    { idEscuela: 134, descripcion: "ESCUELA SANTA MARIA - ANISACATE", direccion: "Principal 150", idCircuito: 38, circuito: "CIRCUITO 3" },
  ],
  22: [ // SOBREMONTE
    { idEscuela: 28, descripcion: "ESCUELA SOBREMONTE - SAN FRANCISCO DEL CHAÑAR", direccion: "Principal 1600", idCircuito: 28, circuito: "CIRCUITO 1" },
    { idEscuela: 135, descripcion: "ESCUELA SOBREMONTE - SAN FRANCISCO ANEXO", direccion: "Central 50", idCircuito: 39, circuito: "CIRCUITO 2" },
  ],
  23: [ // TERCERO ARRIBA
    { idEscuela: 29, descripcion: "ESCUELA TERCERO ARRIBA - OLIVA", direccion: "San Martín 1700", idCircuito: 29, circuito: "CIRCUITO 1" },
    { idEscuela: 136, descripcion: "ESCUELA TERCERO ARRIBA - ALMAFUERTE", direccion: "Córdoba 300", idCircuito: 40, circuito: "CIRCUITO 2" },
    { idEscuela: 137, descripcion: "ESCUELA TERCERO ARRIBA - HERNANDO", direccion: "9 de Julio 250", idCircuito: 41, circuito: "CIRCUITO 3" },
  ],
  24: [ // TOTORAL
    { idEscuela: 30, descripcion: "ESCUELA TOTORAL - VILLA DEL TOTORAL", direccion: "Córdoba 1800", idCircuito: 30, circuito: "CIRCUITO 1" },
    { idEscuela: 138, descripcion: "ESCUELA TOTORAL - VILLA DEL TOTORAL SUR", direccion: "San Martín 400", idCircuito: 42, circuito: "CIRCUITO 2" },
  ],
  25: [ // TULUMBA
    { idEscuela: 31, descripcion: "ESCUELA TULUMBA - VILLA TULUMBA", direccion: "Central 1900", idCircuito: 31, circuito: "CIRCUITO 1" },
    { idEscuela: 139, descripcion: "ESCUELA TULUMBA - VILLA TULUMBA NORTE", direccion: "Belgrano 100", idCircuito: 43, circuito: "CIRCUITO 2" },
  ],
  26: [ // UNION
    { idEscuela: 32, descripcion: "ESCUELA UNION - BELL VILLE", direccion: "Mitre 2000", idCircuito: 32, circuito: "CIRCUITO 1" },
    { idEscuela: 140, descripcion: "ESCUELA UNION - BELL VILLE OESTE", direccion: "Sarmiento 1500", idCircuito: 44, circuito: "CIRCUITO 2" },
    { idEscuela: 141, descripcion: "ESCUELA UNION - MORRISON", direccion: "San Martín 350", idCircuito: 45, circuito: "CIRCUITO 3" },
    { idEscuela: 142, descripcion: "ESCUELA UNION - ORDOÑEZ", direccion: "Principal 200", idCircuito: 46, circuito: "CIRCUITO 4" },
  ],
};

class FiscalesApiService {
  private token: string | null = null;
  private useMockData: boolean = false;

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
        
        if (USE_MOCK_ON_AUTH_FAIL) {
          console.warn('⚠️ Usando datos MOCK porque falló la autenticación');
          console.warn('⚠️ Razón:', data.mensaje);
          this.useMockData = true;
          return 'MOCK_TOKEN';
        }
        
        throw new Error(data.mensaje || 'Error al autenticar usuario');
      }

      console.log('✅ Login exitoso, token obtenido');
      this.token = data.token;
      this.useMockData = false;
      return data.token;
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      if (USE_MOCK_ON_AUTH_FAIL) {
        console.warn('⚠️ Usando datos MOCK porque hubo un error de conexión');
        this.useMockData = true;
        return 'MOCK_TOKEN';
      }
      
      throw error;
    }
  }

  private async getHeaders() {
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
      console.log('📍 Obteniendo departamentos...');
      const headers = await this.getHeaders();
      
      // Si estamos usando mock, devolver datos mock
      if (this.useMockData) {
        console.log('🎭 Usando departamentos MOCK');
        return MOCK_DEPARTAMENTOS;
      }
      
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
      console.log('✅ Departamentos obtenidos:', data.total || data.departamentos?.length);
      return data.departamentos || [];
    } catch (error) {
      console.error('❌ Error al obtener departamentos:', error);
      throw error;
    }
  }

  async obtenerEscuelasPorDepartamento(idDepartamento: number): Promise<Escuela[]> {
    try {
      const headers = await this.getHeaders();
      
      // Si estamos usando mock, devolver datos mock
      if (this.useMockData) {
        console.log('🎭 Usando escuelas MOCK para departamento:', idDepartamento);
        return MOCK_ESCUELAS[idDepartamento] || [];
      }
      
      const response = await fetch(`${API_BASE_URL}/escuela/departamento/${idDepartamento}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Error al obtener escuelas');
      }

      const data = await response.json();
      return data.escuelas || [];
    } catch (error) {
      console.error('Error al obtener escuelas:', error);
      throw error;
    }
  }

  async crearFiscal(payload: CrearFiscalPayload) {
    try {
      const headers = await this.getHeaders();
      
      // Si estamos usando mock, simular éxito
      if (this.useMockData) {
        console.log('🎭 Simulando creación de fiscal MOCK:', payload);
        return {
          success: true,
          mensaje: 'Fiscal registrado exitosamente (MODO MOCK)',
          idUsuario: Math.floor(Math.random() * 1000)
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/fiscales/crear`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear fiscal');
      }

      return data;
    } catch (error) {
      console.error('Error al crear fiscal:', error);
      throw error;
    }
  }
}

export const fiscalesApi = new FiscalesApiService();
