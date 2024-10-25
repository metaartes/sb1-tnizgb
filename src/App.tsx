import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import { ClientList } from '@/components/client-list';
import { ProductList } from '@/components/product-list';
import { BalanceManagement } from '@/components/balance-management';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store } from 'lucide-react';
import { loadClients, loadProducts, saveClients, saveProducts } from '@/lib/storage';
import { Client, Product } from '@/types';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setClients(loadClients());
    setProducts(loadProducts());
  }, []);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Store className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                NewPet&Fish Consignaciones
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="container py-8">
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="clients" className="text-base">Clientes</TabsTrigger>
              <TabsTrigger value="products" className="text-base">Productos</TabsTrigger>
              <TabsTrigger value="balance" className="text-base">Saldos</TabsTrigger>
            </TabsList>
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <TabsContent value="clients">
                <ClientList clients={clients} setClients={setClients} products={products} />
              </TabsContent>
              <TabsContent value="products">
                <ProductList products={products} setProducts={setProducts} clients={clients} />
              </TabsContent>
              <TabsContent value="balance">
                <BalanceManagement clients={clients} setClients={setClients} products={products} />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;