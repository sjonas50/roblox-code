export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'starter' | 'pro' | 'team'
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro' | 'team'
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro' | 'team'
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          last_accessed: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
          last_accessed?: string | null
        }
      }
      scripts: {
        Row: {
          id: string
          project_id: string
          name: string
          type: 'server' | 'client' | 'module'
          content: string
          description: string | null
          last_generated_prompt: string | null
          created_at: string
          updated_at: string
          order_index: number
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          type: 'server' | 'client' | 'module'
          content?: string
          description?: string | null
          last_generated_prompt?: string | null
          created_at?: string
          updated_at?: string
          order_index?: number
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          type?: 'server' | 'client' | 'module'
          content?: string
          description?: string | null
          last_generated_prompt?: string | null
          created_at?: string
          updated_at?: string
          order_index?: number
        }
      }
      code_versions: {
        Row: {
          id: string
          script_id: string
          version_number: number
          content: string
          description: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          script_id: string
          version_number: number
          content: string
          description?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          script_id?: string
          version_number?: number
          content?: string
          description?: string | null
          created_at?: string
          created_by?: string
        }
      }
      generation_sessions: {
        Row: {
          id: string
          user_id: string
          script_id: string
          prompt: string
          model_used: string
          tokens_used: number
          response_time_ms: number
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          script_id: string
          prompt: string
          model_used: string
          tokens_used: number
          response_time_ms: number
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          script_id?: string
          prompt?: string
          model_used?: string
          tokens_used?: number
          response_time_ms?: number
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          is_public: boolean
          created_by: string | null
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          is_public?: boolean
          created_by?: string | null
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          is_public?: boolean
          created_by?: string | null
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      template_scripts: {
        Row: {
          id: string
          template_id: string
          name: string
          type: 'server' | 'client' | 'module'
          content: string
          description: string | null
          order_index: number
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          type: 'server' | 'client' | 'module'
          content: string
          description?: string | null
          order_index?: number
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          type?: 'server' | 'client' | 'module'
          content?: string
          description?: string | null
          order_index?: number
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          action_type: string
          resource_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}