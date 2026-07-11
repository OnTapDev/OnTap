"use client";

import { useState } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Textarea } from "@/ui/primitives";
import {
  Save, Upload, Globe, Instagram, Facebook, Twitter, MapPin, Clock, DollarSign, FileText, X, AlertTriangle,
  Shield, CheckCircle2, Circle, Plus, Package, Store, Gavel, Building2, ChevronDown,
  Box, Wine, Utensils, Sparkles, Edit3, Trash2
} from "lucide-react";
import { updateOrganization, createPackage, updatePackage, deletePackage } from "@/modules/settings/actions/settings";
import { createDocument, deleteDocumentRecord } from "@/modules/profile/actions/documents";
import { createGalleryItem, deleteGalleryItem, updateGalleryItem, reorderGalleryItems } from "@/modules/profile/actions/gallery";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/modules/profile/actions/inventory";
import { saveSetupProgressItem } from "@/modules/profile/actions/setup";
import type { SetupProgress } from "@/modules/profile/actions/setup";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  default_hourly_rate: number | null;
  minimum_booking_hours: number | null;
  service_area: string | null;
  service_radius: number | null;
  zones_of_operation: string | null;
  regulations: string | null;
  is_marketplace_listed: boolean | null;
};

type Document = {
  id: string;
  name: string;
  type: string;
  file_url: string;
  expires_at: string | null;
  created_at: string;
};

type Package = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: string;
  min_guests: number | null;
  max_guests: number | null;
  includes_bartenders: number | null;
  includes_glassware: boolean | null;
  is_active: boolean | null;
};

type GalleryItem = {
  id: string;
  org_id: string;
  url: string;
  type: string;
  caption: string | null;
  is_public: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number | null;
  cost_per_unit: number | null;
  notes: string | null;
};

interface ProfileClientProps {
  organization: Organization;
  documents?: Document[];
  packages?: Package[];
  galleryItems?: GalleryItem[];
  inventoryItems?: InventoryItem[];
  setupProgress?: SetupProgress;
}

const INVENTORY_CATEGORIES = [
  { value: "spirits", label: "Spirits", icon: Wine },
  { value: "mixers", label: "Mixers", icon: Utensils },
  { value: "glassware", label: "Glassware", icon: Sparkles },
  { value: "equipment", label: "Equipment", icon: Box },
  { value: "decor", label: "Decor & Furniture", icon: Store },
  { value: "consumables", label: "Consumables", icon: Package },
  { value: "other", label: "Other", icon: ChevronDown },
];

export function ProfileClient({
  organization, documents = [], packages = [], galleryItems = [],
  inventoryItems: initialInventory = [], setupProgress: initialProgress
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [mediaFilter, setMediaFilter] = useState("all");
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: organization?.name || "",
    logo_url: organization?.logo_url || "",
    description: organization?.description || "",
    website: organization?.website || "",
    instagram: organization?.instagram || "",
    facebook: organization?.facebook || "",
    twitter: organization?.twitter || "",
    phone: organization?.phone || "",
    email: organization?.email || "",
    address: organization?.address || "",
    city: organization?.city || "",
    state: organization?.state || "",
    zip: organization?.zip || "",
    default_hourly_rate: organization?.default_hourly_rate?.toString() || "",
    minimum_booking_hours: organization?.minimum_booking_hours?.toString() || "2",
    service_area: organization?.service_area || "",
    service_radius: organization?.service_radius?.toString() || "",
    zones_of_operation: organization?.zones_of_operation || "",
    regulations: organization?.regulations || "",
    is_marketplace_listed: organization?.is_marketplace_listed || false,
  });

  const [setupProgress, setSetupProgress] = useState<SetupProgress>(initialProgress || {
    insurance: { liquorLiability: false, generalLiability: false, commercialAuto: false },
    formation: { entityType: null, registered: false, bankAccount: false },
    permits: { liquorLicense: false, cateringPermit: false, businessLicense: false },
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventory);
  const [showInvForm, setShowInvForm] = useState(false);
  const [editingInv, setEditingInv] = useState<InventoryItem | null>(null);
  const [invForm, setInvForm] = useState({
    name: "", category: "spirits", quantity: "0", unit: "bottle",
    reorder_level: "", cost_per_unit: "", notes: "",
  });

  const [docForm, setDocForm] = useState({
    name: "", type: "insurance", file_data: "", file_name: "", expires_at: "",
  });

  const [pkgForm, setPkgForm] = useState({
    name: "", description: "", base_price: "", pricing_type: "per_hour",
    min_guests: "", max_guests: "", includes_bartenders: "1", includes_glassware: true,
  });

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "business", label: "Business" },
    { id: "service-area", label: "Service Area" },
    { id: "pricing", label: "Pricing" },
    { id: "insurance", label: "Insurance & Licenses" },
    { id: "inventory", label: "Inventory" },
    { id: "gallery", label: "Gallery" },
    { id: "documents", label: "Documents" },
  ];

  const mediaTypes = [
    { value: "all", label: "All" }, { value: "event", label: "Events" },
    { value: "drink", label: "Drinks" }, { value: "menu", label: "Menus" },
    { value: "staff", label: "Staff" }, { value: "venue", label: "Venue" },
    { value: "other", label: "Other" },
  ];

  const docTypes = [
    { value: "insurance", label: "Insurance" }, { value: "license", label: "License" },
    { value: "permit", label: "Permit" }, { value: "contract", label: "Contract" },
    { value: "other", label: "Other" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(organization.id, {
        name: form.name, logo_url: form.logo_url || undefined,
        description: form.description || undefined, website: form.website || undefined,
        instagram: form.instagram || undefined, facebook: form.facebook || undefined,
        twitter: form.twitter || undefined, phone: form.phone || undefined,
        email: form.email || undefined, address: form.address || undefined,
        city: form.city || undefined, state: form.state || undefined,
        zip: form.zip || undefined,
        default_hourly_rate: form.default_hourly_rate ? parseFloat(form.default_hourly_rate) : undefined,
        minimum_booking_hours: form.minimum_booking_hours ? parseInt(form.minimum_booking_hours) : undefined,
        service_area: form.service_area || undefined,
        service_radius: form.service_radius ? parseInt(form.service_radius) : undefined,
        zones_of_operation: form.zones_of_operation || undefined,
        regulations: form.regulations || undefined,
        is_marketplace_listed: form.is_marketplace_listed,
      });
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!docForm.name || !docForm.file_data || !docForm.file_name) {
      alert("Please fill in all required fields"); return;
    }
    setUploading(true);
    try {
      await createDocument(organization.id, {
        name: docForm.name, type: docForm.type, file_data: docForm.file_data,
        file_name: docForm.file_name, expires_at: docForm.expires_at || undefined,
      });
      setShowDocForm(false);
      setDocForm({ name: "", type: "insurance", file_data: "", file_name: "", expires_at: "" });
      alert("Document uploaded!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDocumentRecord(docId);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No expiry";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleCreatePackage = async () => {
    if (!pkgForm.name || !pkgForm.base_price) { alert("Fill required fields"); return; }
    setSaving(true);
    try {
      await createPackage(organization.id, {
        name: pkgForm.name, description: pkgForm.description || undefined,
        base_price: parseFloat(pkgForm.base_price), pricing_type: pkgForm.pricing_type,
        min_guests: pkgForm.min_guests ? parseInt(pkgForm.min_guests) : undefined,
        max_guests: pkgForm.max_guests ? parseInt(pkgForm.max_guests) : undefined,
        includes_bartenders: parseInt(pkgForm.includes_bartenders), includes_glassware: pkgForm.includes_glassware,
      });
      setShowPackageForm(false);
      setPkgForm({ name: "", description: "", base_price: "", pricing_type: "per_hour", min_guests: "", max_guests: "", includes_bartenders: "1", includes_glassware: true });
      alert("Package created!");
    } catch (error) {
      console.error("Error creating package:", error);
      alert("Failed to create package");
    } finally { setSaving(false); }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage || !pkgForm.name || !pkgForm.base_price) { alert("Fill required fields"); return; }
    setSaving(true);
    try {
      await updatePackage(editingPackage.id, {
        name: pkgForm.name, description: pkgForm.description || undefined,
        base_price: parseFloat(pkgForm.base_price), pricing_type: pkgForm.pricing_type,
        min_guests: pkgForm.min_guests ? parseInt(pkgForm.min_guests) : undefined,
        max_guests: pkgForm.max_guests ? parseInt(pkgForm.max_guests) : undefined,
        includes_bartenders: parseInt(pkgForm.includes_bartenders), includes_glassware: pkgForm.includes_glassware,
      });
      setEditingPackage(null);
      setPkgForm({ name: "", description: "", base_price: "", pricing_type: "per_hour", min_guests: "", max_guests: "", includes_bartenders: "1", includes_glassware: true });
      alert("Package updated!");
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Failed to update package");
    } finally { setSaving(false); }
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm("Delete this package?")) return;
    try {
      await deletePackage(pkgId);
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
    }
  };

  const startEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setPkgForm({
      name: pkg.name, description: pkg.description || "", base_price: pkg.base_price.toString(),
      pricing_type: pkg.pricing_type, min_guests: pkg.min_guests?.toString() || "",
      max_guests: pkg.max_guests?.toString() || "", includes_bartenders: pkg.includes_bartenders?.toString() || "1",
      includes_glassware: pkg.includes_glassware ?? true,
    });
  };

  const handleSetupToggle = async (section: string, item: string) => {
    const newProgress = { ...setupProgress };
    const s = section as keyof SetupProgress;
    const i = item as keyof SetupProgress[typeof s];
    (newProgress[s][i] as boolean | string) = !(newProgress[s][i] as boolean);
    setSetupProgress(newProgress);
    await saveSetupProgressItem(organization.id, section, item, !!(newProgress[s][i]));
  };

  const setupCompleted = () => {
    let c = 0;
    const p = setupProgress;
    if (p.insurance.liquorLiability) c++;
    if (p.insurance.generalLiability) c++;
    if (p.insurance.commercialAuto) c++;
    if (p.formation.entityType) c++;
    if (p.formation.registered) c++;
    if (p.formation.bankAccount) c++;
    if (p.permits.liquorLicense) c++;
    if (p.permits.cateringPermit) c++;
    if (p.permits.businessLicense) c++;
    return { count: c, total: 9 };
  };

  const handleInvSubmit = async () => {
    if (!invForm.name) { alert("Name is required"); return; }
    setSaving(true);
    try {
      if (editingInv) {
        const updateData: Record<string, unknown> = {
          name: invForm.name, category: invForm.category,
          quantity: parseFloat(invForm.quantity) || 0, unit: invForm.unit,
        };
        if (invForm.reorder_level) updateData.reorder_level = parseFloat(invForm.reorder_level);
        if (invForm.cost_per_unit) updateData.cost_per_unit = parseFloat(invForm.cost_per_unit);
        if (invForm.notes) updateData.notes = invForm.notes;
        await updateInventoryItem(editingInv.id, updateData as Parameters<typeof updateInventoryItem>[1]);
        setInventoryItems(inventoryItems.map(i => i.id === editingInv.id ? { ...i, name: invForm.name, category: invForm.category, quantity: parseFloat(invForm.quantity) || 0, unit: invForm.unit, reorder_level: invForm.reorder_level ? parseFloat(invForm.reorder_level) : i.reorder_level, cost_per_unit: invForm.cost_per_unit ? parseFloat(invForm.cost_per_unit) : i.cost_per_unit, notes: invForm.notes || i.notes } : i));
      } else {
        const created = await createInventoryItem(organization.id, {
          name: invForm.name, category: invForm.category,
          quantity: parseFloat(invForm.quantity) || 0, unit: invForm.unit,
          ...(invForm.reorder_level ? { reorder_level: parseFloat(invForm.reorder_level) } : {}),
          ...(invForm.cost_per_unit ? { cost_per_unit: parseFloat(invForm.cost_per_unit) } : {}),
          ...(invForm.notes ? { notes: invForm.notes } : {}),
        });
        if (created) setInventoryItems([...inventoryItems, created]);
      }
      setShowInvForm(false);
      setEditingInv(null);
      setInvForm({ name: "", category: "spirits", quantity: "0", unit: "bottle", reorder_level: "", cost_per_unit: "", notes: "" });
    } catch (err) {
      console.error("Inventory error:", err);
      alert("Failed to save inventory item");
    } finally { setSaving(false); }
  };

  const handleDeleteInv = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteInventoryItem(id);
      setInventoryItems(inventoryItems.filter(i => i.id !== id));
    } catch (err) {
      console.error("Delete inventory error:", err);
    }
  };

  const startEditInv = (item: InventoryItem) => {
    setEditingInv(item);
    setInvForm({
      name: item.name, category: item.category, quantity: item.quantity.toString(), unit: item.unit,
      reorder_level: item.reorder_level?.toString() || "", cost_per_unit: item.cost_per_unit?.toString() || "",
      notes: item.notes || "",
    });
    setShowInvForm(true);
  };

  const { count: completedItems, total: totalItems } = setupCompleted();
  const setupPct = Math.round((completedItems / totalItems) * 100);

  const renderTab = (id: string, label: string) => (
    <button key={id} onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        activeTab === id ? "bg-olive-gold text-charcoal" : "text-warm-sand hover:text-warm-white hover:bg-warm-sand/10"
      }`}>
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-warm-sand/20">
        {tabs.map(t => renderTab(t.id, t.label))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-warm-sand/5 rounded-lg">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-contain" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-warm-sand/20 flex items-center justify-center">
                      <span className="text-2xl">🍸</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-warm-white font-bold text-lg">{form.name || "Your Business Name"}</h3>
                    {form.city && <p className="text-warm-sand text-sm">{form.city}{form.state && `, ${form.state}`}</p>}
                    {form.is_marketplace_listed && (
                      <span className="inline-flex items-center gap-1 text-xs text-olive-gold mt-1">
                        <Store className="w-3 h-3" /> Marketplace listed
                      </span>
                    )}
                  </div>
                </div>
                {form.description && <div><h4 className="text-warm-sand text-sm font-medium mb-1">About</h4><p className="text-warm-white text-sm">{form.description}</p></div>}
                {(form.phone || form.email) && <div><h4 className="text-warm-sand text-sm font-medium mb-1">Contact</h4><div className="space-y-1">{form.phone && <p className="text-warm-white text-sm">📞 {form.phone}</p>}{form.email && <p className="text-warm-white text-sm">✉️ {form.email}</p>}</div></div>}
                {form.zones_of_operation && <div><h4 className="text-warm-sand text-sm font-medium mb-1">Service Area</h4><p className="text-warm-white text-sm">{form.zones_of_operation}</p></div>}
                {form.website && <div><h4 className="text-warm-sand text-sm font-medium mb-1">Website</h4><p className="text-olive-gold text-sm">{form.website}</p></div>}
                {(form.instagram || form.facebook || form.twitter) && (
                  <div><h4 className="text-warm-sand text-sm font-medium mb-1">Social</h4><div className="flex gap-2">{form.instagram && <span className="text-olive-gold text-sm">📸 {form.instagram}</span>}{form.facebook && <span className="text-olive-gold text-sm">📘 {form.facebook}</span>}{form.twitter && <span className="text-olive-gold text-sm">🐦 {form.twitter}</span>}</div></div>
                )}
                {packages.length > 0 && (
                  <div><h4 className="text-warm-sand text-sm font-medium mb-2">Packages</h4><div className="space-y-2">{packages.slice(0, 3).map(pkg => (
                    <div key={pkg.id} className="flex items-center justify-between p-2 bg-warm-sand/5 rounded"><span className="text-warm-white text-sm">{pkg.name}</span><span className="text-olive-gold font-medium">${pkg.base_price}</span></div>
                  ))}</div></div>
                )}
                {galleryItems.filter(g => g.is_public).length > 0 && (
                  <div><h4 className="text-warm-sand text-sm font-medium mb-2">Gallery</h4><div className="grid grid-cols-3 gap-1">{galleryItems.filter(g => g.is_public).slice(0, 6).map(item => (
                    <div key={item.id} className="aspect-square rounded overflow-hidden bg-warm-sand/10"><img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" /></div>
                  ))}</div></div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Setup Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-warm-sand">Business readiness</span>
                    <span className="text-olive-gold font-medium">{setupPct}%</span>
                  </div>
                  <div className="h-2 bg-warm-sand/10 rounded-full overflow-hidden">
                    <div className="h-full bg-olive-gold transition-all duration-300" style={{ width: `${setupPct}%` }} />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <div className="p-3 bg-warm-sand/5 rounded-lg">
                    <h4 className="text-warm-white font-medium mb-2">Insurance</h4>
                    <div className="space-y-1">
                      {[{ key: "liquorLiability", label: "Liquor Liability" }, { key: "generalLiability", label: "General Liability" }, { key: "commercialAuto", label: "Commercial Auto" }].map(item => (
                        <div key={item.key} className="flex items-center gap-2">
                          {setupProgress.insurance[item.key as keyof typeof setupProgress.insurance] ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-warm-sand/40" />
                          )}
                          <span className="text-warm-sand">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-warm-sand/5 rounded-lg">
                    <h4 className="text-warm-white font-medium mb-2">Formation</h4>
                    <div className="space-y-1">
                      {[{ key: "entityType", label: "Entity Type" }, { key: "registered", label: "Registered" }, { key: "bankAccount", label: "Bank Account" }].map(item => {
                        const val = setupProgress.formation[item.key as keyof typeof setupProgress.formation];
                        return (
                          <div key={item.key} className="flex items-center gap-2">
                            {val ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Circle className="w-3.5 h-3.5 text-warm-sand/40" />}
                            <span className="text-warm-sand">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-3 bg-warm-sand/5 rounded-lg">
                    <h4 className="text-warm-white font-medium mb-2">Permits</h4>
                    <div className="space-y-1">
                      {[{ key: "liquorLicense", label: "Liquor License" }, { key: "cateringPermit", label: "Catering Permit" }, { key: "businessLicense", label: "Business License" }].map(item => (
                        <div key={item.key} className="flex items-center gap-2">
                          {setupProgress.permits[item.key as keyof typeof setupProgress.permits] ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-warm-sand/40" />
                          )}
                          <span className="text-warm-sand">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-warm-sand/5 rounded-lg text-center">
                    <p className="text-olive-gold text-lg font-bold">{packages.length}</p>
                    <p className="text-warm-sand">Packages</p>
                  </div>
                  <div className="p-3 bg-warm-sand/5 rounded-lg text-center">
                    <p className="text-olive-gold text-lg font-bold">{galleryItems.length}</p>
                    <p className="text-warm-sand">Photos</p>
                  </div>
                  <div className="p-3 bg-warm-sand/5 rounded-lg text-center">
                    <p className="text-olive-gold text-lg font-bold">{inventoryItems.length}</p>
                    <p className="text-warm-sand">Inventory Items</p>
                  </div>
                  <div className="p-3 bg-warm-sand/5 rounded-lg text-center">
                    <p className="text-olive-gold text-lg font-bold">{documents.length}</p>
                    <p className="text-warm-sand">Documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "business" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="label">Business Name</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your Bar Company" />
                  </div>
                  <div>
                    <label className="label">Logo</label>
                    <div className="flex items-center gap-4">
                      {form.logo_url ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-warm-sand/30">
                          <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                          <button type="button" onClick={() => setForm({ ...form, logo_url: "" })}
                            className="absolute top-0 right-0 bg-red-500/80 text-white p-1 rounded-bl text-xs hover:bg-red-500">✕</button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-warm-sand/30 flex flex-col items-center justify-center cursor-pointer hover:border-olive-gold transition-colors">
                          <Upload className="w-6 h-6 text-warm-sand" /><span className="text-xs text-warm-sand mt-1">Upload</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) { const r = new FileReader(); r.onload = ev => setForm({ ...form, logo_url: ev.target?.result as string }); r.readAsDataURL(file); }
                          }} />
                        </label>
                      )}
                      <div className="flex-1"><p className="text-sm text-warm-sand">Upload your logo (PNG, JPG, SVG)</p><p className="text-xs text-warm-sand/60 mt-1">Recommended: 400x400px</p></div>
                    </div>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Tell customers about your bar services, experience, and style..." rows={4} />
                    <p className="text-xs text-warm-sand mt-1">Appears on your public profile and marketplace listing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><label className="label">Phone</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" /></div>
                  <div><label className="label">Email</label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="hello@yourbar.com" type="email" /></div>
                  <div><label className="label">Street Address</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="label">City</label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="New York" /></div>
                    <div><label className="label">State</label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="NY" /></div>
                    <div><label className="label">ZIP</label><Input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} placeholder="10001" /></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div><label className="label"><Globe className="w-4 h-4 inline mr-1" /> Website</label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourbar.com" /></div>
                  <div><label className="label"><Instagram className="w-4 h-4 inline mr-1" /> Instagram</label><Input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@yourbar" /></div>
                  <div><label className="label"><Facebook className="w-4 h-4 inline mr-1" /> Facebook</label><Input value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/yourbar" /></div>
                  <div><label className="label"><Twitter className="w-4 h-4 inline mr-1" /> Twitter / X</label><Input value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="@yourbar" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={form.is_marketplace_listed}
                    onChange={e => setForm({ ...form, is_marketplace_listed: e.target.checked })}
                    className="w-5 h-5 mt-0.5 accent-olive-gold rounded" />
                  <div>
                    <p className="text-warm-white font-medium">List in Marketplace</p>
                    <p className="text-warm-sand text-sm">Make your business visible to potential clients browsing mobile bar services. Requires complete profile with packages, gallery, and insurance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "service-area" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Zones of Operation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="label"><MapPin className="w-4 h-4 inline mr-1" /> Service Area (cities / regions)</label>
                  <Textarea value={form.zones_of_operation} onChange={e => setForm({ ...form, zones_of_operation: e.target.value })}
                    placeholder="Greater Los Angeles Area&#10;Orange County&#10;San Diego County&#10;Inland Empire"
                    rows={4} />
                  <p className="text-xs text-warm-sand mt-1">One per line. These zones appear on your public profile.</p>
                </div>
                <div>
                  <label className="label"><MapPin className="w-4 h-4 inline mr-1" /> Travel Radius (miles)</label>
                  <Input value={form.service_radius} onChange={e => setForm({ ...form, service_radius: e.target.value })}
                    placeholder="50" type="number" />
                  <p className="text-xs text-warm-sand mt-1">Maximum distance from your base location you&apos;re willing to travel</p>
                </div>
                <div>
                  <label className="label"><Gavel className="w-4 h-4 inline mr-1" /> Regulations & Limitations</label>
                  <Textarea value={form.regulations} onChange={e => setForm({ ...form, regulations: e.target.value })}
                    placeholder="No alcohol sales after 10pm in certain zones&#10;Special event permit required for park events&#10;County ABC license required for Orange County&#10;No glass bottles in beach-adjacent venues"
                    rows={5} />
                  <p className="text-xs text-warm-sand mt-1">Document local alcohol regulations, time restrictions, permit requirements, and operating limitations per zone.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zone Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-warm-sand text-sm">Review your zones and associated requirements.</p>
                {form.zones_of_operation ? (
                  <div className="space-y-3">
                    {form.zones_of_operation.split("\n").filter(z => z.trim()).map((zone, i) => (
                      <div key={i} className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                        <h4 className="text-warm-white font-medium text-sm">{zone.trim()}</h4>
                        <p className="text-xs text-warm-sand mt-1">
                          {form.service_radius ? `Within ${form.service_radius} mi radius` : "Distance: not specified"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-warm-sand/60 text-sm italic">Add zones of operation to see them listed here.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Base Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="label"><DollarSign className="w-4 h-4 inline mr-1" /> Default Hourly Rate (per bartender)</label>
                  <Input value={form.default_hourly_rate} onChange={e => setForm({ ...form, default_hourly_rate: e.target.value })} placeholder="50" type="number" />
                  <p className="text-xs text-warm-sand mt-1">Used as default when creating quotes and assigning staff</p>
                </div>
                <div>
                  <label className="label"><Clock className="w-4 h-4 inline mr-1" /> Minimum Booking Hours</label>
                  <Input value={form.minimum_booking_hours} onChange={e => setForm({ ...form, minimum_booking_hours: e.target.value })} placeholder="2" type="number" />
                  <p className="text-xs text-warm-sand mt-1">Smallest number of hours a client can book</p>
                </div>
                <div>
                  <label className="label"><MapPin className="w-4 h-4 inline mr-1" /> Service Area Description</label>
                  <Textarea value={form.service_area} onChange={e => setForm({ ...form, service_area: e.target.value })}
                    placeholder="City, counties, or regions you serve..." rows={3} />
                  <p className="text-xs text-warm-sand mt-1">Legacy description field. Consider using &quot;Zones of Operation&quot; on the Service Area tab.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pricing Packages</CardTitle>
              <Button onClick={() => setShowPackageForm(true)} variant="secondary" className="text-sm">+ Add Package</Button>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <div className="text-center py-8"><p className="text-warm-sand mb-4">No packages created yet</p><p className="text-warm-sand text-sm">Create packages to offer predefined service tiers to clients</p></div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-warm-white font-medium">{pkg.name}</h4>
                          <p className="text-olive-gold font-bold text-lg">${pkg.base_price}<span className="text-warm-sand text-sm font-normal">{pkg.pricing_type === "per_hour" ? "/hr" : pkg.pricing_type === "per_person" ? "/person" : ""}</span></p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEditPackage(pkg)} className="p-1.5 text-warm-sand hover:text-warm-white">Edit</button>
                          <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 text-warm-sand hover:text-red-400">Delete</button>
                        </div>
                      </div>
                      {pkg.description && <p className="text-warm-sand text-sm mb-3">{pkg.description}</p>}
                      <div className="flex flex-wrap gap-2 text-xs text-warm-sand">
                        {pkg.min_guests && <span>Min: {pkg.min_guests} guests</span>}
                        {pkg.max_guests && <span>Max: {pkg.max_guests} guests</span>}
                        {pkg.includes_bartenders && <span>{pkg.includes_bartenders} bartender(s)</span>}
                        {pkg.includes_glassware && <span>Glassware included</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(showPackageForm || editingPackage) && (
                <div className="mt-6 p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                  <h4 className="text-warm-white font-medium mb-4">{editingPackage ? "Edit Package" : "Create New Package"}</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><label className="label">Package Name *</label><Input value={pkgForm.name} onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="Premium Bar Package" /></div>
                    <div><label className="label">Price *</label><Input value={pkgForm.base_price} onChange={e => setPkgForm({ ...pkgForm, base_price: e.target.value })} placeholder="150" type="number" /></div>
                    <div><label className="label">Pricing Type</label>
                      <select value={pkgForm.pricing_type} onChange={e => setPkgForm({ ...pkgForm, pricing_type: e.target.value })}
                        className="w-full px-3 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white">
                        <option value="per_hour">Per Hour</option><option value="per_person">Per Person</option><option value="flat">Flat Rate</option>
                      </select>
                    </div>
                    <div><label className="label">Bartenders</label><Input value={pkgForm.includes_bartenders} onChange={e => setPkgForm({ ...pkgForm, includes_bartenders: e.target.value })} placeholder="1" type="number" /></div>
                    <div><label className="label">Min Guests</label><Input value={pkgForm.min_guests} onChange={e => setPkgForm({ ...pkgForm, min_guests: e.target.value })} placeholder="50" type="number" /></div>
                    <div><label className="label">Max Guests</label><Input value={pkgForm.max_guests} onChange={e => setPkgForm({ ...pkgForm, max_guests: e.target.value })} placeholder="100" type="number" /></div>
                    <div className="md:col-span-2"><label className="label">Description</label><Textarea value={pkgForm.description} onChange={e => setPkgForm({ ...pkgForm, description: e.target.value })} placeholder="What's included..." rows={2} /></div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input type="checkbox" checked={pkgForm.includes_glassware} onChange={e => setPkgForm({ ...pkgForm, includes_glassware: e.target.checked })} className="w-4 h-4 accent-olive-gold" />
                      <span className="text-warm-sand text-sm">Includes glassware</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={editingPackage ? handleUpdatePackage : handleCreatePackage} disabled={saving}>{saving ? "Saving..." : editingPackage ? "Update Package" : "Create Package"}</Button>
                    <Button variant="secondary" onClick={() => { setShowPackageForm(false); setEditingPackage(null); setPkgForm({ name: "", description: "", base_price: "", pricing_type: "per_hour", min_guests: "", max_guests: "", includes_bartenders: "1", includes_glassware: true }); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "insurance" && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center"><Shield className="w-5 h-5 text-olive-gold" /></div>
                  <div><CardTitle>Insurance</CardTitle></div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-warm-sand text-sm mb-4">Protect your business with the right coverage.</p>
                <div className="space-y-3">
                  {[
                    { id: "liquorLiability", label: "Liquor Liability Insurance", desc: "Essential for mobile bartending operations. Protects against claims from overserving.", providers: [{ name: "CoverWallet", url: "https://www.coverwallet.com" }, { name: "Thimble", url: "https://www.thimble.com" }] },
                    { id: "generalLiability", label: "General Liability Insurance", desc: "Covers property damage, bodily injury, and accidents at events.", providers: [{ name: "NEXT Insurance", url: "https://www.nextinsurance.com" }, { name: "The Hartford", url: "https://www.thehartford.com" }] },
                    { id: "commercialAuto", label: "Commercial Auto Insurance", desc: "Covers your vehicle used for business transportation.", providers: [{ name: "Progressive", url: "https://www.progressivecommercial.com" }] },
                  ].map(item => {
                    const key = item.id as keyof typeof setupProgress.insurance;
                    return (
                      <div key={item.id} className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleSetupToggle("insurance", item.id)}
                                className="flex-shrink-0">
                                {setupProgress.insurance[key] ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-warm-sand/40" />}
                              </button>
                              <h4 className={`text-sm font-medium ${setupProgress.insurance[key] ? "text-warm-sand line-through" : "text-warm-white"}`}>{item.label}</h4>
                            </div>
                          </div>
                        </div>
                        <p className="text-warm-sand text-xs ml-7">{item.desc}</p>
                        <div className="flex flex-wrap gap-1.5 ml-7 mt-2">
                          {item.providers.map(p => (
                            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs px-2 py-1 bg-olive-gold/20 text-olive-gold rounded-full hover:bg-olive-gold/30 transition-colors">{p.name}</a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-olive-gold" /></div>
                  <div><CardTitle>Company Formation</CardTitle></div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-warm-sand text-sm mb-4">Set up your business legally.</p>
                <div className="space-y-3">
                  {[
                    { id: "entityType", label: "Business Entity (LLC/Corp)", desc: "Most popular is LLC for small businesses. Protects personal assets.", providers: [{ name: "LegalZoom", url: "https://www.legalzoom.com" }, { name: "Incfile", url: "https://www.incfile.com" }] },
                    { id: "registered", label: "Registered with State", desc: "Your business must be registered in the state(s) you operate in.", providers: [{ name: "Inc Authority", url: "https://www.incauthority.com" }] },
                    { id: "bankAccount", label: "Business Bank Account", desc: "Keep personal and business finances separate.", providers: [] },
                  ].map(item => {
                    const key = item.id as keyof typeof setupProgress.formation;
                    const val = setupProgress.formation[key];
                    return (
                      <div key={item.id} className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleSetupToggle("formation", item.id)} className="flex-shrink-0">
                                {val ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-warm-sand/40" />}
                              </button>
                              <h4 className={`text-sm font-medium ${val ? "text-warm-sand line-through" : "text-warm-white"}`}>{item.label}</h4>
                            </div>
                          </div>
                        </div>
                        <p className="text-warm-sand text-xs ml-7">{item.desc}</p>
                        {item.providers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 ml-7 mt-2">
                            {item.providers.map(p => (
                              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs px-2 py-1 bg-olive-gold/20 text-olive-gold rounded-full hover:bg-olive-gold/30 transition-colors">{p.name}</a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-olive-gold/20 flex items-center justify-center"><FileText className="w-5 h-5 text-olive-gold" /></div>
                  <div><CardTitle>Permits & Licenses</CardTitle></div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-warm-sand text-sm mb-4">Stay compliant with local requirements.</p>
                <div className="space-y-3">
                  {[
                    { id: "liquorLicense", label: "Liquor License", desc: "Requirements vary by state. Check with your local ABC board.", link: "https://www.ttb.gov/", linkText: "TTB.gov" },
                    { id: "cateringPermit", label: "Catering Permit", desc: "Often required to serve at events not at your licensed premises." },
                    { id: "businessLicense", label: "Business License", desc: "General business license from your city or county." },
                  ].map(item => {
                    const key = item.id as keyof typeof setupProgress.permits;
                    return (
                      <div key={item.id} className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleSetupToggle("permits", item.id)} className="flex-shrink-0">
                                {setupProgress.permits[key] ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-warm-sand/40" />}
                              </button>
                              <h4 className={`text-sm font-medium ${setupProgress.permits[key] ? "text-warm-sand line-through" : "text-warm-white"}`}>{item.label}</h4>
                            </div>
                          </div>
                        </div>
                        <p className="text-warm-sand text-xs ml-7">{item.desc}</p>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer"
                            className="text-xs ml-7 mt-1 inline-block text-olive-gold hover:underline">{item.linkText}</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-olive-gold/10 border border-olive-gold/20 rounded-xl p-6">
            <h3 className="text-warm-white font-semibold mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-warm-sand text-sm">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />Start with LLC + general liability and liquor liability insurance before taking any paid events</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />Keep business and personal finances separate — open a business bank account</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-olive-gold mt-0.5 flex-shrink-0" />Consider hiring an accountant familiar with service businesses for tax planning</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory</CardTitle>
            <Button onClick={() => { setEditingInv(null); setInvForm({ name: "", category: "spirits", quantity: "0", unit: "bottle", reorder_level: "", cost_per_unit: "", notes: "" }); setShowInvForm(true); }}
              variant="secondary" className="text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Item</Button>
          </CardHeader>
          <CardContent>
            {showInvForm && (
              <div className="mb-6 p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                <h4 className="text-warm-white font-medium mb-4">{editingInv ? "Edit Item" : "Add Inventory Item"}</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><label className="label">Item Name *</label><Input value={invForm.name} onChange={e => setInvForm({ ...invForm, name: e.target.value })} placeholder="e.g., Tito's Vodka" /></div>
                  <div><label className="label">Category</label>
                    <select value={invForm.category} onChange={e => setInvForm({ ...invForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white">
                      {INVENTORY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Unit</label>
                    <select value={invForm.unit} onChange={e => setInvForm({ ...invForm, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white">
                      <option value="bottle">Bottle</option>
                      <option value="case">Case</option>
                      <option value="liter">Liter</option>
                      <option value="oz">Ounce</option>
                      <option value="unit">Unit</option>
                      <option value="set">Set</option>
                      <option value="piece">Piece</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                  <div><label className="label">Quantity</label><Input value={invForm.quantity} onChange={e => setInvForm({ ...invForm, quantity: e.target.value })} type="number" step="0.01" /></div>
                  <div><label className="label">Reorder Level <span className="text-warm-sand/60">(optional)</span></label><Input value={invForm.reorder_level} onChange={e => setInvForm({ ...invForm, reorder_level: e.target.value })} type="number" step="0.01" placeholder="Low stock alert" /></div>
                  <div><label className="label">Cost per Unit <span className="text-warm-sand/60">(optional)</span></label><Input value={invForm.cost_per_unit} onChange={e => setInvForm({ ...invForm, cost_per_unit: e.target.value })} type="number" step="0.01" placeholder="$0.00" /></div>
                  <div className="md:col-span-3"><label className="label">Notes <span className="text-warm-sand/60">(optional)</span></label><Textarea value={invForm.notes} onChange={e => setInvForm({ ...invForm, notes: e.target.value })} placeholder="Storage location, supplier, notes..." rows={2} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleInvSubmit} disabled={saving}>{saving ? "Saving..." : editingInv ? "Update Item" : "Add Item"}</Button>
                  <Button variant="secondary" onClick={() => { setShowInvForm(false); setEditingInv(null); }}>Cancel</Button>
                </div>
              </div>
            )}

            {inventoryItems.length === 0 ? (
              <div className="text-center py-8"><p className="text-warm-sand">No inventory items yet.</p><p className="text-warm-sand text-sm mt-1">Track your spirits, mixers, glassware, and equipment.</p></div>
            ) : (
              <>
                {INVENTORY_CATEGORIES.filter(c => inventoryItems.some(i => i.category === c.value)).map(category => {
                  const items = inventoryItems.filter(i => i.category === category.value);
                  if (items.length === 0) return null;
                  const CatIcon = category.icon;
                  return (
                    <div key={category.value} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CatIcon className="w-4 h-4 text-olive-gold" />
                        <h4 className="text-warm-white font-medium text-sm">{category.label}</h4>
                        <span className="text-xs text-warm-sand">({items.length})</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {items.map(item => (
                          <div key={item.id} className="p-3 bg-warm-sand/5 rounded-lg border border-warm-sand/10">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="text-warm-white font-medium text-sm">{item.name}</h5>
                                <p className="text-lg font-bold text-olive-gold">
                                  {item.quantity} <span className="text-xs text-warm-sand font-normal">{item.unit}</span>
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => startEditInv(item)} className="p-1.5 text-warm-sand hover:text-warm-white"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteInv(item.id)} className="p-1.5 text-warm-sand hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap text-xs">
                              {item.reorder_level !== null && (
                                <span className={`${item.quantity <= item.reorder_level ? "text-red-400" : "text-warm-sand"}`}>
                                  {item.quantity <= item.reorder_level ? "⚠ Low stock" : `Reorder at ${item.reorder_level}`}
                                </span>
                              )}
                              {item.cost_per_unit !== null && <span className="text-warm-sand">${item.cost_per_unit}/{item.unit}</span>}
                              {item.notes && <span className="text-warm-sand/60 w-full mt-1">{item.notes}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "gallery" && (
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warm-sand text-sm mb-4">Showcase your events, drinks, menus, and more.</p>
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap mb-4">
                {mediaTypes.map(type => (
                  <button key={type.value} onClick={() => setMediaFilter(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${mediaFilter === type.value ? "bg-olive-gold text-charcoal" : "text-warm-sand bg-warm-sand/10 hover:text-warm-white"}`}>{type.label}</button>
                ))}
              </div>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-warm-sand/30 rounded-lg cursor-pointer hover:border-olive-gold transition-colors">
                <div className="flex flex-col items-center"><Upload className="w-6 h-6 text-warm-sand" /><span className="text-sm text-warm-sand mt-1">Upload Photos</span></div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={async e => {
                  const files = Array.from(e.target.files || []);
                  setUploading(true);
                  for (const file of files) {
                    try {
                      const reader = new FileReader();
                      reader.onload = async event => {
                        await createGalleryItem(organization.id, { file_data: event.target?.result as string, file_name: file.name, type: mediaFilter === "all" ? "other" : mediaFilter, is_public: true });
                      };
                      reader.readAsDataURL(file);
                    } catch (err) { console.error("Upload error:", err); }
                  }
                  setUploading(false);
                }} />
              </label>
            </div>
            {galleryItems.length === 0 ? (
              <div className="text-center py-8"><p className="text-warm-sand">No photos yet.</p></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-warm-sand text-sm">Drag to reorder • {galleryItems.filter(i => i.is_public).length} public</p>
                  <button onClick={() => setEditMode(!editMode)} className="text-sm text-olive-gold hover:text-warm-white">{editMode ? "Done" : "Edit Order"}</button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems.filter(item => mediaFilter === "all" || item.type === mediaFilter).map((item, index) => (
                    <div key={item.id} className={`relative group ${editMode ? 'cursor-move' : ''}`}
                      draggable={editMode}
                      onDragStart={e => { e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={async e => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        if (draggedId && draggedId !== item.id) {
                          const items = galleryItems.filter(i => mediaFilter === "all" || i.type === mediaFilter);
                          const draggedIdx = items.findIndex(i => i.id === draggedId);
                          const targetIdx = items.findIndex(i => i.id === item.id);
                          const newOrder = items.map(i => i.id);
                          const [removed] = newOrder.splice(draggedIdx, 1);
                          newOrder.splice(targetIdx, 0, removed);
                          await reorderGalleryItems(organization.id, newOrder);
                        }
                      }}>
                      <div className="aspect-square rounded-lg overflow-hidden bg-warm-sand/10 border-2 border-transparent hover:border-olive-gold transition-colors">
                        <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                        {item.is_featured && <div className="absolute top-2 left-2 px-2 py-1 bg-olive-gold text-charcoal text-xs rounded font-medium">★ Featured</div>}
                        {editMode && <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center"><span className="text-warm-white font-medium">#{index + 1}</span></div>}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                        <span className="px-2 py-1 bg-charcoal/80 text-warm-white text-xs rounded">{mediaTypes.find(t => t.value === item.type)?.label}</span>
                        <span className={`px-2 py-1 bg-charcoal/80 text-xs rounded ${item.is_public ? "text-olive-gold" : "text-warm-sand"}`}>{item.is_public ? "Public" : "Private"}</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={async () => { try { await updateGalleryItem(item.id, { is_featured: !item.is_featured }); } catch (err) { console.error(err); } }}
                          className={`p-1 rounded text-xs ${item.is_featured ? "bg-olive-gold text-charcoal" : "bg-charcoal/80 text-warm-white"}`}>★</button>
                        <button onClick={async () => { try { await updateGalleryItem(item.id, { is_public: !item.is_public }); } catch (err) { console.error(err); } }}
                          className="p-1 bg-charcoal/80 text-warm-white rounded text-xs">{item.is_public ? "🔒" : "👁"}</button>
                        <button onClick={async () => { if (confirm("Delete this photo?")) { try { await deleteGalleryItem(item.id); } catch (err) { console.error(err); } } }}
                          className="p-1 bg-red-500/80 text-white rounded text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card>
          <CardHeader>
            <CardTitle>Business Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warm-sand text-sm mb-4">Upload important documents like insurance, licenses, and permits.</p>
            {!showDocForm ? (
              <Button onClick={() => setShowDocForm(true)} className="flex items-center gap-2 mb-6"><Upload className="w-4 h-4" /> Upload Document</Button>
            ) : (
              <div className="mb-6 p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                <h4 className="text-warm-white font-medium mb-4">Add New Document</h4>
                <div className="space-y-4 max-w-lg">
                  <div><label className="label">Name *</label><Input value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} placeholder="General Liability Insurance 2024" /></div>
                  <div><label className="label">Type *</label>
                    <div className="flex gap-2 flex-wrap">{docTypes.map(type => (
                      <button key={type.value} type="button" onClick={() => setDocForm({ ...docForm, type: type.value })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${docForm.type === type.value ? "bg-olive-gold text-charcoal" : "text-warm-sand bg-warm-sand/10 hover:text-warm-white"}`}>{type.label}</button>
                    ))}</div>
                  </div>
                  <div><label className="label">File *</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-warm-sand file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-olive-gold file:text-charcoal hover:file:bg-olive-gold/90"
                      onChange={e => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = ev => setDocForm({ ...docForm, file_data: ev.target?.result as string, file_name: file.name }); r.readAsDataURL(file); } }} />
                  </div>
                  <div><label className="label">Expiration <span className="text-warm-sand/60">(optional)</span></label><Input value={docForm.expires_at} onChange={e => setDocForm({ ...docForm, expires_at: e.target.value })} type="date" /></div>
                  <div className="flex gap-2">
                    <Button onClick={handleUploadDocument} disabled={uploading}>{uploading ? "Uploading..." : "Save Document"}</Button>
                    <Button variant="secondary" onClick={() => setShowDocForm(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-warm-sand text-center p-4">No documents uploaded yet.</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-olive-gold/20 flex items-center justify-center"><FileText className="w-5 h-5 text-olive-gold" /></div>
                      <div><p className="text-warm-white font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-warm-sand capitalize">{doc.type}</span>
                          <span className="text-warm-sand/50">•</span>
                          <span className={`text-sm ${isExpiringSoon(doc.expires_at) ? "text-yellow-400" : "text-warm-sand"}`}>
                            {isExpiringSoon(doc.expires_at) && <AlertTriangle className="w-3 h-3 inline mr-1" />}Expires: {formatDate(doc.expires_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-warm-sand hover:text-warm-white">View</a>
                      <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-warm-sand hover:text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
