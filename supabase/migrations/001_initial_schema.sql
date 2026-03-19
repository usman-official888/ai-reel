-- =============================================
-- VideoForge AI - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM Types
-- =============================================

CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'business', 'enterprise');
CREATE TYPE project_status AS ENUM ('draft', 'processing', 'completed', 'failed');
CREATE TYPE job_type AS ENUM ('script', 'image', 'video', 'voice', 'assembly');
CREATE TYPE job_status AS ENUM ('pending', 'queued', 'running', 'completed', 'failed');
CREATE TYPE social_platform AS ENUM ('youtube', 'tiktok', 'instagram', 'twitter');
CREATE TYPE publication_status AS ENUM ('pending', 'uploading', 'published', 'failed', 'scheduled');
CREATE TYPE transaction_type AS ENUM ('purchase', 'subscription', 'usage', 'refund', 'bonus');
CREATE TYPE payment_method AS ENUM ('stripe', 'crypto', 'free');

-- =============================================
-- Users Table (extends Supabase auth.users)
-- =============================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    credits_balance INTEGER DEFAULT 3,
    credits_used_this_month INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    crypto_wallet_address TEXT,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Projects Table
-- =============================================

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    status project_status DEFAULT 'draft',
    progress INTEGER DEFAULT 0,
    
    -- Settings
    style TEXT DEFAULT 'documentary',
    duration_target INTEGER DEFAULT 60,
    voice_style TEXT DEFAULT 'professional',
    voice_gender TEXT DEFAULT 'male',
    aspect_ratio TEXT DEFAULT '16:9',
    
    -- Generated content
    script JSONB,
    scenes JSONB,
    
    -- Output
    output_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    
    -- Cost tracking
    cost_credits INTEGER DEFAULT 0,
    cost_usd DECIMAL(10, 4) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Jobs Table (Processing tasks)
-- =============================================

CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    type job_type NOT NULL,
    status job_status DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,
    
    -- Input/Output
    input_data JSONB,
    output_data JSONB,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- External provider tracking
    external_id TEXT,
    provider TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Social Accounts Table
-- =============================================

CREATE TABLE public.social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    platform social_platform NOT NULL,
    account_handle TEXT NOT NULL,
    account_name TEXT,
    profile_image_url TEXT,
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One account per platform per user
    UNIQUE(user_id, platform)
);

-- =============================================
-- Publications Table
-- =============================================

CREATE TABLE public.publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    platform social_platform NOT NULL,
    status publication_status DEFAULT 'pending',
    
    -- Content
    title TEXT NOT NULL,
    description TEXT,
    hashtags TEXT[],
    
    -- Platform details
    platform_post_id TEXT,
    platform_post_url TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    
    -- Analytics (updated periodically)
    analytics JSONB DEFAULT '{"views": 0, "likes": 0, "comments": 0, "shares": 0}',
    
    -- Error handling
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Transactions Table
-- =============================================

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    type transaction_type NOT NULL,
    payment_method payment_method,
    
    -- Amounts
    amount_usd DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    credits_amount INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending',
    
    -- Description
    description TEXT,
    
    -- External references
    stripe_payment_id TEXT,
    stripe_invoice_id TEXT,
    crypto_tx_hash TEXT,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);

-- Projects
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- Jobs
CREATE INDEX idx_jobs_project_id ON public.jobs(project_id);
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_external_id ON public.jobs(external_id);

-- Social Accounts
CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);

-- Publications
CREATE INDEX idx_publications_project_id ON public.publications(project_id);
CREATE INDEX idx_publications_user_id ON public.publications(user_id);
CREATE INDEX idx_publications_status ON public.publications(status);

-- Transactions
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Jobs: Users can only access their own jobs
CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs" ON public.jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON public.jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Social Accounts: Users can only access their own accounts
CREATE POLICY "Users can view own social accounts" ON public.social_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social accounts" ON public.social_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts" ON public.social_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts" ON public.social_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Publications: Users can only access their own publications
CREATE POLICY "Users can view own publications" ON public.publications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own publications" ON public.publications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own publications" ON public.publications
    FOR UPDATE USING (auth.uid() = user_id);

-- Transactions: Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- Functions & Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON public.social_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to reset monthly credits (call via cron)
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
DECLARE
    tier_credits RECORD;
BEGIN
    -- Reset credits based on subscription tier
    UPDATE public.users
    SET 
        credits_used_this_month = 0,
        credits_balance = CASE subscription_tier
            WHEN 'free' THEN 3
            WHEN 'starter' THEN 30
            WHEN 'pro' THEN 100
            WHEN 'business' THEN 500
            WHEN 'enterprise' THEN 999999
            ELSE 3
        END,
        updated_at = NOW()
    WHERE subscription_tier IS NOT NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =============================================
-- Initial Data (Optional)
-- =============================================

-- You can add any seed data here if needed
