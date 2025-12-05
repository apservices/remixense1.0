export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          blockchain_registro: string | null
          created_at: string
          data_hora_login: string
          gps_location: Json | null
          id: string
          ip_address: string | null
          marca_aparelho: string | null
          modelo_aparelho: string | null
          user_id: string | null
        }
        Insert: {
          blockchain_registro?: string | null
          created_at?: string
          data_hora_login?: string
          gps_location?: Json | null
          id?: string
          ip_address?: string | null
          marca_aparelho?: string | null
          modelo_aparelho?: string | null
          user_id?: string | null
        }
        Update: {
          blockchain_registro?: string | null
          created_at?: string
          data_hora_login?: string
          gps_location?: Json | null
          id?: string
          ip_address?: string | null
          marca_aparelho?: string | null
          modelo_aparelho?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_approval_codes: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_used: number | null
          error_message: string | null
          id: string
          input_track_id: string | null
          output_url: string | null
          parameters: Json | null
          processing_time_ms: number | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          id?: string
          input_track_id?: string | null
          output_url?: string | null
          parameters?: Json | null
          processing_time_ms?: number | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          id?: string
          input_track_id?: string | null
          output_url?: string | null
          parameters?: Json | null
          processing_time_ms?: number | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_input_track_id_fkey"
            columns: ["input_track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string | null
          bird_id: string | null
          confidence: number | null
          created_at: string | null
          id: string
          severity: string | null
          timestamp_in_video: string | null
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          alert_type?: string | null
          bird_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          severity?: string | null
          timestamp_in_video?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          alert_type?: string | null
          bird_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          severity?: string | null
          timestamp_in_video?: string | null
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_bird_id_fkey"
            columns: ["bird_id"]
            isOneToOne: false
            referencedRelation: "birds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_data: {
        Row: {
          created_at: string
          date: string
          id: string
          platform: string
          release_id: string
          revenue: number
          streams: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          platform: string
          release_id: string
          revenue?: number
          streams?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          platform?: string
          release_id?: string
          revenue?: number
          streams?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string | null
          bird_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          user_id: string | null
          vet_name: string | null
        }
        Insert: {
          appointment_date?: string | null
          bird_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
          vet_name?: string | null
        }
        Update: {
          appointment_date?: string | null
          bird_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_bird_id_fkey"
            columns: ["bird_id"]
            isOneToOne: false
            referencedRelation: "birds"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_analysis: {
        Row: {
          analysis_version: string | null
          audio_fingerprint: string | null
          bpm: number | null
          created_at: string
          danceability: number | null
          energy_level: number | null
          genre_tags: string[] | null
          id: string
          instruments: string[] | null
          key_confidence: number | null
          key_signature: string | null
          loudness: number | null
          mood_tags: string[] | null
          spectral_data: Json | null
          tempo_confidence: number | null
          time_signature: number | null
          track_id: string
          updated_at: string
          user_id: string
          valence: number | null
          waveform_data: Json | null
        }
        Insert: {
          analysis_version?: string | null
          audio_fingerprint?: string | null
          bpm?: number | null
          created_at?: string
          danceability?: number | null
          energy_level?: number | null
          genre_tags?: string[] | null
          id?: string
          instruments?: string[] | null
          key_confidence?: number | null
          key_signature?: string | null
          loudness?: number | null
          mood_tags?: string[] | null
          spectral_data?: Json | null
          tempo_confidence?: number | null
          time_signature?: number | null
          track_id: string
          updated_at?: string
          user_id: string
          valence?: number | null
          waveform_data?: Json | null
        }
        Update: {
          analysis_version?: string | null
          audio_fingerprint?: string | null
          bpm?: number | null
          created_at?: string
          danceability?: number | null
          energy_level?: number | null
          genre_tags?: string[] | null
          id?: string
          instruments?: string[] | null
          key_confidence?: number | null
          key_signature?: string | null
          loudness?: number | null
          mood_tags?: string[] | null
          spectral_data?: Json | null
          tempo_confidence?: number | null
          time_signature?: number | null
          track_id?: string
          updated_at?: string
          user_id?: string
          valence?: number | null
          waveform_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_analysis_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_metadata: {
        Row: {
          bpm: number | null
          created_at: string | null
          duration: number | null
          energy: number | null
          id: string
          key_signature: string | null
          track_id: string
          updated_at: string | null
          waveform_url: string | null
        }
        Insert: {
          bpm?: number | null
          created_at?: string | null
          duration?: number | null
          energy?: number | null
          id?: string
          key_signature?: string | null
          track_id: string
          updated_at?: string | null
          waveform_url?: string | null
        }
        Update: {
          bpm?: number | null
          created_at?: string | null
          duration?: number | null
          energy?: number | null
          id?: string
          key_signature?: string | null
          track_id?: string
          updated_at?: string | null
          waveform_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_metadata_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      birds: {
        Row: {
          age: string | null
          color: string | null
          created_at: string | null
          custom_name: string | null
          detected_name: string
          id: string
          image_path: string | null
          notes: string | null
          species: string | null
          user_id: string | null
        }
        Insert: {
          age?: string | null
          color?: string | null
          created_at?: string | null
          custom_name?: string | null
          detected_name: string
          id?: string
          image_path?: string | null
          notes?: string | null
          species?: string | null
          user_id?: string | null
        }
        Update: {
          age?: string | null
          color?: string | null
          created_at?: string | null
          custom_name?: string | null
          detected_name?: string
          id?: string
          image_path?: string | null
          notes?: string | null
          species?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_entries: {
        Row: {
          challenge_id: string
          id: string
          project_id: string | null
          submission_url: string
          submitted_at: string
          user_id: string
          votes: number
        }
        Insert: {
          challenge_id: string
          id?: string
          project_id?: string | null
          submission_url: string
          submitted_at?: string
          user_id: string
          votes?: number
        }
        Update: {
          challenge_id?: string
          id?: string
          project_id?: string | null
          submission_url?: string
          submitted_at?: string
          user_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          prize: string | null
          start_date: string
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          prize?: string | null
          start_date: string
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          prize?: string | null
          start_date?: string
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      collaborations: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          proposed_role: string | null
          proposer_id: string
          recipient_id: string
          status: string
          terms: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          proposed_role?: string | null
          proposer_id: string
          recipient_id: string
          status?: string
          terms?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          proposed_role?: string | null
          proposer_id?: string
          recipient_id?: string
          status?: string
          terms?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      dj_sessions: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          session_data: Json | null
          session_name: string
          tracks_mixed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          session_data?: Json | null
          session_name: string
          tracks_mixed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          session_data?: Json | null
          session_name?: string
          tracks_mixed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dj_set_tracks: {
        Row: {
          bpm_shift: number | null
          created_at: string
          crossfade_duration: number | null
          cue_in: number | null
          cue_out: number | null
          end_time: number | null
          fx_chain: Json | null
          id: string
          key_shift: string | null
          position: number
          set_id: string
          start_time: number | null
          track_id: string
          transition_type: string | null
          user_id: string | null
        }
        Insert: {
          bpm_shift?: number | null
          created_at?: string
          crossfade_duration?: number | null
          cue_in?: number | null
          cue_out?: number | null
          end_time?: number | null
          fx_chain?: Json | null
          id?: string
          key_shift?: string | null
          position: number
          set_id: string
          start_time?: number | null
          track_id: string
          transition_type?: string | null
          user_id?: string | null
        }
        Update: {
          bpm_shift?: number | null
          created_at?: string
          crossfade_duration?: number | null
          cue_in?: number | null
          cue_out?: number | null
          end_time?: number | null
          fx_chain?: Json | null
          id?: string
          key_shift?: string | null
          position?: number
          set_id?: string
          start_time?: number | null
          track_id?: string
          transition_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dj_set_tracks_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "dj_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dj_set_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      dj_sets: {
        Row: {
          average_bpm: number | null
          cover_art_url: string | null
          created_at: string
          description: string | null
          energy_flow: Json | null
          id: string
          is_public: boolean | null
          like_count: number | null
          play_count: number | null
          set_name: string
          total_duration: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_bpm?: number | null
          cover_art_url?: string | null
          created_at?: string
          description?: string | null
          energy_flow?: Json | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          play_count?: number | null
          set_name: string
          total_duration?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_bpm?: number | null
          cover_art_url?: string | null
          created_at?: string
          description?: string | null
          energy_flow?: Json | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          play_count?: number | null
          set_name?: string
          total_duration?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          platform: string | null
          status: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          status?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          platform?: string | null
          status?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          room_id: string
          timestamp_ms: number | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          room_id: string
          timestamp_ms?: number | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          room_id?: string
          timestamp_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "feedback_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_messages: {
        Row: {
          audio_url: string | null
          content: string | null
          created_at: string | null
          id: string
          message_type: string | null
          room_id: string | null
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          message_type?: string | null
          room_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "feedback_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_rooms: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          project_id: string
          room_name: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          project_id: string
          room_name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          project_id?: string
          room_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_pending: {
        Row: {
          blockchain_registro: string | null
          created_at: string
          data_geracao: string
          id: string
          status: string
          tipo: string
          updated_at: string
          user_id: string | null
          valor: number
          vencimento: string
          visivel_somente_adm: boolean
        }
        Insert: {
          blockchain_registro?: string | null
          created_at?: string
          data_geracao?: string
          id?: string
          status?: string
          tipo: string
          updated_at?: string
          user_id?: string | null
          valor: number
          vencimento: string
          visivel_somente_adm?: boolean
        }
        Update: {
          blockchain_registro?: string | null
          created_at?: string
          data_geracao?: string
          id?: string
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
          vencimento?: string
          visivel_somente_adm?: boolean
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          response_time_ms: number
          service_name: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms: number
          service_name: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms?: number
          service_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          plan_type: string
          token: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          plan_type: string
          token: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          plan_type?: string
          token?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          artist_name: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string
          links: Json | null
          release_id: string
          slug: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          artist_name?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          links?: Json | null
          release_id: string
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_name?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          links?: Json | null
          release_id?: string
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          launch_date: string
          metadata: Json | null
          platform: string | null
          reminder_days_before: number | null
          reminder_enabled: boolean | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          launch_date: string
          metadata?: Json | null
          platform?: string | null
          reminder_days_before?: number | null
          reminder_enabled?: boolean | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          launch_date?: string
          metadata?: Json | null
          platform?: string | null
          reminder_days_before?: number | null
          reminder_enabled?: boolean | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          buyer_id: string
          contract_address: string
          created_at: string
          id: string
          price_paid: number
          royalty_split: Json | null
          seller_id: string
          status: string
          stem_id: string
          transaction_hash: string
          user_id: string | null
        }
        Insert: {
          buyer_id: string
          contract_address: string
          created_at?: string
          id?: string
          price_paid: number
          royalty_split?: Json | null
          seller_id: string
          status?: string
          stem_id: string
          transaction_hash: string
          user_id?: string | null
        }
        Update: {
          buyer_id?: string
          contract_address?: string
          created_at?: string
          id?: string
          price_paid?: number
          royalty_split?: Json | null
          seller_id?: string
          status?: string
          stem_id?: string
          transaction_hash?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_stem_id_fkey"
            columns: ["stem_id"]
            isOneToOne: false
            referencedRelation: "stems"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          gross_amount: number
          id: string
          platform_fee: number
          seller_amount: number
          seller_id: string
          status: string
          stripe_payment_intent_id: string
          track_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          gross_amount: number
          id?: string
          platform_fee: number
          seller_amount: number
          seller_id: string
          status?: string
          stripe_payment_intent_id: string
          track_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          gross_amount?: number
          id?: string
          platform_fee?: number
          seller_amount?: number
          seller_id?: string
          status?: string
          stripe_payment_intent_id?: string
          track_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mix_analysis: {
        Row: {
          bpm_progression: number[] | null
          compatibility_score: number | null
          created_at: string
          energy_curve: Json | null
          id: string
          key_progression: string[] | null
          set_id: string
          suggestions: Json | null
          transition_quality: Json | null
          user_id: string | null
        }
        Insert: {
          bpm_progression?: number[] | null
          compatibility_score?: number | null
          created_at?: string
          energy_curve?: Json | null
          id?: string
          key_progression?: string[] | null
          set_id: string
          suggestions?: Json | null
          transition_quality?: Json | null
          user_id?: string | null
        }
        Update: {
          bpm_progression?: number[] | null
          compatibility_score?: number | null
          created_at?: string
          energy_curve?: Json | null
          id?: string
          key_progression?: string[] | null
          set_id?: string
          suggestions?: Json | null
          transition_quality?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mix_analysis_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "dj_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      mix_entries: {
        Row: {
          bpm_shift: number | null
          end_sec: number | null
          key_shift: string | null
          mix_id: string
          position: number
          start_sec: number | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          bpm_shift?: number | null
          end_sec?: number | null
          key_shift?: string | null
          mix_id: string
          position: number
          start_sec?: number | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          bpm_shift?: number | null
          end_sec?: number | null
          key_shift?: string | null
          mix_id?: string
          position?: number
          start_sec?: number | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mix_entries_mix_id_fkey"
            columns: ["mix_id"]
            isOneToOne: false
            referencedRelation: "mixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mix_entries_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      mixes: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          news_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          news_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          news_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_comments_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "real_news"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          buyer_id: string
          commission: number
          completed_at: string | null
          created_at: string
          currency: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          product_id: string
          seller_amount: number
          seller_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          commission: number
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          product_id: string
          seller_amount: number
          seller_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission?: number
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          product_id?: string
          seller_amount?: number
          seller_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_tokens: {
        Row: {
          card_token: string
          id: string
          user_id: string | null
        }
        Insert: {
          card_token: string
          id?: string
          user_id?: string | null
        }
        Update: {
          card_token?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_data"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          completed_at: string | null
          currency: string | null
          id: string
          pix_key: string | null
          requested_at: string
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          currency?: string | null
          id?: string
          pix_key?: string | null
          requested_at?: string
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          currency?: string | null
          id?: string
          pix_key?: string | null
          requested_at?: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          max_mixes: number | null
          max_playlists: number | null
          max_tracks: number | null
          user_id: string | null
        }
        Insert: {
          id: string
          max_mixes?: number | null
          max_playlists?: number | null
          max_tracks?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          max_mixes?: number | null
          max_playlists?: number | null
          max_tracks?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          access_token: string
          connected_at: string
          expires_at: string | null
          id: string
          platform_name: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          platform_name: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          expires_at?: string | null
          id?: string
          platform_name?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          position: number
          track_id: string
          user_id: string | null
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          position: number
          track_id: string
          user_id?: string | null
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          track_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          track_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          track_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plays: {
        Row: {
          completion_rate: number | null
          content_id: string
          content_type: string
          duration_listened: number | null
          id: string
          played_at: string
          user_id: string
        }
        Insert: {
          completion_rate?: number | null
          content_id: string
          content_type: string
          duration_listened?: number | null
          id?: string
          played_at?: string
          user_id: string
        }
        Update: {
          completion_rate?: number | null
          content_id?: string
          content_type?: string
          duration_listened?: number | null
          id?: string
          played_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          like_count: number | null
          remix_thread: boolean | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          remix_thread?: boolean | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          remix_thread?: boolean | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_cache: {
        Row: {
          created_at: string | null
          credits_used: number
          expires_at: string
          id: string
          result: Json
          service_type: string
          track_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          expires_at: string
          id?: string
          result: Json
          service_type: string
          track_id: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          expires_at?: string
          id?: string
          result?: Json
          service_type?: string
          track_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          bpm: number | null
          cover_image_url: string | null
          created_at: string
          currency: string | null
          description: string | null
          downloads_count: number | null
          file_url: string | null
          genre: string | null
          id: string
          is_active: boolean | null
          key_signature: string | null
          preview_url: string | null
          price: number
          product_type: string
          rating: number | null
          review_count: number | null
          seller_id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bpm?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          downloads_count?: number | null
          file_url?: string | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          key_signature?: string | null
          preview_url?: string | null
          price: number
          product_type: string
          rating?: number | null
          review_count?: number | null
          seller_id: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bpm?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          downloads_count?: number | null
          file_url?: string | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          key_signature?: string | null
          preview_url?: string | null
          price?: number
          product_type?: string
          rating?: number | null
          review_count?: number | null
          seller_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits_remaining: number | null
          display_name: string | null
          dj_name: string | null
          favorite_genres: string[] | null
          id: string
          location: string | null
          plan: string | null
          social_links: Json | null
          subscription_plan: string
          updated_at: string
          user_id: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits_remaining?: number | null
          display_name?: string | null
          dj_name?: string | null
          favorite_genres?: string[] | null
          id: string
          location?: string | null
          plan?: string | null
          social_links?: Json | null
          subscription_plan?: string
          updated_at?: string
          user_id?: string | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits_remaining?: number | null
          display_name?: string | null
          dj_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          location?: string | null
          plan?: string | null
          social_links?: Json | null
          subscription_plan?: string
          updated_at?: string
          user_id?: string | null
          username?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_plan_fkey"
            columns: ["plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bpm: number | null
          created_at: string
          description: string | null
          file_url: string | null
          genre: string | null
          id: string
          key: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          created_at?: string
          description?: string | null
          file_url?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_logs: {
        Row: {
          endpoint: string
          id: string
          identifier: string
          ts: string
          user_id: string | null
        }
        Insert: {
          endpoint: string
          id?: string
          identifier: string
          ts?: string
          user_id?: string | null
        }
        Update: {
          endpoint?: string
          id?: string
          identifier?: string
          ts?: string
          user_id?: string | null
        }
        Relationships: []
      }
      real_news: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          published_at: string
          source: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at: string
          source: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recommendations_log: {
        Row: {
          confidence_score: number | null
          feedback: string | null
          id: string
          item_type: string
          recommended_at: string
          recommended_item_id: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          feedback?: string | null
          id?: string
          item_type: string
          recommended_at?: string
          recommended_item_id?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          feedback?: string | null
          id?: string
          item_type?: string
          recommended_at?: string
          recommended_item_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          cover_art_url: string | null
          created_at: string
          id: string
          isrc: string | null
          landing_page_url: string | null
          project_id: string
          release_date: string
          status: string
          user_id: string | null
        }
        Insert: {
          cover_art_url?: string | null
          created_at?: string
          id?: string
          isrc?: string | null
          landing_page_url?: string | null
          project_id: string
          release_date: string
          status?: string
          user_id?: string | null
        }
        Update: {
          cover_art_url?: string | null
          created_at?: string
          id?: string
          isrc?: string | null
          landing_page_url?: string | null
          project_id?: string
          release_date?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "releases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      remix_threads: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string
          post_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id: string
          post_id: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string
          post_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remix_threads_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_contracts: {
        Row: {
          contract_url: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          release_id: string
          royalty_percent: number | null
          user_id: string | null
        }
        Insert: {
          contract_url?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          release_id: string
          royalty_percent?: number | null
          user_id?: string | null
        }
        Update: {
          contract_url?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          release_id?: string
          royalty_percent?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_contracts_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          caption: string | null
          comment_count: number | null
          content_id: string | null
          created_at: string
          hashtags: string[] | null
          id: string
          is_featured: boolean | null
          like_count: number | null
          media_urls: string[] | null
          mentions: string[] | null
          play_count: number | null
          post_type: string
          repost_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          comment_count?: number | null
          content_id?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          media_urls?: string[] | null
          mentions?: string[] | null
          play_count?: number | null
          post_type: string
          repost_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          comment_count?: number | null
          content_id?: string | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          is_featured?: boolean | null
          like_count?: number | null
          media_urls?: string[] | null
          mentions?: string[] | null
          play_count?: number | null
          post_type?: string
          repost_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stems: {
        Row: {
          created_at: string
          file_url: string
          id: string
          is_premium: boolean
          price: number | null
          project_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          is_premium?: boolean
          price?: number | null
          project_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          is_premium?: boolean
          price?: number | null
          project_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_sessions: {
        Row: {
          content_id: string
          content_type: string
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          ip_address: unknown
          location: Json | null
          quality: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          location?: Json | null
          quality?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          location?: Json | null
          quality?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_limits: {
        Row: {
          can_export: boolean | null
          can_use_community: boolean | null
          can_use_marketplace: boolean | null
          created_at: string
          id: string
          marketplace_commission_rate: number
          max_storage_mb: number
          max_tracks: number
          plan_type: string
          user_id: string | null
        }
        Insert: {
          can_export?: boolean | null
          can_use_community?: boolean | null
          can_use_marketplace?: boolean | null
          created_at?: string
          id?: string
          marketplace_commission_rate?: number
          max_storage_mb: number
          max_tracks: number
          plan_type: string
          user_id?: string | null
        }
        Update: {
          can_export?: boolean | null
          can_use_community?: boolean | null
          can_use_marketplace?: boolean | null
          created_at?: string
          id?: string
          marketplace_commission_rate?: number
          max_storage_mb?: number
          max_tracks?: number
          plan_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_comments: {
        Row: {
          color_code: string | null
          content: string
          created_at: string
          id: string
          is_resolved: boolean | null
          parent_id: string | null
          timestamp_mark: number | null
          track_id: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color_code?: string | null
          content: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          timestamp_mark?: number | null
          track_id: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color_code?: string | null
          content?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          timestamp_mark?: number | null
          track_id?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "track_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_cues: {
        Row: {
          color: string | null
          created_at: string
          id: string
          label: string | null
          position_ms: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          label?: string | null
          position_ms: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          label?: string | null
          position_ms?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_features: {
        Row: {
          analysis: Json | null
          bpm: number | null
          camelot: string | null
          created_at: string
          energy_level: number | null
          id: string
          key_signature: string | null
          mode: string | null
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          bpm?: number | null
          camelot?: string | null
          created_at?: string
          energy_level?: number | null
          id?: string
          key_signature?: string | null
          mode?: string | null
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          bpm?: number | null
          camelot?: string | null
          created_at?: string
          energy_level?: number | null
          id?: string
          key_signature?: string | null
          mode?: string | null
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_loops: {
        Row: {
          created_at: string
          end_ms: number
          id: string
          label: string | null
          start_ms: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_ms: number
          id?: string
          label?: string | null
          start_ms: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_ms?: number
          id?: string
          label?: string | null
          start_ms?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      track_stems: {
        Row: {
          created_at: string
          duration: number | null
          file_size: number | null
          file_url: string
          id: string
          stem_type: string
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          stem_type: string
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          stem_type?: string
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_stems_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          artist: string
          bpm: number | null
          created_at: string
          deleted_at: string | null
          duration: string
          energy_level: number | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          genre: string | null
          id: string
          is_featured: boolean | null
          is_liked: boolean | null
          key_signature: string | null
          original_filename: string | null
          play_count: number | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          upload_status: string | null
          user_id: string
          waveform_data: Json | null
        }
        Insert: {
          artist: string
          bpm?: number | null
          created_at?: string
          deleted_at?: string | null
          duration: string
          energy_level?: number | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_liked?: boolean | null
          key_signature?: string | null
          original_filename?: string | null
          play_count?: number | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          upload_status?: string | null
          user_id: string
          waveform_data?: Json | null
        }
        Update: {
          artist?: string
          bpm?: number | null
          created_at?: string
          deleted_at?: string | null
          duration?: string
          energy_level?: number | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          genre?: string | null
          id?: string
          is_featured?: boolean | null
          is_liked?: boolean | null
          key_signature?: string | null
          original_filename?: string | null
          play_count?: number | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          upload_status?: string | null
          user_id?: string
          waveform_data?: Json | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          currency: string
          id: string
          item_id: string | null
          item_type: string
          payment_method: string | null
          status: string
          transaction_date: string
          user_id: string
        }
        Insert: {
          amount: number
          currency?: string
          id?: string
          item_id?: string | null
          item_type: string
          payment_method?: string | null
          status?: string
          transaction_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          item_id?: string | null
          item_type?: string
          payment_method?: string | null
          status?: string
          transaction_date?: string
          user_id?: string
        }
        Relationships: []
      }
      upload_analytics: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          retry_count: number | null
          track_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          retry_count?: number | null
          track_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          retry_count?: number | null
          track_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_analytics_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          genre_preferences: Json | null
          instrument_preferences: Json | null
          recent_activity: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          genre_preferences?: Json | null
          instrument_preferences?: Json | null
          recent_activity?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          genre_preferences?: Json | null
          instrument_preferences?: Json | null
          recent_activity?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          dj_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          instagram_handle: string | null
          location: string | null
          soundcloud_handle: string | null
          spotify_url: string | null
          total_likes: number | null
          total_plays: number | null
          updated_at: string
          user_id: string | null
          username: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          dj_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          instagram_handle?: string | null
          location?: string | null
          soundcloud_handle?: string | null
          spotify_url?: string | null
          total_likes?: number | null
          total_plays?: number | null
          updated_at?: string
          user_id?: string | null
          username: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          dj_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          instagram_handle?: string | null
          location?: string | null
          soundcloud_handle?: string | null
          spotify_url?: string | null
          total_likes?: number | null
          total_plays?: number | null
          updated_at?: string
          user_id?: string | null
          username?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      users_data: {
        Row: {
          aprovado: boolean
          blockchain_registro: string | null
          celular: string
          created_at: string
          data_cadastro: string
          device_data: Json | null
          email: string
          id: string
          nome_completo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aprovado?: boolean
          blockchain_registro?: string | null
          celular: string
          created_at?: string
          data_cadastro?: string
          device_data?: Json | null
          email: string
          id?: string
          nome_completo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aprovado?: boolean
          blockchain_registro?: string | null
          celular?: string
          created_at?: string
          data_cadastro?: string
          device_data?: Json | null
          email?: string
          id?: string
          nome_completo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          analysis_status: string | null
          duration: number | null
          file_path: string
          filename: string
          id: string
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          analysis_status?: string | null
          duration?: number | null
          file_path: string
          filename: string
          id?: string
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_status?: string | null
          duration?: number | null
          file_path?: string
          filename?: string
          id?: string
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          received_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          dj_name: string | null
          followers_count: number | null
          id: string | null
          total_plays: number | null
          username: string | null
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          dj_name?: string | null
          followers_count?: number | null
          id?: string | null
          total_plays?: number | null
          username?: string | null
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          dj_name?: string | null
          followers_count?: number | null
          id?: string | null
          total_plays?: number | null
          username?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      public_user_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          subscription_plan: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          subscription_plan?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          subscription_plan?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_create_mix: { Args: { p_user: string }; Returns: boolean }
      can_create_playlist: { Args: { p_user: string }; Returns: boolean }
      can_create_track: { Args: { p_user: string }; Returns: boolean }
      can_user_upload_track: { Args: { user_uuid?: string }; Returns: boolean }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_expired_cache: { Args: never; Returns: undefined }
      cleanup_expired_tokens: { Args: never; Returns: undefined }
      decrement_comment_count: { Args: { post_id: string }; Returns: undefined }
      get_comment_color: { Args: { comment_type: string }; Returns: string }
      get_user_subscription_info: {
        Args: { user_uuid?: string }
        Returns: {
          can_export: boolean
          can_use_community: boolean
          can_use_marketplace: boolean
          current_period_end: string
          marketplace_commission_rate: number
          max_storage_mb: number
          max_tracks: number
          plan_type: string
          status: string
        }[]
      }
      increment_comment_count: { Args: { post_id: string }; Returns: undefined }
      is_admin:
        | { Args: { user_id?: string }; Returns: boolean }
        | { Args: never; Returns: boolean }
      is_admin_by_email: { Args: { email: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
