import { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formSchema = z.object({
  code: z.string().min(1, { message: 'El código es requerido' }),
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'El precio debe ser un número positivo',
  }),
  inventory: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: 'El inventario debe ser un número entero no negativo',
  }),
});

type ProductFormProps = {
  product?: {
    id: number;
    code: string;
    name: string;
    price: number;
    inventory: number;
  } | null;
  onClose: () => void;
  onSave: (product: { code: string; name: string; price: number; inventory: number }) => void;
};

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: product?.code || '',
      name: product?.name || '',
      price: product?.price.toString() || '',
      inventory: product?.inventory.toString() || '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        code: product.code,
        name: product.name,
        price: product.price.toString(),
        inventory: product.inventory.toString(),
      });
    }
  }, [product, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({
      code: values.code,
      name: values.name,
      price: parseFloat(values.price),
      inventory: parseInt(values.inventory),
    });
    toast({
      title: product ? 'Producto actualizado' : 'Producto agregado',
      description: `${values.name} ha sido ${product ? 'actualizado' : 'agregado'} exitosamente.`,
    });
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el código del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ingrese el precio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inventory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inventario</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ingrese la cantidad en inventario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">{product ? 'Actualizar' : 'Agregar'} Producto</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}