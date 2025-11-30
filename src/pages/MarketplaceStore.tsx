import { AppShell } from '@/components/AppShell';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, TrendingUp } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    title: 'Tech House Remix Pack Vol. 1',
    seller: {
      id: 'seller1',
      username: 'producerking',
      djName: 'Producer King'
    },
    productType: 'sample_pack' as const,
    price: 4900,
    rating: 4.8,
    reviewCount: 124,
    downloadsCount: 523,
    tags: ['tech-house', 'minimal', 'groovy'],
    bpm: 128,
    genre: 'Tech House'
  },
  {
    id: '2',
    title: 'Melodic Deep House Loops',
    seller: {
      id: 'seller2',
      username: 'sounddesigner',
      djName: 'Sound Designer'
    },
    productType: 'loop' as const,
    price: 2900,
    rating: 4.9,
    reviewCount: 89,
    downloadsCount: 412,
    tags: ['deep-house', 'melodic'],
    bpm: 124,
    keySignature: 'Am',
    genre: 'Deep House'
  }
];

export default function MarketplaceStore() {
  return (
    <AppShell>
      <div className="container max-w-7xl mx-auto py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-heading-xl mb-2">🛍️ Marketplace</h1>
            <p className="text-muted-foreground">
              Compre e venda remixes, loops, kits e samples
            </p>
          </div>
          <Button size="lg" className="neon-glow">
            💰 Vender Produtos
          </Button>
        </div>

        {/* Search & filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, artista, tag..."
              className="pl-10 glass glass-border"
            />
          </div>
          <Button variant="outline" className="glass glass-border">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="glass glass-border w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="remix">Remixes</TabsTrigger>
            <TabsTrigger value="loop">Loops</TabsTrigger>
            <TabsTrigger value="kit">Kits</TabsTrigger>
            <TabsTrigger value="stem">Stems</TabsTrigger>
            <TabsTrigger value="preset">Presets</TabsTrigger>
            <TabsTrigger value="sample_pack">Sample Packs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Em Alta</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="remix" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              Nenhum remix disponível ainda
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
