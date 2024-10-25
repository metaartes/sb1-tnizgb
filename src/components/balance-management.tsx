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
import { Plus, Download, Eye } from 'lucide-react';
import { Client, Product } from '@/types';
import { SearchFilter } from '@/components/search-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BalanceManagementProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  products: Product[];
}

export function BalanceManagement({ clients, setClients, products }: BalanceManagementProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [clientDetails, setClientDetails] = useState<Client | null>(null);

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const calculateTotal = (clientProducts: Client['products']) => {
    return clientProducts.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const handleSearch = (searchTerm: string, filters: string[]) => {
    const filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = filters.length === 0 || filters.some(filter => {
        switch (filter) {
          case 'hasBalance':
            return calculateTotal(client.products) > 0;
          case 'noBalance':
            return calculateTotal(client.products) === 0;
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
    setFilteredClients(filtered);
  };

  const handleAddProduct = () => {
    if (selectedClient && selectedProduct) {
      const updatedClients = clients.map(client => {
        if (client.id === selectedClient.id) {
          const existingProductIndex = client.products.findIndex(p => p.id === selectedProduct.id);
          if (existingProductIndex > -1) {
            const updatedProducts = [...client.products];
            updatedProducts[existingProductIndex] = {
              ...updatedProducts[existingProductIndex],
              quantity: updatedProducts[existingProductIndex].quantity + quantity,
              purchaseDate: new Date().toISOString(),
            };
            return { ...client, products: updatedProducts };
          } else {
            return {
              ...client,
              products: [
                ...client.products,
                {
                  ...selectedProduct,
                  quantity,
                  purchaseDate: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return client;
      });
      setClients(updatedClients);
      setSelectedClient(null);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Código', 'Saldo Total', 'Productos'];
    const csvContent = [
      headers.join(','),
      ...filteredClients.map(client => 
        [
          client.name,
          client.code,
          calculateTotal(client.products).toFixed(2),
          client.products.map(p => `${p.name} (${p.quantity})`).join('; ')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'saldos.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SearchFilter 
          onSearch={handleSearch} 
          filters={[
            { value: 'hasBalance', label: 'Con saldo' },
            { value: 'noBalance', label: 'Sin saldo' },
          ]}
        />
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Saldo Total</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.code}</TableCell>
                <TableCell>${calculateTotal(client.products).toFixed(2)}</TableCell>
                <TableCell>{client.products.length} productos</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button onClick={() => setSelectedClient(client)}>
                      Seleccionar
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setClientDetails(client)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedClient && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Agregar producto a {selectedClient.name}</h3>
          <div className="flex space-x-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedProduct?.id || ''}
              onChange={(e) => setSelectedProduct(products.find(p => p.id === Number(e.target.value)) || null)}
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price.toFixed(2)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Cantidad"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </div>
        </div>
      )}
      {clientDetails && (
        <Dialog open={!!clientDetails} onOpenChange={() => setClientDetails(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
            </DialogHeader>
            <div>
              <p><strong>Nombre:</strong> {clientDetails.name}</p>
              <p><strong>Código:</strong> {clientDetails.code}</p>
              <p><strong>Saldo Total:</strong> ${calculateTotal(clientDetails.products).toFixed(2)}</p>
              <h4 className="mt-4 mb-2 font-semibold">Productos:</h4>
              <ul>
                {clientDetails.products.map((product, index) => (
                  <li key={index}>
                    {product.name} - Cantidad: {product.quantity} - Precio: ${product.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}