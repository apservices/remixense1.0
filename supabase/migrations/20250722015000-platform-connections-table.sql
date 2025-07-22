
-- Create platform_connections table for OAuth tokens
create table if not exists platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null check (platform in ('dropbox', 'soundcloud', 'spotify')),
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone,
  account_info jsonb default '{}',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(user_id, platform)
);

-- Enable RLS
alter table platform_connections enable row level security;

-- Create policies
create policy "Users can view their own connections"
  on platform_connections for select
  using (auth.uid() = user_id);

create policy "Users can manage their own connections"
  on platform_connections for all
  using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger update_platform_connections_updated_at
  before update on platform_connections
  for each row
  execute function update_updated_at_column();
