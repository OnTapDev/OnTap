"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Trash2, Loader2, Clock } from "lucide-react";
import { getComments, createComment, deleteComment } from "@/modules/crm/actions/comments";
import { Button } from "@/ui/primitives";

type Comment = {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  created_at: string;
};

type Props = {
  entityType: "contact" | "event";
  entityId: string;
};

export function CommentsSection({ entityType, entityId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
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
      await createComment(entityType, entityId, content);
      setNewContent("");
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

  return (
    <div>
      <p className="text-xs text-warm-sand font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" />
        Comments &amp; Memos
        {comments.length > 0 && <span className="text-warm-sand/60">({comments.length})</span>}
      </p>

      <div className="flex gap-2 mb-4">
        <textarea
          ref={inputRef}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment or memo... (Enter to send, Shift+Enter for new line)"
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
        <p className="text-sm text-warm-sand/60 text-center py-4">No comments yet</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-olive-gold">{comment.author_name}</span>
                    <span className="text-[10px] text-warm-sand/50 flex items-center gap-1">
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
                  className="p-1 text-warm-sand/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  title="Delete comment"
                >
                  {deletingId === comment.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
