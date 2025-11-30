import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface MarketplaceProduct {
  id: string;
  title: string;
  seller: {
    id: string;
    username: string;
    djName?: string;
  };
  productType: 'remix' | 'loop' | 'kit' | 'stem' | 'preset' | 'sample_pack';
  price: number;
  coverImageUrl?: string;
  previewUrl?: string;
  rating?: number;
  reviewCount?: number;
  downloadsCount?: number;
  tags?: string[];
  bpm?: number;
  keySignature?: string;
  genre?: string;
  description?: string;
}

export function useMarketplace(searchQuery: string = '', category: string = 'all') {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, category]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply category filter
      if (category !== 'all') {
        query = query.eq('product_type', category);
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data: productsData, error } = await query;

      if (error) throw error;

      // Fetch seller profiles
      const sellerIds = [...new Set(productsData?.map(p => p.seller_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, dj_name')
        .in('id', sellerIds);

      // Map products with seller info
      const mappedProducts: MarketplaceProduct[] = (productsData || []).map(product => {
        const profile = profiles?.find(p => p.id === product.seller_id);
        return {
          id: product.id,
          title: product.title,
          seller: {
            id: product.seller_id,
            username: profile?.username || 'seller',
            djName: profile?.dj_name
          },
          productType: product.product_type as any,
          price: product.price,
          coverImageUrl: product.cover_image_url || undefined,
          previewUrl: product.preview_url || undefined,
          rating: product.rating || undefined,
          reviewCount: product.review_count || undefined,
          downloadsCount: product.downloads_count || undefined,
          tags: product.tags || undefined,
          bpm: product.bpm || undefined,
          keySignature: product.key_signature || undefined,
          genre: product.genre || undefined,
          description: product.description || undefined
        };
      });

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: 'Não foi possível buscar os produtos',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Partial<MarketplaceProduct>) => {
    try {
      const { data: session } = await supabase.auth.getUser();
      const userId = session.user?.id;

      if (!userId) {
        toast({
          title: 'Login necessário',
          description: 'Faça login para criar produtos',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          seller_id: userId,
          title: productData.title!,
          product_type: productData.productType!,
          price: productData.price!,
          description: productData.description,
          cover_image_url: productData.coverImageUrl,
          preview_url: productData.previewUrl,
          tags: productData.tags,
          bpm: productData.bpm,
          key_signature: productData.keySignature,
          genre: productData.genre,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Produto criado!',
        description: 'Seu produto foi publicado no marketplace'
      });

      fetchProducts(); // Refresh list
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Erro ao criar produto',
        description: 'Não foi possível publicar o produto',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    products,
    isLoading,
    createProduct,
    refetch: fetchProducts
  };
}
