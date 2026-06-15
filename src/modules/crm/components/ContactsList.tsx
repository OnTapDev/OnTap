"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { PipelineView } from "./PipelineView";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  source: string | null;
  notes: string | null;
  tags: string[];
  stage_id: string | null;
  created_at: string;
  stage: { id: string; name: string; color: string } | null;
};

type Stage = {
  id: string;
  name: string;
  color: string;
  order: number;
};

interface ContactsListProps {
  contacts: Contact[];
  stages: Stage[];
}

type ViewMode = "list" | "pipeline";

export function ContactsList({ contacts, stages }: ContactsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-olive-gold text-charcoal"
              : "text-warm-sand hover:text-warm-white"
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode("pipeline")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "pipeline"
              ? "bg-olive-gold text-charcoal"
              : "text-warm-sand hover:text-warm-white"
          }`}
        >
          Pipeline View
        </button>
      </div>

      {viewMode === "list" ? (
        <div className="bg-charcoal border border-warm-sand/20 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-warm-sand/20">
                <th className="text-left p-4 text-sm font-medium text-warm-sand">Name</th>
                <th className="text-left p-4 text-sm font-medium text-warm-sand">Company</th>
                <th className="text-left p-4 text-sm font-medium text-warm-sand">Stage</th>
                <th className="text-left p-4 text-sm font-medium text-warm-sand">Source</th>
                <th className="text-left p-4 text-sm font-medium text-warm-sand">Created</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-warm-sand">
                    No contacts yet. Add your first contact to get started.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-warm-sand/10 hover:bg-warm-sand/5 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-warm-white font-medium">{contact.name}</p>
                        <p className="text-sm text-warm-sand">{contact.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-warm-white">{contact.company || "-"}</td>
                    <td className="p-4">
                      {contact.stage ? (
                        <span
                          className="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${contact.stage.color}20`,
                            color: contact.stage.color,
                          }}
                        >
                          {contact.stage.name}
                        </span>
                      ) : (
                        <span className="text-warm-sand">-</span>
                      )}
                    </td>
                    <td className="p-4 text-warm-sand">{contact.source || "-"}</td>
                    <td className="p-4 text-warm-sand">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button className="p-2 text-warm-sand hover:text-warm-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <PipelineView contacts={contacts} stages={stages} />
      )}
    </div>
  );
}
