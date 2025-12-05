import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceUploadDialog } from '@/components/MarketplaceUploadDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, DollarSign, TrendingUp, Upload, Eye, ShoppingCart, 
  Loader2, Crown, BarChart3, Wallet 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Product {
  id: string;
  title: string;
  type: string;
  price: number;
  sales_count: number;
  views_count: number;
  created_at: string;
  status: string;
}

interface Sale {
  id: string;
  product_title: string;
  buyer_name: string;
  amount: number;
  commission: number;
  net_amount: number;
  created_at: string;
}

interface SellerStats {
  total_revenue: number;
  total_sales: number;
  total_products: number;
  pending_payout: number;
  commission_rate: number;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const { isPro, isExpert, canUseMarketplace } = useSubscription();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    total_revenue: 0,
    total_sales: 0,
    total_products: 0,
    pending_payout: 0,
    commission_rate: isPro ? 20 : isExpert ? 10 : 30
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    }
  }, [user]);

  const fetchSellerData = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, title, price, created_at, product_type, downloads_count')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      const mapped = (productsData || []).map((p) => ({ 
        id: p.id,
        title: p.title,
        price: p.price,
        created_at: p.created_at,
        type: p.product_type || 'sample',
        views_count: 0,
        sales_count: p.downloads_count || 0,
        status: 'active' as const
      }));
      setProducts(mapped);

      // Fetch sales
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          amount,
          commission,
          seller_amount,
          created_at,
          products (title),
          buyer_id
        `)
        .eq('seller_id', user?.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) throw ordersError;

      // Get buyer names
      const buyerIds = [...new Set(ordersData?.map(o => o.buyer_id) || [])];
      const { data: buyers } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', buyerIds);

      const mappedSales: Sale[] = (ordersData || []).map(order => {
        const buyer = buyers?.find(b => b.id === order.buyer_id);
        return {
          id: order.id,
          product_title: order.products?.title || 'Produto',
          buyer_name: buyer?.username || 'Comprador',
          amount: order.amount,
          commission: order.commission,
          net_amount: order.seller_amount,
          created_at: order.created_at
        };
      });
      setSales(mappedSales);

      // Calculate stats
      const totalRevenue = mappedSales.reduce((sum, s) => sum + s.net_amount, 0);
      const commissionRate = isExpert ? 10 : isPro ? 20 : 30;

      // Get pending payout
      const { data: payoutData } = await supabase
        .from('payouts')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      const pendingPayout = payoutData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        total_revenue: totalRevenue,
        total_sales: mappedSales.length,
        total_products: productsData?.length || 0,
        pending_payout: pendingPayout,
        commission_rate: commissionRate
      });
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestPayout = async () => {
    if (stats.total_revenue < 50) {
      toast({
        title: 'Saldo insuficiente',
        description: 'Mínimo de R$ 50 para solicitar saque',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          user_id: user?.id,
          amount: stats.total_revenue,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Saque solicitado',
        description: 'Seu saque será processado em até 5 dias úteis'
      });
      
      fetchSellerData();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar o saque',
        variant: 'destructive'
      });
    }
  };

  if (!canUseMarketplace()) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8">
          <Card className="glass border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-8 text-center">
            <Crown className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Área exclusiva PRO/Expert</h2>
            <p className="text-muted-foreground mb-4">
              Faça upgrade para vender no marketplace e ganhar dinheiro com seus samples, 
              loops e presets.
            </p>
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-amber-500 to-orange-500"
              onClick={() => window.location.href = '/subscription'}
            >
              Fazer Upgrade
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-xl mb-2">💰 Painel do Vendedor</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos e acompanhe suas vendas
            </p>
          </div>
          <MarketplaceUploadDialog onSuccess={fetchSellerData}>
            <Button variant="neon">
              <Upload className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </MarketplaceUploadDialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass glass-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {stats.total_revenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Receita total</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass glass-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_sales}</p>
                <p className="text-xs text-muted-foreground">Vendas</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass glass-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_products}</p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
            </div>
          </Card>
          
          <Card className="glass glass-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{100 - stats.commission_rate}%</p>
                <p className="text-xs text-muted-foreground">Você recebe</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payout Card */}
        <Card className="glass glass-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <p className="text-lg font-medium">Saldo disponível</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {stats.total_revenue.toFixed(2)}
                </p>
              </div>
            </div>
            <Button 
              variant="neon"
              onClick={requestPayout}
              disabled={stats.total_revenue < 50}
            >
              Solicitar Saque
            </Button>
          </div>
          {stats.total_revenue < 50 && (
            <p className="text-sm text-muted-foreground mt-2">
              Mínimo de R$ 50 para solicitar saque
            </p>
          )}
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="glass">
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="sales">
              <BarChart3 className="h-4 w-4 mr-2" />
              Vendas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-4 space-y-4">
            {products.length === 0 ? (
              <Card className="glass glass-border p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum produto publicado</p>
                <MarketplaceUploadDialog onSuccess={fetchSellerData}>
                  <Button variant="neon">Publicar Primeiro Produto</Button>
                </MarketplaceUploadDialog>
              </Card>
            ) : (
              products.map((product) => (
                <Card key={product.id} className="glass glass-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs capitalize">
                            {product.type}
                          </Badge>
                          <span>R$ {product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{product.views_count || 0}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Views
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{product.sales_count || 0}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" /> Vendas
                        </p>
                      </div>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="sales" className="mt-4 space-y-4">
            {sales.length === 0 ? (
              <Card className="glass glass-border p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma venda ainda</p>
              </Card>
            ) : (
              sales.map((sale) => (
                <Card key={sale.id} className="glass glass-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{sale.product_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprado por {sale.buyer_name} • {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">+R$ {sale.net_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        (comissão: R$ {sale.commission.toFixed(2)})
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
