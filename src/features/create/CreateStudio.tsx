import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Piano, Layers, Headphones, Sparkles, Wand2 } from "lucide-react";
import MelodyGenerator from './MelodyGenerator';
import HarmonyMatrix from './HarmonyMatrix';
import StemSwap from './StemSwap';
import MasteringIA from './MasteringIA';
import MoodModeSelector from './MoodModeSelector';
import AIGenerationsHistory from './AIGenerationsHistory';

export default function CreateStudio() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Wand2 className="w-4 h-4" />
          <span className="text-sm font-medium">Criatividade Acelerada</span>
        </div>
        <h1 className="text-4xl font-bold gradient-text">Estúdio de Criação IA</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Utilize inteligência artificial para gerar melodias, harmonias, 
          separar stems e masterizar suas tracks com qualidade profissional.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="melody" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="melody" className="gap-2">
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Melodia</span>
              </TabsTrigger>
              <TabsTrigger value="harmony" className="gap-2">
                <Piano className="w-4 h-4" />
                <span className="hidden sm:inline">Harmonia</span>
              </TabsTrigger>
              <TabsTrigger value="stems" className="gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Stems</span>
              </TabsTrigger>
              <TabsTrigger value="mastering" className="gap-2">
                <Headphones className="w-4 h-4" />
                <span className="hidden sm:inline">Mastering</span>
              </TabsTrigger>
              <TabsTrigger value="mood" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Mood</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="melody" className="mt-6 space-y-4">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>Gerador de Melodias IA</CardTitle>
                  <CardDescription>
                    Crie melodias únicas baseadas em tonalidade, BPM e mood. 
                    A IA analisa padrões musicais para gerar sequências harmoniosas 
                    que se encaixam perfeitamente na sua produção.
                  </CardDescription>
                </CardHeader>
              </Card>
              <MelodyGenerator />
            </TabsContent>

            <TabsContent value="harmony" className="mt-6 space-y-4">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>Matriz Harmônica IA</CardTitle>
                  <CardDescription>
                    Gere progressões de acordes inteligentes baseadas em gênero e estilo. 
                    Explore combinações harmônicas que funcionam para pop, jazz, eletrônica 
                    e muito mais.
                  </CardDescription>
                </CardHeader>
              </Card>
              <HarmonyMatrix />
            </TabsContent>

            <TabsContent value="stems" className="mt-6 space-y-4">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>Stem Swap</CardTitle>
                  <CardDescription>
                    Combine elementos de diferentes tracks para criar remixes únicos. 
                    Troque vocais, bateria, baixo e outros elementos entre suas produções 
                    de forma inteligente.
                  </CardDescription>
                </CardHeader>
              </Card>
              <StemSwap />
            </TabsContent>

            <TabsContent value="mastering" className="mt-6 space-y-4">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>Auto-Mastering IA</CardTitle>
                  <CardDescription>
                    Mastering profissional automatizado com presets otimizados para 
                    streaming, club, broadcast e vinil. Controle total sobre LUFS, 
                    EQ, compressão e stereo width.
                  </CardDescription>
                </CardHeader>
              </Card>
              <MasteringIA />
            </TabsContent>

            <TabsContent value="mood" className="mt-6 space-y-4">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="px-0">
                  <CardTitle>Mood Variation</CardTitle>
                  <CardDescription>
                    Transforme o humor da sua música com um clique. 
                    Crie variações felizes, tristes, energéticas ou relaxadas 
                    mantendo a essência da track original.
                  </CardDescription>
                </CardHeader>
              </Card>
              <MoodModeSelector />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - History */}
        <div className="lg:sticky lg:top-24 h-fit">
          <AIGenerationsHistory />
        </div>
      </div>
    </div>
  );
}
