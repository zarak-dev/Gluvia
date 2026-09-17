-- ============================================================
-- Gluvia Database Schema
-- Diabetes management for South Asian lifestyles
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================

-- User profiles (linked to Supabase Auth)
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blood sugar readings
CREATE TABLE public.sugar_readings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reading_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  sugar_mg_dl  INTEGER NOT NULL CHECK (sugar_mg_dl BETWEEN 40 AND 600),
  meal_tag     TEXT NOT NULL CHECK (meal_tag IN ('fasting', 'before_meal', 'after_meal', 'bedtime')),
  food_eaten   TEXT CHECK (food_eaten IS NULL OR char_length(food_eaten) <= 500),
  notes        TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-generated diet plans
CREATE TABLE public.diet_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calories    INTEGER NOT NULL CHECK (calories BETWEEN 500 AND 5000),
  sugar_level TEXT NOT NULL CHECK (sugar_level IN ('low', 'normal', 'elevated', 'high')),
  plan_text   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food combination reference data (read-only for users)
CREATE TABLE public.food_combinations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sugar_state   TEXT NOT NULL CHECK (sugar_state IN ('pre', 'type1', 'type2', 'advanced')),
  time_of_day   TEXT NOT NULL CHECK (time_of_day IN ('breakfast', 'lunch', 'dinner')),
  price_pref    TEXT NOT NULL CHECK (price_pref IN ('budget', 'moderate', 'premium')),
  taste_pref    TEXT NOT NULL CHECK (taste_pref IN ('sweet', 'savory', 'spicy', 'mild')),
  food_item     TEXT NOT NULL,
  calories      INTEGER NOT NULL,
  protein       NUMERIC(6, 2) NOT NULL,
  carbohydrates NUMERIC(6, 2) NOT NULL,
  fat           NUMERIC(6, 2) NOT NULL,
  fiber         NUMERIC(6, 2) NOT NULL,
  sugar         NUMERIC(6, 2) NOT NULL
);

-- ============================================================
-- Indexes
-- ============================================================

-- RLS policy performance
CREATE INDEX idx_sugar_readings_user_id ON public.sugar_readings(user_id);
CREATE INDEX idx_diet_plans_user_id     ON public.diet_plans(user_id);

-- Time-series query performance
CREATE INDEX idx_sugar_readings_date ON public.sugar_readings(user_id, reading_date DESC);

-- Food filter query performance
CREATE INDEX idx_food_combinations_filters ON public.food_combinations(sugar_state, time_of_day, price_pref, taste_pref);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugar_readings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_combinations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can manage only their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- Sugar readings: users can manage only their own readings
CREATE POLICY "sugar_readings_select_own" ON public.sugar_readings
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "sugar_readings_insert_own" ON public.sugar_readings
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "sugar_readings_update_own" ON public.sugar_readings
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "sugar_readings_delete_own" ON public.sugar_readings
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Diet plans: users can manage only their own diet plans
CREATE POLICY "diet_plans_select_own" ON public.diet_plans
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "diet_plans_insert_own" ON public.diet_plans
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "diet_plans_update_own" ON public.diet_plans
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "diet_plans_delete_own" ON public.diet_plans
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Food combinations: public SELECT only (no write access for authenticated/anon)
CREATE POLICY "food_combinations_select_public" ON public.food_combinations
  FOR SELECT USING (true);

-- ============================================================
-- Profile Creation Trigger
-- ============================================================

-- Automatically create a profile row when a new user signs up.
-- SECURITY DEFINER with pinned search_path to prevent injection.
-- All schema references are fully qualified.
-- ON CONFLICT guards against duplicate execution.
-- Null metadata is handled safely.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'username',
      NULL
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- LIVE DATABASE MIGRATION SCRIPT (For existing deployments)
-- Execute these statements in Supabase SQL Editor if upgrading:
-- ============================================================
-- 1. Migrate reading_date to TIMESTAMPTZ (C-2)
-- ALTER TABLE public.sugar_readings
--   ALTER COLUMN reading_date TYPE TIMESTAMPTZ USING reading_date::TIMESTAMPTZ;
--
-- 2. Add text length check constraints (H-5)
-- ALTER TABLE public.sugar_readings
--   ADD CONSTRAINT chk_food_eaten_length CHECK (food_eaten IS NULL OR char_length(food_eaten) <= 500),
--   ADD CONSTRAINT chk_notes_length      CHECK (notes IS NULL OR char_length(notes) <= 1000);
--
-- 3. Add profiles self-insert policy for recovery (H-6)
-- CREATE POLICY "profiles_insert_own" ON public.profiles
--   FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

