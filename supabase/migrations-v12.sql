-- RentHub v12 migration: marketplace, portfolios, communities, alerts, tours, analytics and syndication.
create extension if not exists "pgcrypto";

alter table public.listings add column if not exists plan text not null default 'basic';
alter table public.listings add column if not exists community_id uuid;
alter table public.listings add column if not exists unit_id uuid;
alter table public.listings add column if not exists total_monthly_fees numeric not null default 0;
alter table public.listings add column if not exists security_deposit numeric not null default 0;
alter table public.listings add column if not exists pets_allowed boolean not null default false;
alter table public.listings add column if not exists parking text default '';
alter table public.listings add column if not exists amenities text[] not null default '{}';
alter table public.listings add column if not exists last_confirmed_at timestamptz;
alter table public.listings add column if not exists verification_status text not null default 'unverified';
alter table public.listings add column if not exists featured_until timestamptz;

create table if not exists public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null, created_by uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now()
);
create table if not exists public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
 role text not null default 'member' check(role in ('owner','manager','member')), created_at timestamptz not null default now(), primary key(organization_id,user_id)
);
create table if not exists public.organization_billing (
 organization_id uuid primary key references public.organizations(id) on delete cascade, tier text not null default '10' check(tier in ('10','25','50','100','250','500+')),
 stripe_customer_id text, stripe_subscription_id text, active_listings_limit integer not null default 10, status text not null default 'inactive', current_period_end timestamptz, updated_at timestamptz not null default now()
);
create table if not exists public.communities (
 id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete set null, owner_id uuid not null references public.profiles(id) on delete cascade,
 name text not null, address text not null, city text not null, state text not null, zip text not null, total_units integer not null default 0, description text default '', latitude double precision, longitude double precision, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.units (
 id uuid primary key default gen_random_uuid(), community_id uuid not null references public.communities(id) on delete cascade, unit_number text not null,
 bedrooms numeric not null default 0, bathrooms numeric not null default 0, monthly_rent numeric not null default 0, available_on date, status text not null default 'available' check(status in ('available','occupied','hold','maintenance')),
 amenities text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(community_id,unit_number)
);

alter table public.listings add constraint listings_community_fk foreign key (community_id) references public.communities(id) on delete set null;
alter table public.listings add constraint listings_unit_fk foreign key (unit_id) references public.units(id) on delete set null;

create table if not exists public.saved_searches (
 id uuid primary key default gen_random_uuid(), renter_id uuid not null references public.profiles(id) on delete cascade, name text not null default 'My rental search', query text default '', city text default '', state text default '', max_rent numeric, min_bedrooms numeric, property_type text, move_in_date date, radius_miles numeric, alerts_enabled boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.saved_search_matches (
 saved_search_id uuid not null references public.saved_searches(id) on delete cascade, listing_id uuid not null references public.listings(id) on delete cascade, matched_at timestamptz not null default now(), primary key(saved_search_id,listing_id)
);
create table if not exists public.tours (
 id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id) on delete cascade, renter_id uuid not null references public.profiles(id) on delete cascade,
 owner_id uuid not null references public.profiles(id) on delete cascade, requested_start timestamptz not null, requested_end timestamptz not null, mode text not null default 'in_person' check(mode in ('in_person','video')), note text default '', status text not null default 'requested' check(status in ('requested','confirmed','declined','cancelled','completed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.listing_views (
 id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id) on delete cascade, viewer_id uuid references public.profiles(id) on delete set null, session_id text, viewed_at timestamptz not null default now()
);
create table if not exists public.listing_feed_exports (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade, organization_id uuid references public.organizations(id) on delete cascade,
 provider text not null, endpoint_url text, status text not null default 'ready', last_exported_at timestamptz, created_at timestamptz not null default now()
);

alter table public.organizations enable row level security; alter table public.organization_members enable row level security; alter table public.organization_billing enable row level security;
alter table public.communities enable row level security; alter table public.units enable row level security; alter table public.saved_searches enable row level security; alter table public.saved_search_matches enable row level security; alter table public.tours enable row level security; alter table public.listing_views enable row level security; alter table public.listing_feed_exports enable row level security;

create or replace function public.is_org_member(org uuid) returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=auth.uid()); $$;
create or replace function public.is_org_manager(org uuid) returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=auth.uid() and m.role in ('owner','manager')); $$;

create policy "org members read" on public.organizations for select using (public.is_org_member(id) or created_by=auth.uid());
create policy "users create org" on public.organizations for insert with check (created_by=auth.uid());
create policy "org owners update" on public.organizations for update using (exists(select 1 from public.organization_members m where m.organization_id=id and m.user_id=auth.uid() and m.role='owner'));
create policy "members read memberships" on public.organization_members for select using (user_id=auth.uid() or public.is_org_member(organization_id));
create policy "org owner manage memberships" on public.organization_members for all using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id) or user_id=auth.uid());
create policy "billing members read" on public.organization_billing for select using (public.is_org_member(organization_id));
create policy "billing managers update" on public.organization_billing for all using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "community members manage" on public.communities for all using (owner_id=auth.uid() or (organization_id is not null and public.is_org_manager(organization_id))) with check (owner_id=auth.uid() or (organization_id is not null and public.is_org_manager(organization_id)));
create policy "public read communities" on public.communities for select using (true);
create policy "community units read" on public.units for select using (true);
create policy "community units manage" on public.units for all using (exists(select 1 from public.communities c where c.id=community_id and (c.owner_id=auth.uid() or (c.organization_id is not null and public.is_org_manager(c.organization_id))))) with check (exists(select 1 from public.communities c where c.id=community_id and (c.owner_id=auth.uid() or (c.organization_id is not null and public.is_org_manager(c.organization_id)))));
create policy "saved searches own" on public.saved_searches for all using (renter_id=auth.uid()) with check (renter_id=auth.uid());
create policy "saved matches own" on public.saved_search_matches for select using (exists(select 1 from public.saved_searches s where s.id=saved_search_id and s.renter_id=auth.uid()));
create policy "tour participants read" on public.tours for select using (renter_id=auth.uid() or owner_id=auth.uid());
create policy "renters request tours" on public.tours for insert with check (renter_id=auth.uid());
create policy "tour participants update" on public.tours for update using (renter_id=auth.uid() or owner_id=auth.uid());
create policy "listing view insert" on public.listing_views for insert with check (true);
create policy "owners read listing views" on public.listing_views for select using (exists(select 1 from public.listings l where l.id=listing_id and l.owner_id=auth.uid()));
create policy "owners read feed exports" on public.listing_feed_exports for select using (owner_id=auth.uid());
create policy "owners manage feed exports" on public.listing_feed_exports for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create index if not exists listings_search_idx on public.listings(status,city,state,property_type,monthly_rent,bedrooms);
create index if not exists listings_freshness_idx on public.listings(last_confirmed_at desc);
create index if not exists saved_searches_alert_idx on public.saved_searches(alerts_enabled,renter_id);
create index if not exists tours_owner_idx on public.tours(owner_id,status,requested_start);
create index if not exists listing_views_listing_idx on public.listing_views(listing_id,viewed_at desc);

-- Existing owner gets a one-person organization only when the app creates one; no automatic migration is required.
