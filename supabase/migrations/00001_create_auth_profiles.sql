-- 用户角色枚举
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'manager');

-- 用户档案表
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'user',
  department text,
  region text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 自动同步新用户触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'user'::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 防止无限递归的 helper 函数
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Managers can view all profiles" ON profiles
  FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = 'manager'::user_role);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

-- 公开视图
CREATE VIEW public_profiles AS
  SELECT id, display_name, avatar_url, role, region FROM profiles;

-- 沟通记录表
CREATE TABLE public.communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id text NOT NULL,
  merchant_name text NOT NULL,
  operator_id uuid REFERENCES public.profiles(id),
  channel text NOT NULL CHECK (channel IN ('phone', 'wechat', 'face_to_face', 'email')),
  duration_minutes int,
  content text NOT NULL,
  result text CHECK (result IN ('connected', 'no_answer', 'rejected', 'signed', 'follow_up')),
  notes text,
  contact_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read communications" ON communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert communications" ON communications FOR INSERT TO authenticated WITH CHECK (auth.uid() = operator_id);
CREATE POLICY "Users can update own communications" ON communications FOR UPDATE TO authenticated USING (auth.uid() = operator_id);

-- 系统通知表
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);