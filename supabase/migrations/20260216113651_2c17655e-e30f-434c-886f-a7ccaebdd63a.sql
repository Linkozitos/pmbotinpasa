
-- Allow privileged users to manage knowledge_tags
CREATE POLICY "Privileged manage knowledge_tags"
ON public.knowledge_tags FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role))
WITH CHECK (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role));

-- Allow privileged users to manage knowledge_item_tags
CREATE POLICY "Privileged manage knowledge_item_tags"
ON public.knowledge_item_tags FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR (EXISTS (SELECT 1 FROM knowledge_items ki WHERE ki.id = knowledge_item_id AND ki.owner_user_id = auth.uid())))
WITH CHECK (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR (EXISTS (SELECT 1 FROM knowledge_items ki WHERE ki.id = knowledge_item_id AND ki.owner_user_id = auth.uid())));

-- Allow privileged users to manage knowledge_item_versions
CREATE POLICY "Privileged manage knowledge_item_versions"
ON public.knowledge_item_versions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR (EXISTS (SELECT 1 FROM knowledge_items ki WHERE ki.id = knowledge_item_id AND ki.owner_user_id = auth.uid())))
WITH CHECK (has_role(auth.uid(), 'diretoria'::app_role) OR has_role(auth.uid(), 'pmo'::app_role) OR (EXISTS (SELECT 1 FROM knowledge_items ki WHERE ki.id = knowledge_item_id AND ki.owner_user_id = auth.uid())));
