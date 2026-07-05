export type UserRole = 'user' | 'admin' | 'manager';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  merchant_id: string;
  merchant_name: string;
  operator_id: string | null;
  channel: 'phone' | 'wechat' | 'face_to_face' | 'email';
  duration_minutes: number | null;
  content: string;
  result: 'connected' | 'no_answer' | 'rejected' | 'signed' | 'follow_up' | null;
  notes: string | null;
  contact_time: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}
