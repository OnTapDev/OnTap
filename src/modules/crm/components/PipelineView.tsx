"use client";

import { MoreHorizontal } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
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

interface PipelineViewProps {
  contacts: Contact[];
  stages: Stage[];
}

export function PipelineView({ contacts, stages }: PipelineViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageContacts = contacts.filter(
          (c) => c.stage_id === stage.id || (!c.stage_id && stage.order === 0)
        );
        
        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-72 bg-charcoal border border-warm-sand/20 rounded-xl"
          >
            <div
              className="p-3 border-b border-warm-sand/20 rounded-t-xl"
              style={{ borderTopColor: stage.color, borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-warm-white">{stage.name}</h3>
                <span className="text-sm text-warm-sand bg-warm-sand/10 px-2 py-0.5 rounded-full">
                  {stageContacts.length}
                </span>
              </div>
            </div>
            
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {stageContacts.length === 0 ? (
                <p className="p-4 text-center text-sm text-warm-sand">
                  No contacts
                </p>
              ) : (
                stageContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 bg-charcoal border border-warm-sand/10 rounded-lg hover:border-warm-sand/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-warm-white font-medium text-sm">
                          {contact.name}
                        </p>
                        {contact.company && (
                          <p className="text-xs text-warm-sand mt-0.5">
                            {contact.company}
                          </p>
                        )}
                      </div>
                      <button className="text-warm-sand hover:text-warm-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    {contact.email && (
                      <p className="text-xs text-warm-sand mt-2 truncate">
                        {contact.email}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
