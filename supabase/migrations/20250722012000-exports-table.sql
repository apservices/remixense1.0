-- Create exports table for tracking export history
create table if not exists exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  track_id uuid references tracks(id) on delete cascade not null,
  platform text not null check (platform in ('dropbox', 'soundcloud', 'spotify')),
  status text not null default 'pending' check (status in ('pending', 'uploading', 'success', 'error')),
  error_message text,
  external_id text, -- ID from external platform (if available)
  external_url text, -- URL to track on external platform
  metadata jsonb default '{}', -- Additional export metadata
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table exports enable row level security;

-- Create policies
create policy "Users can view their own exports"
  on exports for select
  using (auth.uid() = user_id);

create policy "Users can create their own exports"
  on exports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exports"
  on exports for update
  using (auth.uid() = user_id);

-- Create updated_at trigger
create trigger update_exports_updated_at
  before update on exports
  for each row
  execute function update_updated_at_column();