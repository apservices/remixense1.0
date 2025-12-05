import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Music, DollarSign, Play, Users } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  date: string;
  streams: number;
  revenue: number;
  platform: string;
}

const COLORS = ['#7B2FF7', '#1FD1F9', '#10B981', '#F59E0B', '#EF4444'];

export default function InsightsDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id, period]);

  const loadAnalytics = async () => {
    // In production, fetch from analytics_data table
    // For now, generate sample data
    const sampleData: AnalyticsData[] = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      ['Spotify', 'Apple Music', 'YouTube'].forEach(platform => {
        sampleData.push({
          date: date.toISOString().split('T')[0],
          streams: Math.floor(Math.random() * 1000) + 100,
          revenue: Math.random() * 10,
          platform
        });
      });
    }
    
    setData(sampleData);
    setIsLoading(false);
  };

  // Aggregate data by date
  const chartData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.date);
    if (existing) {
      existing.streams += item.streams;
      existing.revenue += item.revenue;
    } else {
      acc.push({
        date: item.date,
        streams: item.streams,
        revenue: item.revenue,
        dateFormatted: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      });
    }
    return acc;
  }, [] as any[]);

  // Platform breakdown
  const platformData = ['Spotify', 'Apple Music', 'YouTube', 'SoundCloud', 'Others'].map((platform, i) => ({
    name: platform,
    value: Math.floor(Math.random() * 1000) + 200,
    color: COLORS[i]
  }));

  // Stats
  const totalStreams = chartData.reduce((sum, d) => sum + d.streams, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const avgDaily = Math.floor(totalStreams / chartData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Insights
        </h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{totalStreams.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média Diária</p>
                <p className="text-2xl font-bold">{avgDaily.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Music className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracks Ativas</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Streams Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Streams ao longo do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="streams" 
                    stroke="#7B2FF7" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {platformData.map((platform) => (
                <div key={platform.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-sm text-muted-foreground">{platform.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
