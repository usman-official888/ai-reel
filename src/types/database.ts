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
export type JobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed'
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter'
export type PublicationStatus = 'pending' | 'scheduled' | 'publishing' | 'published' | 'failed'
export type TransactionType = 'subscription' | 'purchase' | 'usage' | 'refund'
export type PaymentMethod = 'stripe' | 'crypto' | 'free'

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
          credits_used_this_month: number
          stripe_customer_id: string | null
          crypto_wallet_address: string | null
          subscription_start_date: string | null
          subscription_end_date: string | null
          email_verified: boolean
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
          credits_used_this_month?: number
          stripe_customer_id?: string | null
          crypto_wallet_address?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          email_verified?: boolean
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
          credits_used_this_month?: number
          stripe_customer_id?: string | null
          crypto_wallet_address?: string | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          email_verified?: boolean
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
          style: string
          duration_target: number
          voice_style: string
          voice_gender: string
          aspect_ratio: string
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
          style?: string
          duration_target?: number
          voice_style?: string
          voice_gender?: string
          aspect_ratio?: string
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
          style?: string
          duration_target?: number
          voice_style?: string
          voice_gender?: string
          aspect_ratio?: string
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
          user_id: string
          job_type: JobType
          type?: JobType
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
          user_id: string
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
          user_id?: string
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
          account_name: string | null
          profile_image_url: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: SocialPlatform
          account_handle: string
          account_name?: string | null
          profile_image_url?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          platform?: SocialPlatform
          account_handle?: string
          account_name?: string | null
          profile_image_url?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      publications: {
        Row: {
          id: string
          project_id: string
          user_id: string
          platform: SocialPlatform
          status: PublicationStatus
          caption: string | null
          hashtags: string[] | null
          scheduled_at: string | null
          published_at: string | null
          published_url: string | null
          error_message: string | null
          views_count: number
          likes_count: number
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          platform: SocialPlatform
          status?: PublicationStatus
          caption?: string | null
          hashtags?: string[] | null
          scheduled_at?: string | null
          published_at?: string | null
          published_url?: string | null
          error_message?: string | null
          views_count?: number
          likes_count?: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          platform?: SocialPlatform
          status?: PublicationStatus
          caption?: string | null
          hashtags?: string[] | null
          scheduled_at?: string | null
          published_at?: string | null
          published_url?: string | null
          error_message?: string | null
          views_count?: number
          likes_count?: number
          metadata?: Json | null
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          payment_method: PaymentMethod
          amount_usd: number
          credits_amount: number
          description: string | null
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
          amount_usd?: number
          credits_amount?: number
          description?: string | null
          status?: string
          external_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          user_id?: string
          type?: TransactionType
          payment_method?: PaymentMethod
          amount_usd?: number
          credits_amount?: number
          description?: string | null
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
