import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

const DEPARTAMENTOS = [
  { id: "1", nombre: "Capital" },
  { id: "2", nombre: "Colón" },
  { id: "3", nombre: "Cruz del Eje" },
];

const ESCUELAS_POR_DEPARTAMENTO: Record<string, Array<{ id: string; nombre: string }>> = {
  "1": [
    { id: "101", nombre: "Escuela Hipólito Yrigoyen" },
    { id: "102", nombre: "Escuela Domingo Faustino Sarmiento" },
  ],
  "2": [
    { id: "201", nombre: "Escuela General Paz" },
  ],
  "3": [
    { id: "301", nombre: "Escuela Cruz del Eje Central" },
  ],
};

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  dni: z.string().min(7, "DNI debe tener al menos 7 dígitos").max(8, "DNI debe tener máximo 8 dígitos").regex(/^\d+$/,"DNI debe contener solo números"),
  departamento: z.string().min(1, "Departamento requerido"),
  escuela: z.string().min(1, "Escuela requerida"),
});

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { nombre: "", apellido: "", dni: "", departamento: "", escuela: "" },
  });

  const departamentoSeleccionado = form.watch("departamento");
  useEffect(() => {
    if (departamentoSeleccionado) form.setValue("escuela", "");
  }, [departamentoSeleccionado, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitMessage(null);
      setIsSubmitting(true);
      console.log("Datos del formulario:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitMessage({ type: 'success', message: 'Usuario creado exitosamente' });
      form.reset();
    } catch (error) {
      setSubmitMessage({ type: 'error', message: error instanceof Error ? error.message : "Error al crear el usuario" });
      setTimeout(() => setSubmitMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full" id="registration-form">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 border-2 border-primary/20 rounded-3xl bg-card shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">Registro de Usuario</h2>
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
              <FormField control={form.control} name="dni" render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI*</FormLabel>
                  <FormControl><Input placeholder="12345678" maxLength={8} {...field} className="rounded-xl h-12" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="departamento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Selecciona un departamento" /></SelectTrigger></FormControl>
                    <SelectContent>{DEPARTAMENTOS.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="escuela" render={({ field }) => {
                const escuelas = departamentoSeleccionado ? ESCUELAS_POR_DEPARTAMENTO[departamentoSeleccionado] || [] : [];
                return (
                  <FormItem>
                    <FormLabel>Escuela*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!departamentoSeleccionado || escuelas.length === 0}>
                      <FormControl><SelectTrigger className="rounded-xl h-12"><SelectValue placeholder={!departamentoSeleccionado ? "Primero selecciona un departamento" : escuelas.length === 0 ? "No hay escuelas" : "Selecciona una escuela"} /></SelectTrigger></FormControl>
                      <SelectContent>{escuelas.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }} />
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
