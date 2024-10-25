import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus, Download, Eye, Upload } from 'lucide-react';
import { ProductForm } from '@/components/product-form';
import { ProductImport } from '@/components/product-import';
import { Product, Client } from '@/types';
import { SearchFilter } from '@/components/search-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  clients: Client[];
}

export function ProductList({ products, setProducts, clients }: ProductListProps) {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const deleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado exitosamente.",
    });
  };

  const handleSearch = (searchTerm: string, filters: string[]) => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = filters.length === 0 || filters.some(filter => {
        switch (filter) {
          case 'inStock':
            return product.inventory > 0;
          case 'outOfStock':
            return product.inventory === 0;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
    setFilteredProducts(filtered);
  };

  const handleImport = (importedProducts: Product[]) => {
    setProducts(prev => [...prev, ...importedProducts]);
  };

  const exportToCSV = () => {
    const headers = ['Código', 'Nombre', 'Precio', 'Inventario', 'Clientes'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => 
        [
          product.code,
          product.name,
          product.price.toFixed(2),
          product.inventory,
          clients.filter(client => client.products.some(p => p.id === product.id))
            .map(client => client.name)
            .join('; ')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'productos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getClientsWithProduct = (productId: number) => {
    return clients.filter(client => client.products.some(p => p.id === productId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SearchFilter 
          onSearch={handleSearch} 
          filters={[
            { value: 'inStock', label: 'En stock' },
            { value: 'outOfStock', label: 'Sin stock' },
          ]}
        />
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)}>
            Agregar Producto
          </Button>
          <Button onClick={() => setShowImport(true)} variant="outline">
            Importar
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            Exportar CSV
          </Button>
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Inventario</TableHead>
              <TableHead>Clientes</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toLocaleString()}</TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell>{getClientsWithProduct(product.id).length} clientes</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(showForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={(newProduct) => {
            if (editingProduct) {
              setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } : p));
            } else {
              setProducts([...products, { ...newProduct, id: Date.now() }]);
            }
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <ProductImport
        open={showImport}
        onOpenChange={setShowImport}
        onImport={handleImport}
      />

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código:</p>
                  <p className="font-medium">{selectedProduct.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre:</p>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio:</p>
                  <p className="font-medium">${selectedProduct.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inventario:</p>
                  <p className="font-medium">{selectedProduct.inventory}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Clientes que tienen este producto:</h4>
                <div className="space-y-2">
                  {getClientsWithProduct(selectedProduct.id).map((client, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>{client.name}</span>
                      <span>Cantidad: {client.products.find(p => p.id === selectedProduct.id)?.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}