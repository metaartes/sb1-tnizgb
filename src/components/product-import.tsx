import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseProducts } from '@/lib/product-import';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProductImportProps {
  onImport: (products: Product[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductImport({ onImport, open, onOpenChange }: ProductImportProps) {
  const [data, setData] = useState('');
  const { toast } = useToast();

  const handleImport = () => {
    try {
      const products = parseProducts(data);
      if (products.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron productos válidos para importar",
          variant: "destructive",
        });
        return;
      }
      
      onImport(products);
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${products.length} productos`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al importar los productos",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Productos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Pegue aquí los datos de los productos..."
            className="min-h-[400px] font-mono"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport}>
            Importar Productos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}