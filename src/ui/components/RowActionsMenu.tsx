"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface RowActionsMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RowActionsMenu({ onEdit, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const itemCount = (onEdit ? 1 : 0) + (onDelete ? 1 : 0);

  const toggle = () => setOpen(o => !o);

  useLayoutEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!rect) return;

    const menuHeight = menu?.offsetHeight || itemCount * 44 + 4;
    const menuWidth = menu?.offsetWidth || 160;

    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuHeight - 4);
    }
    const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));

    setPos({ top, left });
  }, [open, itemCount]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        className="p-2 text-warm-sand hover:text-warm-white"
        title="Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 bg-charcoal border border-warm-sand/20 rounded-lg shadow-lg shadow-black/40 overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-warm-white hover:bg-warm-sand/10"
            >
              <Pencil className="w-4 h-4 text-warm-sand" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}
    </>
  );
}