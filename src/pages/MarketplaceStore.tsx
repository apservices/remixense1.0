import { AppLayout } from '@/components/layout/AppLayout';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMarketplace } from '@/hooks/useMarketplace';

export default function MarketplaceStore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const { products, isLoading } = useMarketplace(searchQuery, category);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'loop', label: 'Loops' },
    { id: 'stem', label: 'Stems' },
    { id: 'kit', label: 'Kits' },
    { id: 'remix', label: 'Remixes' },
    { id: 'preset', label: 'Presets' },
    { id: 'sample_pack', label: 'Sample Packs' }
  ];

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-heading-xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            Compre e venda loops, stems, kits e remixes de qualidade profissional
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <Card className="glass glass-border p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          </Card>
        ) : products.length === 0 ? (
          <Card className="glass glass-border p-12">
            <div className="text-center space-y-4">
              <p className="text-heading-lg">🛍️ Nenhum produto encontrado</p>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou busca
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
