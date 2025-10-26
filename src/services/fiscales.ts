import { supabase } from '@/config/supabase';

export interface FiscalGeneral {
  id?: string;
  nombre: string;
  apellido: string;
  dni: string;
  departamento_id: string;
  escuela_id: string;
  created_at?: string;
  updated_at?: string;
}

export const fiscalesService = {
  // Crear un nuevo fiscal general
  async crearFiscal(fiscal: Omit<FiscalGeneral, 'id' | 'created_at' | 'updated_at'>) {
    console.log('📝 Intentando crear fiscal:', fiscal);
    
    const { data, error } = await supabase
      .from('fiscales_generales')
      .insert([fiscal])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear fiscal:', error);
      throw new Error(`Error al crear fiscal: ${error.message}`);
    }

    console.log('✅ Fiscal creado exitosamente:', data);
    return data;
  },

  // Obtener todos los fiscales generales
  async obtenerFiscales() {
    const { data, error } = await supabase
      .from('fiscales_generales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener fiscales:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Buscar fiscal por DNI
  async buscarPorDni(dni: string) {
    console.log('🔍 Buscando fiscal con DNI:', dni);
    
    const { data, error } = await supabase
      .from('fiscales_generales')
      .select('*')
      .eq('dni', dni)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error al buscar fiscal:', error);
      throw new Error(`Error al buscar fiscal: ${error.message}`);
    }

    console.log('🔍 Resultado búsqueda:', data ? '✅ Encontrado' : '❌ No encontrado');
    return data;
  },

  // Obtener fiscales por departamento
  async obtenerPorDepartamento(departamentoId: string) {
    const { data, error } = await supabase
      .from('fiscales_generales')
      .select('*')
      .eq('departamento_id', departamentoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener fiscales por departamento:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Actualizar un fiscal
  async actualizarFiscal(id: string, datos: Partial<Omit<FiscalGeneral, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('fiscales_generales')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar fiscal:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Eliminar un fiscal
  async eliminarFiscal(id: string) {
    const { error } = await supabase
      .from('fiscales_generales')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar fiscal:', error);
      throw new Error(error.message);
    }

    return true;
  }
};
