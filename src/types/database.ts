/**
 * Database Types for Supabase
 * Auto-generated types should be placed here after running:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 * 
 * For now, we define the expected schema manually.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed'
export type JobType = 'script' | 'image' | 'video' | 'voice' | 'assembly'
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter'
export type PublicationStatus = 'scheduled' | 'publishing' | 'published' | 'failed'
export type TransactionType = 'subscription' | 'credits' | 'refund'
export type PaymentMethod = 'stripe' | 'crypto' | 'credits'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: SubscriptionTier
          credits_balance: number
          stripe_customer_id: string | null
          crypto_wallet_address: string | null
          subscription_start: string | null
          subscription_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: SubscriptionTier
          credits_balance?: number
          stripe_customer_id?: string | null
          crypto_wallet_address?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: SubscriptionTier
          credits_balance?: number
          stripe_customer_id?: string | null
          crypto_wallet_address?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          topic: string
          status: ProjectStatus
          progress: number
          settings: Json
          script: Json | null
          scenes: Json | null
          output_url: string | null
          thumbnail_url: string | null
          duration_seconds: number | null
          cost_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          topic: string
          status?: ProjectStatus
          progress?: number
          settings: Json
          script?: Json | null
          scenes?: Json | null
          output_url?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          cost_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          title?: string
          topic?: string
          status?: ProjectStatus
          progress?: number
          settings?: Json
          script?: Json | null
          scenes?: Json | null
          output_url?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          cost_credits?: number
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          project_id: string
          job_type: JobType
          status: JobStatus
          progress: number
          input_data: Json | null
          output_data: Json | null
          error_message: string | null
          retry_count: number
          priority: number
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          job_type: JobType
          status?: JobStatus
          progress?: number
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          retry_count?: number
          priority?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          job_type?: JobType
          status?: JobStatus
          progress?: number
          input_data?: Json | null
          output_data?: Json | null
          error_message?: string | null
          retry_count?: number
          priority?: number
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: SocialPlatform
          account_handle: string
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: SocialPlatform
          account_handle: string
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          platform?: SocialPlatform
          account_handle?: string
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
        }
      }
      publications: {
        Row: {
          id: string
          project_id: string
          social_account_id: string
          platform_post_id: string | null
          post_url: string | null
          status: PublicationStatus
          scheduled_at: string | null
          published_at: string | null
          analytics: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          social_account_id: string
          platform_post_id?: string | null
          post_url?: string | null
          status?: PublicationStatus
          scheduled_at?: string | null
          published_at?: string | null
          analytics?: Json | null
          created_at?: string
        }
        Update: {
          project_id?: string
          social_account_id?: string
          platform_post_id?: string | null
          post_url?: string | null
          status?: PublicationStatus
          scheduled_at?: string | null
          published_at?: string | null
          analytics?: Json | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          payment_method: PaymentMethod
          amount: number
          currency: string
          credits_amount: number
          status: string
          external_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          payment_method: PaymentMethod
          amount: number
          currency?: string
          credits_amount?: number
          status?: string
          external_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          user_id?: string
          type?: TransactionType
          payment_method?: PaymentMethod
          amount?: number
          currency?: string
          credits_amount?: number
          status?: string
          external_id?: string | null
          metadata?: Json | null
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
      project_status: ProjectStatus
      job_type: JobType
      job_status: JobStatus
      subscription_tier: SubscriptionTier
      social_platform: SocialPlatform
      publication_status: PublicationStatus
      transaction_type: TransactionType
      payment_method: PaymentMethod
    }
  }
}

// Convenience type exports
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type SocialAccount = Database['public']['Tables']['social_accounts']['Row']
export type SocialAccountInsert = Database['public']['Tables']['social_accounts']['Insert']

export type Publication = Database['public']['Tables']['publications']['Row']
export type PublicationInsert = Database['public']['Tables']['publications']['Insert']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
