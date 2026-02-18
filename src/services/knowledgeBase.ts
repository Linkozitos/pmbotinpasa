import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeDocument {
  id: string;
  title: string;
  folder: string | null;
  type: string;
  status: string;
  confidentiality_level: string;
  created_at: string;
  updated_at: string;
  owner_user_id: string | null;
  tags: { id: string; name: string }[];
  latest_version?: {
    id: string;
    storage_uri: string | null;
    mime_type: string | null;
    size_bytes: number | null;
    version_number: number;
    created_at: string;
  };
}

export interface ListDocumentsParams {
  search?: string;
  folder?: string;
}

export async function listDocuments({ search, folder }: ListDocumentsParams = {}): Promise<KnowledgeDocument[]> {
  // Fetch knowledge items
  let query = supabase
    .from('knowledge_items')
    .select('*')
    .is('deleted_at', null)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  if (folder) {
    query = query.eq('folder', folder);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: items, error } = await query;
  if (error) throw error;
  if (!items || items.length === 0) return [];

  const itemIds = items.map(i => i.id);

  // Fetch latest versions
  const { data: versions } = await supabase
    .from('knowledge_item_versions')
    .select('*')
    .in('knowledge_item_id', itemIds)
    .order('version_number', { ascending: false });

  // Fetch tags
  const { data: itemTags } = await supabase
    .from('knowledge_item_tags')
    .select('knowledge_item_id, tag_id')
    .in('knowledge_item_id', itemIds);

  const tagIds = [...new Set((itemTags || []).map(it => it.tag_id))];
  const { data: tags } = tagIds.length > 0
    ? await supabase.from('knowledge_tags').select('*').in('id', tagIds)
    : { data: [] };

  const tagsMap = new Map((tags || []).map(t => [t.id, t]));

  // If searching by tag name, also include matching items
  let tagMatchIds: string[] = [];
  if (search) {
    const { data: matchingTags } = await supabase
      .from('knowledge_tags')
      .select('id')
      .ilike('name', `%${search}%`);
    
    if (matchingTags && matchingTags.length > 0) {
      const { data: tagItems } = await supabase
        .from('knowledge_item_tags')
        .select('knowledge_item_id')
        .in('tag_id', matchingTags.map(t => t.id));
      tagMatchIds = (tagItems || []).map(ti => ti.knowledge_item_id);
    }
  }

  // Build result
  const result: KnowledgeDocument[] = items.map(item => {
    const latestVersion = (versions || []).find(v => v.knowledge_item_id === item.id);
    const itemTagIds = (itemTags || []).filter(it => it.knowledge_item_id === item.id);
    const docTags = itemTagIds.map(it => tagsMap.get(it.tag_id)).filter(Boolean) as { id: string; name: string }[];

    return {
      id: item.id,
      title: item.title,
      folder: item.folder,
      type: item.type,
      status: item.status,
      confidentiality_level: item.confidentiality_level,
      created_at: item.created_at,
      updated_at: item.updated_at,
      owner_user_id: item.owner_user_id,
      tags: docTags,
      latest_version: latestVersion ? {
        id: latestVersion.id,
        storage_uri: latestVersion.storage_uri,
        mime_type: latestVersion.mime_type,
        size_bytes: latestVersion.size_bytes,
        version_number: latestVersion.version_number,
        created_at: latestVersion.created_at,
      } : undefined,
    };
  });

  // If we have tag search matches, fetch those items too (that weren't already in title search)
  if (search && tagMatchIds.length > 0) {
    const existingIds = new Set(result.map(r => r.id));
    const missingIds = tagMatchIds.filter(id => !existingIds.has(id));
    
    if (missingIds.length > 0) {
      const { data: extraItems } = await supabase
        .from('knowledge_items')
        .select('*')
        .in('id', missingIds)
        .is('deleted_at', null)
        .eq('status', 'active');
      
      if (extraItems) {
        for (const item of extraItems) {
          if (folder && item.folder !== folder) continue;
          const latestVersion = (versions || []).find(v => v.knowledge_item_id === item.id);
          const itemTagIds2 = (itemTags || []).filter(it => it.knowledge_item_id === item.id);
          const docTags2 = itemTagIds2.map(it => tagsMap.get(it.tag_id)).filter(Boolean) as { id: string; name: string }[];
          result.push({
            id: item.id, title: item.title, folder: item.folder, type: item.type,
            status: item.status, confidentiality_level: item.confidentiality_level,
            created_at: item.created_at, updated_at: item.updated_at,
            owner_user_id: item.owner_user_id, tags: docTags2,
            latest_version: latestVersion ? {
              id: latestVersion.id, storage_uri: latestVersion.storage_uri,
              mime_type: latestVersion.mime_type, size_bytes: latestVersion.size_bytes,
              version_number: latestVersion.version_number, created_at: latestVersion.created_at,
            } : undefined,
          });
        }
      }
    }
  }

  return result;
}

export async function uploadDocument(
  file: File,
  metadata: {
    title: string;
    folder: string;
    confidentiality_level: string;
    tags: string[]; // tag names
  }
) {
  // 1. Get current user for ownership-based storage path
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 2. Upload file to storage (user ID as first folder for RLS)
  const filePath = `${user.id}/${crypto.randomUUID()}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('knowledge')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Determine knowledge type from mime
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    pdf: 'file', docx: 'file', xlsx: 'file', pptx: 'file',
    csv: 'file', txt: 'file', json: 'file',
  };
  const knowledgeType = typeMap[ext] || 'file';

  // 3. Create knowledge_item
  const { data: item, error: itemError } = await supabase
    .from('knowledge_items')
    .insert({
      title: metadata.title,
      folder: metadata.folder,
      confidentiality_level: metadata.confidentiality_level as any,
      type: knowledgeType as any,
      status: 'active',
    })
    .select()
    .single();

  if (itemError) throw itemError;

  // 4. Create version
  const { error: versionError } = await supabase
    .from('knowledge_item_versions')
    .insert({
      knowledge_item_id: item.id,
      storage_uri: filePath,
      mime_type: file.type || `application/${ext}`,
      size_bytes: file.size,
      version_number: 1,
    });

  if (versionError) throw versionError;

  // 5. Handle tags
  for (const tagName of metadata.tags) {
    // Find or create tag
    let { data: existingTag } = await supabase
      .from('knowledge_tags')
      .select('id')
      .eq('name', tagName)
      .maybeSingle();

    let tagId: string;
    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag, error: tagError } = await supabase
        .from('knowledge_tags')
        .insert({ name: tagName })
        .select()
        .single();
      if (tagError) throw tagError;
      tagId = newTag.id;
    }

    await supabase
      .from('knowledge_item_tags')
      .insert({ knowledge_item_id: item.id, tag_id: tagId });
  }

  return item;
}

export async function getDocumentById(id: string): Promise<KnowledgeDocument | null> {
  const { data: item, error } = await supabase
    .from('knowledge_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) return null;

  const { data: versions } = await supabase
    .from('knowledge_item_versions')
    .select('*')
    .eq('knowledge_item_id', id)
    .order('version_number', { ascending: false })
    .limit(1);

  const { data: itemTags } = await supabase
    .from('knowledge_item_tags')
    .select('tag_id')
    .eq('knowledge_item_id', id);

  const tagIds = (itemTags || []).map(it => it.tag_id);
  const { data: tags } = tagIds.length > 0
    ? await supabase.from('knowledge_tags').select('*').in('id', tagIds)
    : { data: [] };

  const latestVersion = versions?.[0];

  return {
    id: item.id, title: item.title, folder: item.folder,
    type: item.type, status: item.status,
    confidentiality_level: item.confidentiality_level,
    created_at: item.created_at, updated_at: item.updated_at,
    owner_user_id: item.owner_user_id,
    tags: (tags || []).map(t => ({ id: t.id, name: t.name })),
    latest_version: latestVersion ? {
      id: latestVersion.id, storage_uri: latestVersion.storage_uri,
      mime_type: latestVersion.mime_type, size_bytes: latestVersion.size_bytes,
      version_number: latestVersion.version_number, created_at: latestVersion.created_at,
    } : undefined,
  };
}

export async function updateDocument(id: string, patch: {
  title?: string;
  folder?: string;
  confidentiality_level?: string;
  tags?: string[];
}) {
  const updateData: Record<string, any> = {};
  if (patch.title !== undefined) updateData.title = patch.title;
  if (patch.folder !== undefined) updateData.folder = patch.folder;
  if (patch.confidentiality_level !== undefined) updateData.confidentiality_level = patch.confidentiality_level;

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('knowledge_items')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }

  if (patch.tags !== undefined) {
    // Remove old tags
    await supabase.from('knowledge_item_tags').delete().eq('knowledge_item_id', id);

    // Add new tags
    for (const tagName of patch.tags) {
      let { data: existingTag } = await supabase
        .from('knowledge_tags')
        .select('id')
        .eq('name', tagName)
        .maybeSingle();

      let tagId: string;
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        const { data: newTag, error: tagError } = await supabase
          .from('knowledge_tags')
          .insert({ name: tagName })
          .select()
          .single();
        if (tagError) throw tagError;
        tagId = newTag.id;
      }

      await supabase
        .from('knowledge_item_tags')
        .insert({ knowledge_item_id: id, tag_id: tagId });
    }
  }
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('knowledge_items')
    .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
    .eq('id', id);
  if (error) throw error;
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('knowledge')
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function listFolders(): Promise<{ name: string; count: number }[]> {
  const { data, error } = await supabase
    .from('knowledge_items')
    .select('folder')
    .is('deleted_at', null)
    .eq('status', 'active');

  if (error) throw error;

  const counts = new Map<string, number>();
  (data || []).forEach(item => {
    const f = item.folder || 'Sem pasta';
    counts.set(f, (counts.get(f) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAllTags(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('knowledge_tags')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
