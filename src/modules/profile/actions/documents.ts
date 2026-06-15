"use server";

import { createClient } from "@/core/db/server";
import { revalidatePath } from "next/cache";
import { uploadDocument, deleteDocument, getSignedDocumentUrl } from "@/core/storage/upload";

export async function getDocuments(orgId: string, useSignedUrls: boolean = true) {
  const supabase = await createClient();
  
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  if (useSignedUrls && documents) {
    for (const doc of documents) {
      doc.file_url = await getSignedDocumentUrl(doc.file_url, 300);
    }
  }

  return documents || [];
}

export async function createDocument(orgId: string, doc: {
  name: string;
  type: string;
  file_data: string;
  file_name: string;
  expires_at?: string;
}) {
  const supabase = await createClient();
  
  let fileUrl: string;
  try {
    fileUrl = await uploadDocument(orgId, doc.file_data, doc.file_name, doc.type);
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      org_id: orgId,
      name: doc.name,
      type: doc.type,
      file_url: fileUrl,
      expires_at: doc.expires_at || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating document:", error);
    await deleteDocument(fileUrl);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return document;
}

export async function deleteDocumentRecord(id: string) {
  const supabase = await createClient();
  
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .single();

  if (fetchError || !doc) {
    console.error("Error fetching document:", fetchError);
    throw new Error("Document not found");
  }

  await deleteDocument(doc.file_url);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting document:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  return { success: true };
}