"use server";

import { createClient } from "@/core/db/server";
import { currentUser } from "@clerk/nextjs/server";

export async function getNotifications() {
  const supabase = await createClient();
  const user = await currentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data || [];
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const user = await currentUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error counting notifications:", error);
    return 0;
  }

  return count || 0;
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const user = await currentUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const user = await currentUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
}

export async function createNotification(
  orgId: string,
  userId: string,
  title: string,
  message?: string,
  type?: string,
  relatedEntityType?: string,
  relatedEntityId?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    org_id: orgId,
    user_id: userId,
    title,
    message: message || null,
    type: type || "info",
    related_entity_type: relatedEntityType || null,
    related_entity_id: relatedEntityId || null,
  });

  if (error) {
    console.error("Error creating notification:", error);
  }
}
