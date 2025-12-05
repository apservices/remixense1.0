import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChallengeCard from './ChallengeCard';
import { useNavigate } from 'react-router-dom';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  prize: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
}

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const navigate = useNavigate();

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('challenges')
      .select('*')
      .order('end_date', { ascending: activeTab === 'open' });

    if (activeTab === 'open') {
      query = query.eq('status', 'open');
    } else if (activeTab === 'voting') {
      query = query.eq('status', 'voting');
    } else {
      query = query.eq('status', 'closed');
    }

    const { data, error } = await query;

    if (data) {
      setChallenges(data);
    }
    setIsLoading(false);
  };

  const joinChallenge = (challengeId: string) => {
    navigate(`/challenges/${challengeId}/submit`);
  };

  const viewChallenge = (challengeId: string) => {
    navigate(`/challenges/${challengeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Desafios
        </h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Criar Desafio
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open">Abertos</TabsTrigger>
          <TabsTrigger value="voting">Em Votação</TabsTrigger>
          <TabsTrigger value="closed">Encerrados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum desafio {activeTab === 'open' ? 'aberto' : activeTab === 'voting' ? 'em votação' : 'encerrado'}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={{
                    ...challenge,
                    status: challenge.status as 'open' | 'voting' | 'closed'
                  }}
                  onJoin={() => joinChallenge(challenge.id)}
                  onView={() => viewChallenge(challenge.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
