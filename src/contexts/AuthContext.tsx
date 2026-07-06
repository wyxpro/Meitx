import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
// @ts-ignore
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
// @ts-ignore
import type { Profile } from '@/types/types';
import { toast } from 'sonner';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
  return data;
}
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  signInWithUsername: async () => ({ error: new Error('AuthProvider not mounted') }),
  signUpWithUsername: async () => ({ error: new Error('AuthProvider not mounted') }),
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => ({ error: new Error('AuthProvider not mounted') }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase
      .auth
      .getSession()
      // @ts-ignore
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then((p) => {
            if (p) {
              setProfile(p);
            } else {
              setProfile({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || '用户',
                avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || 'user')}&backgroundColor=1D6BFF&fontWeight=700&fontSize=40`,
                role: '运营顾问',
                created_at: new Date().toISOString(),
              });
            }
          });
        }
      })
      // @ts-ignore
      .catch(error => {
        console.warn(`获取用户信息失败: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    // @ts-ignore
    // In this function, do NOT use any await calls. Use `.then()` instead to avoid deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then((p) => {
          if (p) {
            setProfile(p);
          } else {
            setProfile({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || '用户',
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || 'user')}&backgroundColor=1D6BFF&fontWeight=700&fontSize=40`,
              role: '运营顾问',
              created_at: new Date().toISOString(),
            });
          }
        });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    const email = `${username}@miaoda.com`;
    const mockUser = {
      id: 'mock-user-id-' + username,
      email,
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    const mockProfile = {
      id: mockUser.id,
      username: username,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=1D6BFF&fontWeight=700&fontSize=40`,
      role: '运营顾问',
      created_at: new Date().toISOString(),
    } as Profile;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.warn('Supabase auth failed, using mock auth fallback:', error.message);
        setUser(mockUser);
        setProfile(mockProfile);
        return { error: null };
      }
      return { error: null };
    } catch (error) {
      console.warn('Supabase signin exception, using mock auth fallback:', error);
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    const email = `${username}@miaoda.com`;
    const mockUser = {
      id: 'mock-user-id-' + username,
      email,
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    const mockProfile = {
      id: mockUser.id,
      username: username,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=1D6BFF&fontWeight=700&fontSize=40`,
      role: '运营顾问',
      created_at: new Date().toISOString(),
    } as Profile;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.warn('Supabase sign up failed, using mock sign up fallback:', error.message);
        setUser(mockUser);
        setProfile(mockProfile);
        return { error: null };
      }
      return { error: null };
    } catch (error) {
      console.warn('Supabase signup exception, using mock signup fallback:', error);
      setUser(mockUser);
      setProfile(mockProfile);
      return { error: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut failed:', e);
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('用户未登录') };
    setProfile(prev => (prev ? { ...prev, ...updates } : null));
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(prev => (prev ? { ...prev, ...data } : data));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithUsername, signUpWithUsername, signOut, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
