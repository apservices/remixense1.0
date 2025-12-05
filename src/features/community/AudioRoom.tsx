import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Users, Play, Pause, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Message {
  id: string;
  user_id: string;
  comment_text: string;
  timestamp_ms: number | null;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

interface AudioRoomProps {
  roomId: string;
  trackUrl?: string;
}

export default function AudioRoom({ roomId, trackUrl }: AudioRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [roomId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('feedback_comments')
      .select(`
        id,
        user_id,
        comment_text,
        timestamp_ms,
        created_at
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback_comments',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const { error } = await supabase
      .from('feedback_comments')
      .insert({
        room_id: roomId,
        user_id: user.id,
        comment_text: newMessage,
        timestamp_ms: Math.floor(currentTime * 1000)
      });

    if (error) {
      toast.error('Erro ao enviar mensagem');
    } else {
      setNewMessage('');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const jumpToTimestamp = (ms: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = ms / 1000;
    setCurrentTime(ms / 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-card h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Sala de Feedback
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {participants} online
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Audio Player */}
        {trackUrl && (
          <div className="p-4 rounded-lg bg-muted/30">
            <audio
              ref={audioRef}
              src={trackUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            />
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={msg.user?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {msg.user?.username?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {msg.user?.username || 'Usuário'}
                    </span>
                    {msg.timestamp_ms !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs text-primary"
                        onClick={() => jumpToTimestamp(msg.timestamp_ms!)}
                      >
                        {formatTime(msg.timestamp_ms / 1000)}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.comment_text}</p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Comentar em ${formatTime(currentTime)}...`}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
