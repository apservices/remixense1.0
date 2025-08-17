-- Buckets
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('audio-files','audio-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('tracks','tracks', false)
on conflict (id) do nothing;

-- Storage policies
-- AVATARS: public read, owner write
create policy if not exists "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy if not exists "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- AUDIO-FILES: private per user folder
create policy if not exists "Users can read own audio files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can upload audio files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update own audio files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete own audio files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'audio-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- TRACKS bucket: private per user folder
create policy if not exists "Users can read own tracks files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can upload tracks files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update own tracks files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete own tracks files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]
  );