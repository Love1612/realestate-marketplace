create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'renter' check (role in ('renter','owner','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  property_type text not null,
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  monthly_rent numeric not null check (monthly_rent >= 0),
  bedrooms numeric not null default 0,
  bathrooms numeric not null default 0,
  available_on date,
  status text not null default 'pending_payment' check (status in ('pending_payment','live','expired','paused')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  renter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (renter_id, listing_id)
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.inquiries enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "public read live listings" on public.listings;
create policy "public read live listings" on public.listings for select using ((status='live' and expires_at > now()) or auth.uid() = owner_id);
drop policy if exists "owner insert listings" on public.listings;
create policy "owner insert listings" on public.listings for insert with check (auth.uid() = owner_id);
drop policy if exists "owner update listings" on public.listings;
create policy "owner update listings" on public.listings for update using (auth.uid() = owner_id);
drop policy if exists "owner delete listings" on public.listings;
create policy "owner delete listings" on public.listings for delete using (auth.uid() = owner_id);

drop policy if exists "public read photos for visible listings" on public.listing_photos;
create policy "public read photos for visible listings" on public.listing_photos for select using (
  exists (select 1 from public.listings l where l.id=listing_id and ((l.status='live' and l.expires_at > now()) or l.owner_id=auth.uid()))
);
drop policy if exists "owner insert photos" on public.listing_photos;
create policy "owner insert photos" on public.listing_photos for insert with check (
  exists (select 1 from public.listings l where l.id=listing_id and l.owner_id=auth.uid())
);
drop policy if exists "owner update photos" on public.listing_photos;
create policy "owner update photos" on public.listing_photos for update using (
  exists (select 1 from public.listings l where l.id=listing_id and l.owner_id=auth.uid())
);
drop policy if exists "owner delete photos" on public.listing_photos;
create policy "owner delete photos" on public.listing_photos for delete using (
  exists (select 1 from public.listings l where l.id=listing_id and l.owner_id=auth.uid())
);

drop policy if exists "renter insert inquiries" on public.inquiries;
create policy "renter insert inquiries" on public.inquiries for insert with check (auth.uid()=renter_id);
drop policy if exists "participants read inquiries" on public.inquiries;
create policy "participants read inquiries" on public.inquiries for select using (
  auth.uid()=renter_id or exists(select 1 from public.listings l where l.id=listing_id and l.owner_id=auth.uid())
);

drop policy if exists "renter manage favorites" on public.favorites;
create policy "renter manage favorites" on public.favorites for all using (auth.uid()=renter_id) with check (auth.uid()=renter_id);

insert into storage.buckets (id,name,public) values ('listing-photos','listing-photos',true) on conflict (id) do nothing;

drop policy if exists "public view listing photos" on storage.objects;
create policy "public view listing photos" on storage.objects for select using (bucket_id='listing-photos');

drop policy if exists "owners upload listing photos" on storage.objects;
create policy "owners upload listing photos" on storage.objects for insert with check (
  bucket_id='listing-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "owners delete listing photos" on storage.objects;
create policy "owners delete listing photos" on storage.objects for delete using (
  bucket_id='listing-photos' and auth.uid()::text = (storage.foldername(name))[1]
);
create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);
alter table public.listing_reports enable row level security;
drop policy if exists "users create reports" on public.listing_reports;
create policy "users create reports" on public.listing_reports for insert with check (auth.uid()=reporter_id);
drop policy if exists "users read own reports" on public.listing_reports;
create policy "users read own reports" on public.listing_reports for select using (auth.uid()=reporter_id);

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('facebook','linkedin','x')),
  external_account_id text not null,
  account_name text not null default '',
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, provider)
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  connection_id uuid not null references public.social_connections(id) on delete cascade,
  provider text not null check (provider in ('facebook','linkedin','x')),
  post_text text not null,
  external_post_id text,
  status text not null check (status in ('published','failed')),
  error_message text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.social_connections enable row level security;
alter table public.social_posts enable row level security;
drop policy if exists "owners manage social connections" on public.social_connections;
create policy "owners manage social connections" on public.social_connections for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists "owners read social posts" on public.social_posts;
create policy "owners read social posts" on public.social_posts for select using (auth.uid()=owner_id);
drop policy if exists "owners create social posts" on public.social_posts;
create policy "owners create social posts" on public.social_posts for insert with check (auth.uid()=owner_id);

-- Two-way messaging
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  renter_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(listing_id,renter_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations" on public.conversations for select using (auth.uid()=renter_id or auth.uid()=owner_id);
drop policy if exists "renters create conversations" on public.conversations;
create policy "renters create conversations" on public.conversations for insert with check (auth.uid()=renter_id);
drop policy if exists "participants update conversations" on public.conversations;
create policy "participants update conversations" on public.conversations for update using (auth.uid()=renter_id or auth.uid()=owner_id);
drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages for select using (exists(select 1 from public.conversations c where c.id=conversation_id and (c.renter_id=auth.uid() or c.owner_id=auth.uid())));
drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages for insert with check (auth.uid()=sender_id and exists(select 1 from public.conversations c where c.id=conversation_id and (c.renter_id=auth.uid() or c.owner_id=auth.uid())));
drop policy if exists "recipients mark messages read" on public.messages;
create policy "recipients mark messages read" on public.messages for update using (exists(select 1 from public.conversations c where c.id=conversation_id and (c.renter_id=auth.uid() or c.owner_id=auth.uid())));

-- In-app notification queue; an email connector can process these without exposing credentials to clients.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists "users read notifications" on public.notifications;
create policy "users read notifications" on public.notifications for select using (auth.uid()=user_id);
drop policy if exists "users mark notifications" on public.notifications;
create policy "users mark notifications" on public.notifications for update using (auth.uid()=user_id);

create index if not exists conversations_renter_idx on public.conversations(renter_id,updated_at desc);
create index if not exists conversations_owner_idx on public.conversations(owner_id,updated_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id,created_at);
create index if not exists notifications_user_idx on public.notifications(user_id,created_at desc);

-- Stripe webhook idempotency: Stripe may retry the same event.
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- Keep storage uploads tied to an actual listing owned by the signed-in user.
drop policy if exists "owners upload listing photos" on storage.objects;
create policy "owners upload listing photos" on storage.objects for insert with check (
  bucket_id='listing-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[2]
      and l.owner_id = auth.uid()
  )
);
