
-- Fix 1: Knowledge storage bucket - add ownership-based access control
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload knowledge files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read knowledge files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete knowledge files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update knowledge files" ON storage.objects;

-- Create ownership-based policies (user ID is first folder segment)
CREATE POLICY "Users upload own knowledge files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'knowledge' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own or privileged knowledge files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'knowledge' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    has_role(auth.uid(), 'diretoria') OR
    has_role(auth.uid(), 'pmo')
  )
);

CREATE POLICY "Users delete own or privileged knowledge files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'knowledge' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    has_role(auth.uid(), 'diretoria') OR
    has_role(auth.uid(), 'pmo')
  )
);

CREATE POLICY "Users update own or privileged knowledge files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'knowledge' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    has_role(auth.uid(), 'diretoria') OR
    has_role(auth.uid(), 'pmo')
  )
);

-- Fix 2: notification_deliveries - restrict to own notifications
DROP POLICY IF EXISTS "Users read own deliveries" ON public.notification_deliveries;

CREATE POLICY "Users read own deliveries"
ON public.notification_deliveries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.id = notification_deliveries.notification_id
    AND n.recipient_user_id = auth.uid()
  )
);

-- Fix 3: audit_events - restrict insert to own user and current timestamp
DROP POLICY IF EXISTS "System insert audit" ON public.audit_events;

CREATE POLICY "Validated audit insert"
ON public.audit_events
FOR INSERT TO authenticated
WITH CHECK (
  actor_user_id = auth.uid() AND
  timestamp >= (now() - interval '5 seconds') AND
  timestamp <= (now() + interval '5 seconds')
);
