-- Create the 'ontap' storage bucket for logos, documents, and gallery images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ontap', 'ontap', true, 52428800, [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
])
on conflict (id) do nothing;
