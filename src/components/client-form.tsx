import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  code: z.string().min(2, {
    message: 'El código debe tener al menos 2 caracteres.',
  }),
  address: z.string().min(5, {
    message: 'La dirección debe tener al menos 5 caracteres.',
  }),
  phone: z.string().min(5, {
    message: 'El teléfono debe tener al menos 5 caracteres.',
  }),
});

type ClientFormProps = {
  client?: Client | null;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'products'>) => void;
};

export function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      code: client?.code || '',
      address: client?.address || '',
      phone: client?.phone || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
    toast({
      title: client ? 'Cliente actualizado' : 'Cliente agregado',
      description: `${values.name} ha sido ${client ? 'actualizado' : 'agregado'} exitosamente.`,
    });
    onClose();
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-8">
      <CardHeader>
        <CardTitle>{client ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el código del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese la dirección del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el teléfono del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">{client ? 'Actualizar' : 'Agregar'} Cliente</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}