import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus, Download, Eye } from 'lucide-react';
import { ClientForm } from '@/components/client-form';
import { Client, Product } from '@/types';
import { SearchFilter } from '@/components/search-filter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ClientListProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  products: Product[];
}

export function ClientList({ clients, setClients, products }: ClientListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  const deleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado exitosamente.",
    });
  };

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

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'products'>) => {
    if (editingClient) {
      setClients(clients.map(c => 
        c.id === editingClient.id 
          ? { ...editingClient, ...clientData }
          : c
      ));
    } else {
      const newClient: Client = {
        ...clientData,
        id: Date.now(),
        products: [],
      };
      setClients([...clients, newClient]);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Código', 'Dirección', 'Teléfono', 'Saldo Total', 'Productos'];
    const csvContent = [
      headers.join(','),
      ...filteredClients.map(client => 
        [
          client.name,
          client.code,
          client.address,
          client.phone,
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
      link.setAttribute('download', 'clientes.csv');
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
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
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
                <TableCell>{client.address}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>${calculateTotal(client.products).toFixed(2)}</TableCell>
                <TableCell>{client.products.length} productos</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/client/${client.id}`)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setSelectedClient(client)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {(showForm || editingClient) && (
        <ClientForm
          client={editingClient}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
        />
      )}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre:</p>
                  <p className="font-medium">{selectedClient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código:</p>
                  <p className="font-medium">{selectedClient.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dirección:</p>
                  <p className="font-medium">{selectedClient.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono:</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Total:</p>
                  <p className="font-medium">${calculateTotal(selectedClient.products).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Productos:</h4>
                <div className="space-y-2">
                  {selectedClient.products.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>{product.name}</span>
                      <div className="text-right">
                        <p>Cantidad: {product.quantity}</p>
                        <p>Precio: ${product.price.toFixed(2)}</p>
                      </div>
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