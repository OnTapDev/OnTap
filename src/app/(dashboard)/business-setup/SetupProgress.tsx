"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives";
import { Check, Circle } from "lucide-react";

type Progress = {
  insurance: {
    liquorLiability: boolean;
    generalLiability: boolean;
    commercialAuto: boolean;
  };
  formation: {
    entityType: string | null;
    registered: boolean;
    bankAccount: boolean;
  };
  permits: {
    liquorLicense: boolean;
    cateringPermit: boolean;
    businessLicense: boolean;
  };
};

type SetupProgressProps = {
  progress: Progress;
};

export function SetupProgress({ progress }: SetupProgressProps) {
  const [checked, setChecked] = useState(progress);
  const [saving, setSaving] = useState(false);

  const totalItems = 8;
  const completedItems = 
    (checked.insurance.liquorLiability ? 1 : 0) +
    (checked.insurance.generalLiability ? 1 : 0) +
    (checked.insurance.commercialAuto ? 1 : 0) +
    (checked.formation.entityType ? 1 : 0) +
    (checked.formation.registered ? 1 : 0) +
    (checked.formation.bankAccount ? 1 : 0) +
    (checked.permits.liquorLicense ? 1 : 0) +
    (checked.permits.cateringPermit ? 1 : 0) +
    (checked.permits.businessLicense ? 1 : 0);

  const percentage = Math.round((completedItems / totalItems) * 100);

  const handleToggle = async (section: keyof Progress, item: string) => {
    const newChecked = { ...checked };
    const sectionKey = section as keyof typeof checked;
    const itemKey = item as keyof typeof checked[typeof sectionKey];
    
    (newChecked[sectionKey] as Record<string, boolean>)[itemKey] = 
      !(newChecked[sectionKey] as Record<string, boolean>)[itemKey];
    
    setChecked(newChecked);
    
    // Save to server
    setSaving(true);
    try {
      await fetch("/api/setup-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, item, value: (newChecked[sectionKey] as Record<string, boolean>)[itemKey] }),
      });
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-charcoal border-warm-sand/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Setup Progress</span>
          {saving && <span className="text-xs text-warm-sand">Saving...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-warm-sand">Complete</span>
            <span className="text-olive-gold font-medium">{percentage}%</span>
          </div>
          <div className="h-2 bg-warm-sand/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-olive-gold transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ChecklistColumn 
            title="Insurance" 
            items={[
              { id: "liquorLiability", label: "Liquor Liability Insurance", checked: checked.insurance.liquorLiability, onToggle: () => handleToggle("insurance", "liquorLiability") },
              { id: "generalLiability", label: "General Liability Insurance", checked: checked.insurance.generalLiability, onToggle: () => handleToggle("insurance", "generalLiability") },
              { id: "commercialAuto", label: "Commercial Auto Insurance", note: "Optional but recommended", checked: checked.insurance.commercialAuto, onToggle: () => handleToggle("insurance", "commercialAuto") },
            ]} 
          />
          <ChecklistColumn 
            title="Formation" 
            items={[
              { id: "entityType", label: "Business Entity (LLC/Corp)", checked: checked.formation.entityType !== null, onToggle: () => handleToggle("formation", "entityType") },
              { id: "registered", label: "Registered with State", checked: checked.formation.registered, onToggle: () => handleToggle("formation", "registered") },
              { id: "bankAccount", label: "Business Bank Account", checked: checked.formation.bankAccount, onToggle: () => handleToggle("formation", "bankAccount") },
            ]} 
          />
          <ChecklistColumn 
            title="Permits" 
            items={[
              { id: "liquorLicense", label: "Liquor License/Permit", checked: checked.permits.liquorLicense, onToggle: () => handleToggle("permits", "liquorLicense") },
              { id: "cateringPermit", label: "Catering Permit", checked: checked.permits.cateringPermit, onToggle: () => handleToggle("permits", "cateringPermit") },
              { id: "businessLicense", label: "Business License", checked: checked.permits.businessLicense, onToggle: () => handleToggle("permits", "businessLicense") },
            ]} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ChecklistColumn({ title, items }: { title: string; items: { id: string; label: string; note?: string; checked: boolean; onToggle: () => void }[] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-warm-white font-medium text-sm">{title}</h4>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onToggle}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-warm-sand/5 transition-colors text-left"
        >
          {item.checked ? (
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-warm-sand/40 flex-shrink-0" />
          )}
          <div className="flex flex-col">
            <span className={`text-sm ${item.checked ? "text-warm-sand line-through" : "text-warm-sand"}`}>
              {item.label}
            </span>
            {item.note && !item.checked && (
              <span className="text-xs text-olive-gold/70">{item.note}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}