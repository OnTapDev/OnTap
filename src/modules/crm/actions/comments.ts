"use server";

import { createClient } from "@/core/db/server";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getComments(entityType: "contact" | "event", entityId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data || [];
}

export async function createComment(
  entityType: "contact" | "event",
  entityId: string,
  content: string,
  activityType: "note" | "call" | "email" | "meeting" | "task" | "follow_up" = "note"
) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();

  const { data: userRecord } = await supabase
    .from("users")
    .select("org_id")
    .eq("clerk_id", user.id)
    .maybeSingle();

  if (!userRecord?.org_id) throw new Error("No organization found");

  const { error } = await supabase.from("comments").insert({
    org_id: userRecord.org_id,
    entity_type: entityType,
    entity_id: entityId,
    author_id: user.id,
    author_name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses?.[0]?.emailAddress || "Unknown",
    content,
    activity_type: activityType,
  });

  if (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }

  if (activityType === "follow_up") {
    try {
      await supabase.from("notifications").insert({
        org_id: userRecord.org_id,
        user_id: user.id,
        title: `Follow-up: ${content.length > 60 ? content.slice(0, 60) + "..." : content}`,
        message: entityType === "contact" ? "Follow up on this contact" : "Follow up on this event",
        type: "follow_up",
        related_entity_type: entityType,
        related_entity_id: entityId,
      });
    } catch (e) {
      console.error("Failed to create notification:", e);
    }
  }

  const path = entityType === "contact" ? "/crm" : "/events";
  revalidatePath(path);
}

export async function deleteComment(commentId: string, entityType: "contact" | "event") {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }

  const path = entityType === "contact" ? "/crm" : "/events";
  revalidatePath(path);
}
