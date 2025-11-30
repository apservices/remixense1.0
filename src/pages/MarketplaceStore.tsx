import { MainLayout } from '@/components/MainLayout';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function MarketplaceStore() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock products - replace with actual data from Supabase
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

  return (
    <MainLayout>
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
          {['Todos', 'Loops', 'Stems', 'Kits', 'Remixes', 'Presets'].map((cat) => (
            <Button
              key={cat}
              variant={cat === 'Todos' ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
