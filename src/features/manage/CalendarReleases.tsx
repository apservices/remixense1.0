import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Filter, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReleaseCard from './ReleaseCard';
import ReleaseStatusBadge from './ReleaseStatusBadge';
import { useNavigate } from 'react-router-dom';

interface Release {
  id: string;
  release_date: string;
  status: string;
  project_id: string;
  project?: {
    title: string;
    user_id: string;
  };
}

export default function CalendarReleases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      loadReleases();
    }
  }, [user?.id, currentMonth]);

  const loadReleases = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from('releases')
      .select(`
        id,
        release_date,
        status,
        project_id,
        project:projects(title, user_id)
      `)
      .gte('release_date', start.toISOString())
      .lte('release_date', end.toISOString());

    if (data) {
      // Filter by user's projects
      const userReleases = data.filter(r => r.project?.user_id === user?.id);
      setReleases(userReleases);
    }
  };

  const filteredReleases = releases.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  );

  const getReleasesForDate = (date: Date) => {
    return filteredReleases.filter(r => isSameDay(new Date(r.release_date), date));
  };

  const selectedDateReleases = getReleasesForDate(selectedDate);

  const hasReleaseOnDate = (date: Date) => {
    return filteredReleases.some(r => isSameDay(new Date(r.release_date), date));
  };

  const goToRelease = (releaseId: string) => {
    navigate(`/releases/${releaseId}`);
  };

  return (
    <div className="grid lg:grid-cols-[1fr,300px] gap-6">
      {/* Calendar */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Calendário de Lançamentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <Filter className="w-3 h-3 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="live">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={ptBR}
            modifiers={{
              hasRelease: (date) => hasReleaseOnDate(date)
            }}
            modifiersStyles={{
              hasRelease: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.2)',
                color: 'hsl(var(--primary))'
              }
            }}
            className="rounded-md"
          />
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDateReleases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum lançamento nesta data</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Release
              </Button>
            </div>
          ) : (
            selectedDateReleases.map(release => (
              <ReleaseCard
                key={release.id}
                release={{
                  id: release.id,
                  title: release.project?.title || 'Sem título',
                  artist: 'Você',
                  release_date: release.release_date,
                  status: release.status as any
                }}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
