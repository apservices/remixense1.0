import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Download, Package, Calendar, Loader2, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PurchasedItem {
  id: string;
  product_id: string;
  product_title: string;
  product_type: string;
  seller_name: string;
  price: number;
  purchased_at: string;
  download_url: string | null;
  download_count: number;
}

export default function MyDownloads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    try {
      // Fetch orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, product_id, amount, created_at, status')
        .eq('buyer_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPurchases: PurchasedItem[] = (orders || []).map(order => ({
        id: order.id,
        product_id: order.product_id,
        product_title: 'Produto',
        product_type: 'sample',
        seller_name: 'Vendedor',
        price: order.amount,
        purchased_at: order.created_at,
        download_url: null,
        download_count: 0
      }));

      setPurchases(mappedPurchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus downloads',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (item: PurchasedItem) => {
    if (!item.download_url) {
      toast({
        title: 'Download indisponível',
        description: 'O arquivo não está disponível no momento',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate signed URL for download
      const { data, error } = await supabase.storage
        .from('marketplace')
        .createSignedUrl(item.download_url, 3600); // 1 hour expiry

      if (error) throw error;

      // Open download
      window.open(data.signedUrl, '_blank');

      toast({
        title: 'Download iniciado',
        description: `Baixando ${item.product_title}`
      });
    } catch (error) {
      console.error('Error downloading:', error);
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o arquivo',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-heading-xl mb-2">📦 Meus Downloads</h1>
          <p className="text-muted-foreground">
            Acesse todos os itens que você comprou no marketplace
          </p>
        </div>

        {purchases.length === 0 ? (
          <Card className="glass glass-border p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma compra ainda</h3>
            <p className="text-muted-foreground mb-4">
              Explore o marketplace para encontrar samples, loops e presets incríveis
            </p>
            <Button variant="neon" onClick={() => window.location.href = '/marketplace'}>
              Ir para Marketplace
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((item) => (
              <Card key={item.id} className="glass glass-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.product_title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>por {item.seller_name}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.product_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.purchased_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                      <div className="font-medium text-primary">
                        R$ {item.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <Button
                      variant="neon"
                      size="sm"
                      onClick={() => handleDownload(item)}
                      disabled={!item.download_url}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        <Card className="glass glass-border p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Dica:</strong> Seus downloads ficam disponíveis 
              para sempre. Você pode baixar quantas vezes precisar. Os arquivos expiram em 1 hora 
              após gerar o link, mas você pode gerar novos links a qualquer momento.
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
