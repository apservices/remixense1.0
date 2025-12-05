import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Rocket, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { releaseSchema, type ReleaseFormData } from "@/lib/schemas/project";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import PlatformSelector from './PlatformSelector';
import CoverUploader from './CoverUploader';
import ISRCGenerator from './ISRCGenerator';

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop/Rap', 'R&B', 'Electronic/Dance', 'Latin', 
  'Country', 'Jazz', 'Classical', 'Folk', 'Reggae', 'Metal', 'Indie', 'Blues'
];

interface DistributionFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export default function DistributionForm({ projectId, onSuccess }: DistributionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['spotify', 'apple_music', 'youtube_music']);
  const [isrc, setIsrc] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      title: '',
      artist_name: '',
      genre: '',
      explicit_content: false,
      platforms: ['spotify', 'apple_music', 'youtube_music']
    }
  });

  const releaseDate = watch('release_date');

  const onSubmit = async (data: ReleaseFormData) => {
    if (!coverFile) {
      toast.error('Adicione uma capa para o lançamento');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Selecione pelo menos uma plataforma');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload cover
      const coverPath = `covers/${projectId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('tracks')
        .upload(coverPath, coverFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(coverPath);

      // 2. Create release record
      const { data: releaseData, error: releaseError } = await supabase
        .from('releases')
        .insert({
          project_id: projectId,
          release_date: data.release_date.toISOString(),
          status: 'scheduled',
          isrc: isrc || null,
          cover_art_url: publicUrl
        })
        .select()
        .single();

      if (releaseError) throw releaseError;

      // 3. Trigger distribution (async)
      await supabase.functions.invoke('publish', {
        body: {
          releaseId: releaseData.id,
          platforms: selectedPlatforms,
          releaseDate: data.release_date.toISOString()
        }
      });

      toast.success('Lançamento agendado com sucesso!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(`Erro ao criar lançamento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Informações do Lançamento</CardTitle>
              <CardDescription>Dados básicos para distribuição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input {...register('title')} placeholder="Nome da música/álbum" />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nome do Artista *</Label>
                <Input {...register('artist_name')} placeholder="Como aparecerá nas plataformas" />
                {errors.artist_name && (
                  <p className="text-sm text-destructive">{errors.artist_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gênero *</Label>
                <Select onValueChange={(v) => setValue('genre', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map(genre => (
                      <SelectItem key={genre} value={genre.toLowerCase()}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.genre && (
                  <p className="text-sm text-destructive">{errors.genre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data de Lançamento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !releaseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {releaseDate ? format(releaseDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={releaseDate}
                      onSelect={(date) => date && setValue('release_date', date)}
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Conteúdo Explícito</Label>
                  <p className="text-xs text-muted-foreground">Marca como Explicit nas plataformas</p>
                </div>
                <Switch
                  onCheckedChange={(v) => setValue('explicit_content', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ISRC */}
          <ISRCGenerator 
            value={isrc} 
            onChange={setIsrc} 
            projectId={projectId}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Cover */}
          <CoverUploader
            coverUrl={coverUrl}
            onChange={(url, file) => {
              setCoverUrl(url);
              setCoverFile(file);
            }}
          />

          {/* Platforms */}
          <PlatformSelector
            selected={selectedPlatforms}
            onChange={(platforms) => {
              setSelectedPlatforms(platforms);
              setValue('platforms', platforms);
            }}
          />
        </div>
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-cyan-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Rocket className="w-5 h-5 mr-2" />
        )}
        Agendar Lançamento
      </Button>
    </form>
  );
}
