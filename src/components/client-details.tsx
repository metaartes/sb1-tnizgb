import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Client, Product } from '@/types';

interface ClientDetailsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  products: Product[];
}

export function ClientDetails({ clients, setClients, products }: ClientDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = clients.find(c => c.id === Number(id));

  if (!client) {
    return <div>Cliente no encontrado</div>;
  }

  const [editedClient, setEditedClient] = useState<Client>({ ...client });
  const [newProduct, setNewProduct] = useState({ productId: '', quantity: '' });

  const handleAddProduct = () => {
    if (newProduct.productId && newProduct.quantity) {
      const productToAdd = products.find(p => p.id === Number(newProduct.productId));
      if (productToAdd) {
        const updatedClient = {
          ...editedClient,
          products: [
            ...editedClient.products,
            {
              ...productToAdd,
              quantity: parseInt(newProduct.quantity),
              purchaseDate: new Date().toISOString(),
            },
          ],
        };
        setEditedClient(updatedClient);
        setNewProduct({ productId: '', quantity: '' });
      }
    }
  };

  const handleRemoveProduct = (productId: number) => {
    const updatedClient = {
      ...editedClient,
      products: editedClient.products.filter((p) => p.id !== productId),
    };
    setEditedClient(updatedClient);
  };

  const handleQuantityChange = (productId: number, change: number) => {
    const updatedClient = {
      ...editedClient,
      products: editedClient.products.map((p) =>
        p.id === productId ? { ...p, quantity: Math.max(0, p.quantity + change) } : p
      ),
    };
    setEditedClient(updatedClient);
  };

  const calculateTotal = () => {
    return editedClient.products.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const handleSave = () => {
    setClients(clients.map(c => c.id === editedClient.id ? editedClient : c));
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{editedClient.name}</h2>
      <div className="grid gap-4 mb-4">
        <div>
          <Label htmlFor="code">Código</Label>
          <Input
            id="code"
            value={editedClient.code}
            onChange={(e) => setEditedClient({ ...editedClient, code: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={editedClient.address}
            onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={editedClient.phone}
            onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
          />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Productos</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Fecha de Compra</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editedClient.products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(product.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{product.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(product.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{new Date(product.purchaseDate).toLocaleDateString()}</TableCell>
              <TableCell>${(product.price * product.quantity).toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2">Agregar Producto</h4>
        <div className="flex space-x-2">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={newProduct.productId}
            onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
          >
            <option value="">Seleccionar producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="Cantidad"
            type="number"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          />
          <Button onClick={handleAddProduct}>Agregar</Button>
        </div>
      </div>
      <div className="mt-4 text-right">
        <strong>Saldo Total: ${calculateTotal().toFixed(2)}</strong>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate('/')}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </div>
    </div>
  );
}