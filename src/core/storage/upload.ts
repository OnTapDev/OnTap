"use server";

import { createServerClient } from "@supabase/ssr";
import { randomUUID } from "crypto";

export async function uploadLogo(orgId: string, base64Data: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const base64Metadata = base64Data.match(/^data:([^/]+);base64,(.+)$/);
  if (!base64Metadata) {
    throw new Error("Invalid base64 data");
  }

  const mimeType = base64Metadata[1];
  const extension = mimeType.split("/")[1];
  const buffer = Buffer.from(base64Metadata[2], "base64");

  const secretId = randomUUID();
  const fileName = `logos/${orgId}/${secretId}.${extension}`;
  const filePath = `public/${fileName}`;

  const { error } = await supabase.storage
    .from("ontap")
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error("Error uploading logo:", error);
    throw new Error("Failed to upload logo");
  }

  const { data: publicUrlData } = supabase.storage
    .from("ontap")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function deleteLogo(orgId: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const filePath = `logos/${orgId}/logo`;

  const { error } = await supabase.storage
    .from("ontap")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting logo:", error);
  }
}

export async function uploadDocument(orgId: string, base64Data: string, fileName: string, docType: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const base64Metadata = base64Data.match(/^data:([^/]+);base64,(.+)$/);
  if (!base64Metadata) {
    throw new Error("Invalid base64 data");
  }

  const mimeType = base64Metadata[1];
  const extension = fileName.split(".").pop() || "pdf";
  const buffer = Buffer.from(base64Metadata[2], "base64");

  const secretId = randomUUID();
  const path = `documents/${orgId}/${docType}_${secretId}.${extension}`;
  const filePath = `public/${path}`;

  const { error } = await supabase.storage
    .from("ontap")
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }

  const { data: publicUrlData } = supabase.storage
    .from("ontap")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function deleteDocument(fileUrl: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const urlParts = fileUrl.split("/");
  const fileName = urlParts.slice(-2).join("/");

  const { error } = await supabase.storage
    .from("ontap")
    .remove([`public/${fileName}`]);

  if (error) {
    console.error("Error deleting document:", error);
  }
}

export async function uploadFile(orgId: string, base64Data: string, fileName: string, folder: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const base64Metadata = base64Data.match(/^data:([^/]+);base64,(.+)$/);
  if (!base64Metadata) {
    throw new Error("Invalid base64 data");
  }

  const mimeType = base64Metadata[1];
  const extension = fileName.split(".").pop() || "jpg";
  const buffer = Buffer.from(base64Metadata[2], "base64");

  const secretId = randomUUID();
  const path = `${folder}/${orgId}/${secretId}.${extension}`;
  const filePath = `public/${path}`;

  const { error } = await supabase.storage
    .from("ontap")
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error(`Error uploading ${folder} file:`, error);
    throw new Error("Failed to upload file");
  }

  const { data: publicUrlData } = supabase.storage
    .from("ontap")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function deleteFile(fileUrl: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const urlParts = fileUrl.split("/");
  const path = urlParts.slice(-2).join("/");

  const { error } = await supabase.storage
    .from("ontap")
    .remove([`public/${path}`]);

  if (error) {
    console.error("Error deleting file:", error);
  }
}

export async function getSignedDocumentUrl(fileUrl: string, expiresIn: number = 300) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const urlParts = fileUrl.split("/");
  const path = urlParts.slice(-2).join("/");

  const { data, error } = await supabase.storage
    .from("ontap")
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Error creating signed URL:", error);
    return fileUrl;
  }

  return data.signedUrl;
}