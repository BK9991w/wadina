-- ============================================================
-- وادينا — جدول الرحلات المحفوظة مع سياسات RLS
-- شغّل هذا الملف مرة واحدة في Supabase SQL Editor
-- ============================================================

-- جدول الرحلات المحفوظة
create table if not exists public.saved_trips (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null default 'رحلتي',
  summary      text not null default '',
  -- بيانات المدخلات الأصلية (لإمكانية إعادة التوليد)
  input        jsonb not null default '{}',
  -- نتيجة الخطة كاملة
  result       jsonb not null default '{}',
  -- الفندق المختار (null = لم يُختر)
  selected_hotel jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- index سريع للبحث بالمستخدم
create index if not exists saved_trips_user_id_idx
  on public.saved_trips(user_id, created_at desc);

-- تفعيل Row Level Security
alter table public.saved_trips enable row level security;

-- سياسة: كل مستخدم يرى رحلاته فقط
create policy "users can view own trips"
  on public.saved_trips for select
  using (auth.uid() = user_id);

-- سياسة: كل مستخدم يُنشئ رحلاته فقط
create policy "users can insert own trips"
  on public.saved_trips for insert
  with check (auth.uid() = user_id);

-- سياسة: كل مستخدم يعدّل رحلاته فقط
create policy "users can update own trips"
  on public.saved_trips for update
  using (auth.uid() = user_id);

-- سياسة: كل مستخدم يحذف رحلاته فقط
create policy "users can delete own trips"
  on public.saved_trips for delete
  using (auth.uid() = user_id);

-- trigger لتحديث updated_at تلقائياً
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger saved_trips_updated_at
  before update on public.saved_trips
  for each row execute function public.set_updated_at();
