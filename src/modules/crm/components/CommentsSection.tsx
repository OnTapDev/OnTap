"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Trash2, Loader2, Clock, Phone, Mail, Calendar, CheckSquare, Bell, StickyNote } from "lucide-react";
import { getComments, createComment, deleteComment } from "@/modules/crm/actions/comments";
import { Button } from "@/ui/primitives";

type Comment = {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  activity_type: string;
  created_at: string;
};

type ActivityType = "note" | "call" | "email" | "meeting" | "task" | "follow_up";

type Props = {
  entityType: "contact" | "event";
  entityId: string;
};

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "note", label: "Note", icon: <StickyNote className="w-3.5 h-3.5" />, color: "text-warm-sand" },
  { value: "call", label: "Call", icon: <Phone className="w-3.5 h-3.5" />, color: "text-green-400" },
  { value: "email", label: "Email", icon: <Mail className="w-3.5 h-3.5" />, color: "text-blue-400" },
  { value: "meeting", label: "Meeting", icon: <Calendar className="w-3.5 h-3.5" />, color: "text-purple-400" },
  { value: "task", label: "Task", icon: <CheckSquare className="w-3.5 h-3.5" />, color: "text-orange-400" },
  { value: "follow_up", label: "Follow Up", icon: <Bell className="w-3.5 h-3.5" />, color: "text-yellow-400" },
];

const TYPE_LABELS: Record<string, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  task: "Task",
  follow_up: "Follow Up",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {};
for (const t of ACTIVITY_TYPES) {
  TYPE_ICONS[t.value] = t.icon;
}

const TYPE_COLORS: Record<string, string> = {};
for (const t of ACTIVITY_TYPES) {
  TYPE_COLORS[t.value] = t.color;
}

export function CommentsSection({ entityType, entityId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadComments = async () => {
    try {
      const data = await getComments(entityType, entityId);
      setComments(data);
    } catch (e) {
      console.error("Failed to load comments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [entityType, entityId]);

  const handleSubmit = async () => {
    const content = newContent.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      await createComment(entityType, entityId, content, activityType);
      setNewContent("");
      setActivityType("note");
      await loadComments();
      inputRef.current?.focus();
    } catch (e) {
      console.error("Failed to create comment:", e);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await deleteComment(commentId, entityType);
      await loadComments();
    } catch (e) {
      console.error("Failed to delete comment:", e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedType = ACTIVITY_TYPES.find((t) => t.value === activityType);

  return (
    <div>
      <p className="text-xs text-warm-sand font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" />
        Activity Log
        {comments.length > 0 && <span className="text-warm-sand/60">({comments.length})</span>}
      </p>

      <div className="flex gap-1 mb-3 flex-wrap">
        {ACTIVITY_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActivityType(t.value)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activityType === t.value
                ? "bg-olive-gold/20 text-olive-gold border border-olive-gold/30"
                : "text-warm-sand/70 hover:text-warm-white bg-warm-sand/5 hover:bg-warm-sand/10 border border-transparent"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <textarea
          ref={inputRef}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Log a ${selectedType?.label.toLowerCase()}... (Enter to save, Shift+Enter for new line)`}
          className="flex-1 bg-warm-sand/5 border border-warm-sand/20 rounded-lg px-3 py-2 text-sm text-warm-white placeholder-warm-sand/50 focus:outline-none focus:border-olive-gold resize-none"
          rows={2}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!newContent.trim() || sending}
          className="self-end"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-warm-sand animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-warm-sand/60 text-center py-4">No activity yet</p>
      ) : (
        <div className="relative pl-6 space-y-0">
          {comments.map((comment, idx) => (
            <div key={comment.id} className="relative pb-4 group">
              {idx < comments.length - 1 && (
                <div className="absolute left-0 top-3 bottom-0 w-px bg-warm-sand/10" />
              )}
              <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-charcoal border-2 border-warm-sand/20 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[comment.activity_type] || "text-warm-sand"}`} style={{ backgroundColor: "currentColor" }} />
              </div>

              <div className="ml-3 p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1 text-xs font-medium ${TYPE_COLORS[comment.activity_type] || "text-warm-sand"}`}>
                        {TYPE_ICONS[comment.activity_type]}
                        {TYPE_LABELS[comment.activity_type] || "Note"}
                      </span>
                      <span className="text-[10px] text-warm-sand/30">·</span>
                      <span className="text-xs font-medium text-olive-gold">{comment.author_name}</span>
                      <span className="text-[10px] text-warm-sand/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-warm-white whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="p-1 text-warm-sand/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    title="Delete"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
