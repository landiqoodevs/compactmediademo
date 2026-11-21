-- COMPACT MEDIA: Supabase schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

-- Admins: add Harsh's auth user id after creating his account (see README step)
create table admins (user_id uuid primary key references auth.users on delete cascade);
create function is_admin() returns boolean language sql security definer stable as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null, client text,
  category text not null check (category in ('Social Media','Ads','Design','Video','Web','SEO')),
  short_description text, description text, challenge text, strategy text, execution text, results text,
  cover_url text, gallery text[] default '{}', video_url text,
  project_date date, featured boolean default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz default now(), updated_at timestamptz default now());

create table case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null, client text, category text, objective text, strategy text, execution text,
  services text[] default '{}', results text,
  metrics jsonb default '[]',            -- only real, admin-entered data
  screenshots text[] default '{}', cover_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz default now(), updated_at timestamptz default now());

create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  company_name text check (char_length(company_name) <= 120),
  email_private text check (char_length(email_private) <= 254),
  rating int not null check (rating between 1 and 5),
  service text, review_title text check (char_length(review_title) <= 120),
  review_text text not null check (char_length(review_text) between 10 and 2000),
  avatar_url text,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  featured boolean not null default false,
  permission_given boolean not null check (permission_given),
  created_at timestamptz default now(), updated_at timestamptz default now(), published_at timestamptz);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, business_name text,
  service text, budget text, message text not null,
  status text not null default 'new' check (status in ('new','contacted','converted','closed')),
  created_at timestamptz default now());

create table site_settings (            -- single row, id = 1
  id int primary key default 1 check (id = 1),
  business_name text default 'Compact Media', logo_url text,
  email text default 'harshanand98355@gmail.com',
  whatsapp_number text,                 -- set from admin; never hardcoded
  instagram_business text default 'https://www.instagram.com/_thecompactmedia/',
  instagram_personal text default 'https://www.instagram.com/harshanand__/',
  hero_heading text, hero_description text, cta_text text, about_description text);
insert into site_settings (id) values (1);

-- updated_at trigger + publish timestamp
create function touch() returns trigger language plpgsql as $$
begin new.updated_at = now();
  if tg_table_name='reviews' and new.status='published' and old.status<>'published' then new.published_at = now(); end if;
  return new; end $$;
create trigger t1 before update on projects for each row execute function touch();
create trigger t2 before update on case_studies for each row execute function touch();
create trigger t3 before update on reviews for each row execute function touch();

-- RLS
alter table admins enable row level security;
alter table projects enable row level security;
alter table case_studies enable row level security;
alter table reviews enable row level security;
alter table inquiries enable row level security;
alter table site_settings enable row level security;

create policy "public reads published" on projects for select using (status='published');
create policy "public reads published" on case_studies for select using (status='published');
create policy "public reads published" on reviews for select using (status='published');
create policy "public reads settings" on site_settings for select using (true);
create policy "admin all" on projects for all using (is_admin()) with check (is_admin());
create policy "admin all" on case_studies for all using (is_admin()) with check (is_admin());
create policy "admin all" on reviews for all using (is_admin()) with check (is_admin());
create policy "admin all" on inquiries for all using (is_admin()) with check (is_admin());
create policy "admin all" on site_settings for all using (is_admin()) with check (is_admin());
-- No anon INSERT policies on reviews/inquiries: submissions go through a server
-- route (rate limit + validation + honeypot/Turnstile) using the service role key.

-- Keep private email out of public reads (column-level privileges)
revoke select on reviews from anon;
grant select (id, customer_name, company_name, rating, service, review_title, review_text,
              avatar_url, status, featured, created_at, published_at) on reviews to anon;

-- Storage: public-read bucket, admin-only writes. Review avatars are uploaded
-- via the server route (type/size checked) into 'review-avatars'.
insert into storage.buckets (id, name, public) values
 ('media', 'media', true), ('review-avatars', 'review-avatars', true);
create policy "public read media" on storage.objects for select using (bucket_id in ('media','review-avatars'));
create policy "admin write media" on storage.objects for all
  using (bucket_id='media' and is_admin()) with check (bucket_id='media' and is_admin());
create policy "admin manage avatars" on storage.objects for all
  using (bucket_id='review-avatars' and is_admin()) with check (bucket_id='review-avatars' and is_admin());
