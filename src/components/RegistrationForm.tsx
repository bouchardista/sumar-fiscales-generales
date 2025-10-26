import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ChevronsUpDown, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fiscalesApi, type Departamento, type Escuela } from "@/services/fiscalesApi";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dni: z.string().min(7, "DNI debe tener al menos 7 dígitos").max(8, "DNI debe tener máximo 8 dígitos").regex(/^\d+$/,"DNI debe contener solo números"),
  tipoFiscal: z.string().min(1, "Tipo de fiscal requerido"),
  departamento: z.string().min(1, "Departamento requerido"),
  escuela: z.string().min(1, "Escuela requerida"),
});

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [isLoadingDepartamentos, setIsLoadingDepartamentos] = useState(true);
  const [isLoadingEscuelas, setIsLoadingEscuelas] = useState(false);
  const [openDepartamento, setOpenDepartamento] = useState(false);
  const [openEscuela, setOpenEscuela] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", apellido: "", dni: "", tipoFiscal: "", departamento: "", escuela: "" },
  });

  const departamentoSeleccionado = form.watch("departamento");

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        setIsLoadingDepartamentos(true);
        const deps = await fiscalesApi.obtenerDepartamentos();
        setDepartamentos(deps);
      } catch (error) {
        console.error('Error al cargar departamentos:', error);
        setSubmitMessage({
          type: 'error',
          message: 'Error al cargar departamentos. Por favor, recarga la página.'
        });
      } finally {
        setIsLoadingDepartamentos(false);
      }
    };

    cargarDepartamentos();
  }, []);

  // Cargar escuelas cuando se selecciona un departamento
  useEffect(() => {
    const cargarEscuelas = async () => {
      if (!departamentoSeleccionado) {
        setEscuelas([]);
        return;
      }

      console.log('🏫 Cargando escuelas para departamento:', departamentoSeleccionado);

      try {
        setIsLoadingEscuelas(true);
        form.setValue("escuela", "");
        const escuelasData = await fiscalesApi.obtenerEscuelasPorDepartamento(parseInt(departamentoSeleccionado));
        console.log('✅ Escuelas cargadas:', escuelasData.length, escuelasData);
        setEscuelas(escuelasData);
      } catch (error) {
        console.error('❌ Error al cargar escuelas:', error);
        setSubmitMessage({
          type: 'error',
          message: 'Error al cargar escuelas del departamento seleccionado.'
        });
        setEscuelas([]);
      } finally {
        setIsLoadingEscuelas(false);
      }
    };

    cargarEscuelas();
  }, [departamentoSeleccionado, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitMessage(null);
      setIsSubmitting(true);
      
      // Crear el fiscal usando la API
      await fiscalesApi.crearFiscal({
        nombre: values.nombre,
        apellido: values.apellido,
        dni: values.dni,
        id_rol: values.tipoFiscal === 'general' ? 4 : 3, // 4 = fiscal_general, 3 = fiscal_mesa
        idEscuela: parseInt(values.escuela),
        telefono: '',
        fuerza_politica: 'La Libertad Avanza',
        observaciones: `Tipo: ${values.tipoFiscal === 'general' ? 'Fiscal General' : 'Fiscal de Mesa'}`
      });

      setSubmitMessage({ 
        type: 'success', 
        message: 'Fiscal registrado exitosamente' 
      });
      form.reset();
    } catch (error) {
      console.error('Error al registrar fiscal:', error);
      setSubmitMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : "Error al registrar el fiscal" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full" id="registration-form">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 border-2 border-primary/20 rounded-3xl bg-card shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Registro Interno de Fiscales Generales</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre*</FormLabel>
                    <FormControl><Input placeholder="Juan" maxLength={50} {...field} className="rounded-xl h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="apellido" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido*</FormLabel>
                    <FormControl><Input placeholder="Pérez" maxLength={50} {...field} className="rounded-xl h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="dni" render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI*</FormLabel>
                    <FormControl><Input placeholder="12345678" maxLength={8} {...field} className="rounded-xl h-12" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tipoFiscal" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tipo de Fiscal*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" role="combobox" className={cn("w-full rounded-xl h-12 justify-between", !field.value && "text-muted-foreground")}>
                            {field.value === 'general' ? 'Fiscal General' : field.value === 'mesa' ? 'Fiscal de Mesa' : "Selecciona tipo"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem value="general" onSelect={() => { form.setValue("tipoFiscal", "general"); }}>
                                <Check className={cn("mr-2 h-4 w-4", field.value === "general" ? "opacity-100" : "opacity-0")} />
                                Fiscal General
                              </CommandItem>
                              <CommandItem value="mesa" onSelect={() => { form.setValue("tipoFiscal", "mesa"); }}>
                                <Check className={cn("mr-2 h-4 w-4", field.value === "mesa" ? "opacity-100" : "opacity-0")} />
                                Fiscal de Mesa
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="departamento" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Departamento*</FormLabel>
                  <Popover open={openDepartamento} onOpenChange={setOpenDepartamento}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" aria-expanded={openDepartamento} className={cn("w-full rounded-xl h-12 justify-between", !field.value && "text-muted-foreground")} disabled={isLoadingDepartamentos}>
                          {isLoadingDepartamentos ? "Cargando..." : field.value ? departamentos.find(d => d.idDepartamento.toString() === field.value)?.descripcion : "Selecciona un departamento"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar departamento..." />
                        <CommandList>
                          <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                          <CommandGroup>
                            {departamentos.map(dept => (
                              <CommandItem key={dept.idDepartamento} value={dept.descripcion} onSelect={() => { form.setValue("departamento", dept.idDepartamento.toString()); setOpenDepartamento(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", field.value === dept.idDepartamento.toString() ? "opacity-100" : "opacity-0")} />
                                {dept.descripcion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="escuela" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Escuela*</FormLabel>
                  <Popover open={openEscuela} onOpenChange={setOpenEscuela}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          variant="outline" 
                          role="combobox" 
                          aria-expanded={openEscuela} 
                          className={cn("w-full rounded-xl h-12 justify-between", !field.value && "text-muted-foreground")} 
                          disabled={!departamentoSeleccionado || isLoadingEscuelas || escuelas.length === 0}
                        >
                          {isLoadingEscuelas 
                            ? "Cargando escuelas..." 
                            : !departamentoSeleccionado 
                              ? "Selecciona un departamento primero" 
                              : escuelas.length === 0
                                ? "No hay escuelas disponibles"
                                : field.value 
                                  ? escuelas.find(e => e.idEscuela.toString() === field.value)?.descripcion 
                                  : "Selecciona una escuela"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar escuela..." />
                        <CommandList>
                          <CommandEmpty>No se encontró la escuela.</CommandEmpty>
                          <CommandGroup>
                            {escuelas.map(esc => (
                              <CommandItem key={esc.idEscuela} value={esc.descripcion} onSelect={() => { form.setValue("escuela", esc.idEscuela.toString()); setOpenEscuela(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", field.value === esc.idEscuela.toString() ? "opacity-100" : "opacity-0")} />
                                {esc.descripcion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              {submitMessage && (
                <div className={`p-4 rounded-xl border ${submitMessage.type === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                  <div className="flex items-center">
                    {submitMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    <p className="text-sm font-medium">{submitMessage.message}</p>
                  </div>
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl">
                {isSubmitting ? "CREANDO..." : "CREAR"}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
