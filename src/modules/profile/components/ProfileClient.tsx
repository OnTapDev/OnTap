"use client";

import { useState } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Textarea } from "@/ui/primitives";
import { Save, Upload, Globe, Instagram, Facebook, Twitter, MapPin, Clock, DollarSign, FileText, X, AlertTriangle } from "lucide-react";
import { updateOrganization, createPackage, updatePackage, deletePackage } from "@/modules/settings/actions/settings";
import { createDocument, deleteDocumentRecord } from "@/modules/profile/actions/documents";
import { createGalleryItem, deleteGalleryItem, updateGalleryItem, reorderGalleryItems } from "@/modules/profile/actions/gallery";

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

interface ProfileClientProps {
  organization: Organization;
  documents?: Document[];
  packages?: Package[];
  galleryItems?: GalleryItem[];
}

export function ProfileClient({ organization, documents = [], packages = [], galleryItems = [] }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("business");
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
  });
  const [docForm, setDocForm] = useState({
    name: "",
    type: "insurance",
    file_data: "",
    file_name: "",
    expires_at: "",
  });
  const [pkgForm, setPkgForm] = useState({
    name: "",
    description: "",
    base_price: "",
    pricing_type: "per_hour",
    min_guests: "",
    max_guests: "",
    includes_bartenders: "1",
    includes_glassware: true,
  });

  const tabs = [
    { id: "business", label: "Business Info" },
    { id: "contact", label: "Contact" },
    { id: "social", label: "Social Links" },
    { id: "pricing", label: "Pricing & Rates" },
    { id: "gallery", label: "Gallery" },
    { id: "documents", label: "Documents" },
  ];

  const mediaTypes = [
    { value: "all", label: "All" },
    { value: "event", label: "Events" },
    { value: "drink", label: "Drinks" },
    { value: "menu", label: "Menus" },
    { value: "staff", label: "Staff" },
    { value: "venue", label: "Venue" },
    { value: "other", label: "Other" },
  ];

  const docTypes = [
    { value: "insurance", label: "Insurance" },
    { value: "license", label: "Business License" },
    { value: "permit", label: "Permit" },
    { value: "contract", label: "Contract" },
    { value: "other", label: "Other" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrganization(organization.id, {
        name: form.name,
        logo_url: form.logo_url || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
        twitter: form.twitter || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip: form.zip || undefined,
        default_hourly_rate: form.default_hourly_rate ? parseFloat(form.default_hourly_rate) : undefined,
        minimum_booking_hours: form.minimum_booking_hours ? parseInt(form.minimum_booking_hours) : undefined,
        service_area: form.service_area || undefined,
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
      alert("Please fill in all required fields");
      return;
    }
    setUploading(true);
    try {
      await createDocument(organization.id, {
        name: docForm.name,
        type: docForm.type,
        file_data: docForm.file_data,
        file_name: docForm.file_name,
        expires_at: docForm.expires_at || undefined,
      });
      setShowDocForm(false);
      setDocForm({ name: "", type: "insurance", file_data: "", file_name: "", expires_at: "" });
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocumentRecord(docId);
      alert("Document deleted");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No expiry";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleCreatePackage = async () => {
    if (!pkgForm.name || !pkgForm.base_price) {
      alert("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await createPackage(organization.id, {
        name: pkgForm.name,
        description: pkgForm.description || undefined,
        base_price: parseFloat(pkgForm.base_price),
        pricing_type: pkgForm.pricing_type,
        min_guests: pkgForm.min_guests ? parseInt(pkgForm.min_guests) : undefined,
        max_guests: pkgForm.max_guests ? parseInt(pkgForm.max_guests) : undefined,
        includes_bartenders: parseInt(pkgForm.includes_bartenders),
        includes_glassware: pkgForm.includes_glassware,
      });
      setShowPackageForm(false);
      setPkgForm({
        name: "",
        description: "",
        base_price: "",
        pricing_type: "per_hour",
        min_guests: "",
        max_guests: "",
        includes_bartenders: "1",
        includes_glassware: true,
      });
      alert("Package created!");
    } catch (error) {
      console.error("Error creating package:", error);
      alert("Failed to create package");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage || !pkgForm.name || !pkgForm.base_price) {
      alert("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await updatePackage(editingPackage.id, {
        name: pkgForm.name,
        description: pkgForm.description || undefined,
        base_price: parseFloat(pkgForm.base_price),
        pricing_type: pkgForm.pricing_type,
        min_guests: pkgForm.min_guests ? parseInt(pkgForm.min_guests) : undefined,
        max_guests: pkgForm.max_guests ? parseInt(pkgForm.max_guests) : undefined,
        includes_bartenders: parseInt(pkgForm.includes_bartenders),
        includes_glassware: pkgForm.includes_glassware,
      });
      setEditingPackage(null);
      setPkgForm({
        name: "",
        description: "",
        base_price: "",
        pricing_type: "per_hour",
        min_guests: "",
        max_guests: "",
        includes_bartenders: "1",
        includes_glassware: true,
      });
      alert("Package updated!");
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Failed to update package");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm("Delete this package?")) return;
    try {
      await deletePackage(pkgId);
      alert("Package deleted");
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
    }
  };

  const startEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setPkgForm({
      name: pkg.name,
      description: pkg.description || "",
      base_price: pkg.base_price.toString(),
      pricing_type: pkg.pricing_type,
      min_guests: pkg.min_guests?.toString() || "",
      max_guests: pkg.max_guests?.toString() || "",
      includes_bartenders: pkg.includes_bartenders?.toString() || "1",
      includes_glassware: pkg.includes_glassware ?? true,
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-warm-sand/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-olive-gold text-charcoal"
                : "text-warm-sand hover:text-warm-white hover:bg-warm-sand/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "business" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="label">Business Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your Bar Company"
                  />
                </div>
                <div>
                  <label className="label">Logo</label>
                  <div className="flex items-center gap-4">
                    {form.logo_url ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-warm-sand/30">
                        <img src={form.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, logo_url: "" })}
                          className="absolute top-0 right-0 bg-red-500/80 text-white p-1 rounded-bl text-xs hover:bg-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-warm-sand/30 flex flex-col items-center justify-center cursor-pointer hover:border-olive-gold transition-colors">
                        <Upload className="w-6 h-6 text-warm-sand" />
                        <span className="text-xs text-warm-sand mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setForm({ ...form, logo_url: event.target?.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-warm-sand">
                        Upload your logo (PNG, JPG, SVG)
                      </p>
                      <p className="text-xs text-warm-sand/60 mt-1">
                        Recommended: 400x400px or larger
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tell customers about your bar services, experience, and style..."
                    rows={4}
                  />
                  <p className="text-xs text-warm-sand mt-1">
                    This appears on your public profile and marketplace listing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-warm-sand/20">
            <CardHeader>
              <CardTitle className="text-warm-white">Public Profile Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-warm-sand/5 rounded-lg">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-contain" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-warm-sand/20 flex items-center justify-center">
                      <span className="text-warm-sand text-2xl">🍸</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-warm-white font-bold text-lg">
                      {form.name || "Your Business Name"}
                    </h3>
                    {form.city && (
                      <p className="text-warm-sand text-sm">
                        {form.city}{form.state && `, ${form.state}`}
                      </p>
                    )}
                  </div>
                </div>

                {form.description && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-1">About</h4>
                    <p className="text-warm-white text-sm">{form.description}</p>
                  </div>
                )}

                {(form.phone || form.email) && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-1">Contact</h4>
                    <div className="space-y-1">
                      {form.phone && <p className="text-warm-white text-sm">📞 {form.phone}</p>}
                      {form.email && <p className="text-warm-white text-sm">✉️ {form.email}</p>}
                    </div>
                  </div>
                )}

                {form.service_area && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-1">Service Area</h4>
                    <p className="text-warm-white text-sm">{form.service_area}</p>
                  </div>
                )}

                {form.website && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-1">Website</h4>
                    <p className="text-olive-gold text-sm">{form.website}</p>
                  </div>
                )}

                {(form.instagram || form.facebook || form.twitter) && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-1">Social</h4>
                    <div className="flex gap-2">
                      {form.instagram && <span className="text-olive-gold text-sm">📸 {form.instagram}</span>}
                      {form.facebook && <span className="text-olive-gold text-sm">📘 {form.facebook}</span>}
                      {form.twitter && <span className="text-olive-gold text-sm">🐦 {form.twitter}</span>}
                    </div>
                  </div>
                )}

                {packages.length > 0 && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-2">Packages</h4>
                    <div className="space-y-2">
                      {packages.slice(0, 3).map((pkg) => (
                        <div key={pkg.id} className="flex items-center justify-between p-2 bg-warm-sand/5 rounded">
                          <span className="text-warm-white text-sm">{pkg.name}</span>
                          <span className="text-olive-gold font-medium">${pkg.base_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {galleryItems.filter(g => g.is_public).length > 0 && (
                  <div>
                    <h4 className="text-warm-sand text-sm font-medium mb-2">Gallery</h4>
                    <div className="grid grid-cols-3 gap-1">
                      {galleryItems.filter(g => g.is_public).slice(0, 6).map((item) => (
                        <div key={item.id} className="aspect-square rounded overflow-hidden bg-warm-sand/10">
                          <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "contact" && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="label">Phone Number</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@yourbar.com"
                  type="email"
                />
              </div>
              <div>
                <label className="label">Street Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">City</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="label">ZIP</label>
                  <Input
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "social" && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="label">
                  <Globe className="w-4 h-4 inline mr-1" /> Website
                </label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yourbar.com"
                />
              </div>
              <div>
                <label className="label">
                  <Instagram className="w-4 h-4 inline mr-1" /> Instagram
                </label>
                <Input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@yourbar"
                />
              </div>
              <div>
                <label className="label">
                  <Facebook className="w-4 h-4 inline mr-1" /> Facebook
                </label>
                <Input
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourbar"
                />
              </div>
              <div>
                <label className="label">
                  <Twitter className="w-4 h-4 inline mr-1" /> Twitter
                </label>
                <Input
                  value={form.twitter}
                  onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                  placeholder="@yourbar"
                />
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <label className="label">
                    <DollarSign className="w-4 h-4 inline mr-1" /> Default Hourly Rate (per bartender)
                  </label>
                  <Input
                    value={form.default_hourly_rate}
                    onChange={(e) => setForm({ ...form, default_hourly_rate: e.target.value })}
                    placeholder="50"
                    type="number"
                  />
                  <p className="text-xs text-warm-sand mt-1">
                    Used as default when creating quotes and assigning staff
                  </p>
                </div>
                <div>
                  <label className="label">
                    <Clock className="w-4 h-4 inline mr-1" /> Minimum Booking Hours
                  </label>
                  <Input
                    value={form.minimum_booking_hours}
                    onChange={(e) => setForm({ ...form, minimum_booking_hours: e.target.value })}
                    placeholder="2"
                    type="number"
                  />
                  <p className="text-xs text-warm-sand mt-1">
                    Smallest number of hours a client can book
                  </p>
                </div>
                <div>
                  <label className="label">
                    <MapPin className="w-4 h-4 inline mr-1" /> Service Area
                  </label>
                  <Textarea
                    value={form.service_area}
                    onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                    placeholder="City, counties, or regions you serve..."
                    rows={3}
                  />
                  <p className="text-xs text-warm-sand mt-1">
                    Areas where you offer mobile bar services (appears on public profile)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pricing Packages</CardTitle>
              <Button onClick={() => setShowPackageForm(true)} variant="secondary" className="text-sm">
                + Add Package
              </Button>
            </CardHeader>
            <CardContent>
              {packages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-warm-sand mb-4">No packages created yet</p>
                  <p className="text-warm-sand text-sm">Create packages to offer predefined service tiers to clients</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-warm-white font-medium">{pkg.name}</h4>
                          <p className="text-olive-gold font-bold text-lg">${pkg.base_price}
                            <span className="text-warm-sand text-sm font-normal">
                              {pkg.pricing_type === "per_hour" ? "/hr" : pkg.pricing_type === "per_person" ? "/person" : ""}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEditPackage(pkg)} className="p-1.5 text-warm-sand hover:text-warm-white">
                            Edit
                          </button>
                          <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 text-warm-sand hover:text-red-400">
                            Delete
                          </button>
                        </div>
                      </div>
                      {pkg.description && (
                        <p className="text-warm-sand text-sm mb-3">{pkg.description}</p>
                      )}
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
                  <h4 className="text-warm-white font-medium mb-4">
                    {editingPackage ? "Edit Package" : "Create New Package"}
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="label">Package Name *</label>
                      <Input
                        value={pkgForm.name}
                        onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                        placeholder="e.g., Premium Bar Package"
                      />
                    </div>
                    <div>
                      <label className="label">Price *</label>
                      <Input
                        value={pkgForm.base_price}
                        onChange={(e) => setPkgForm({ ...pkgForm, base_price: e.target.value })}
                        placeholder="150"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="label">Pricing Type</label>
                      <select
                        value={pkgForm.pricing_type}
                        onChange={(e) => setPkgForm({ ...pkgForm, pricing_type: e.target.value })}
                        className="w-full px-3 py-2 bg-charcoal border border-warm-sand/30 rounded-lg text-warm-white"
                      >
                        <option value="per_hour">Per Hour</option>
                        <option value="per_person">Per Person</option>
                        <option value="flat">Flat Rate</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Bartenders Included</label>
                      <Input
                        value={pkgForm.includes_bartenders}
                        onChange={(e) => setPkgForm({ ...pkgForm, includes_bartenders: e.target.value })}
                        placeholder="1"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="label">Min Guests</label>
                      <Input
                        value={pkgForm.min_guests}
                        onChange={(e) => setPkgForm({ ...pkgForm, min_guests: e.target.value })}
                        placeholder="50"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="label">Max Guests</label>
                      <Input
                        value={pkgForm.max_guests}
                        onChange={(e) => setPkgForm({ ...pkgForm, max_guests: e.target.value })}
                        placeholder="100"
                        type="number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Description</label>
                      <Textarea
                        value={pkgForm.description}
                        onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                        placeholder="What's included in this package..."
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pkgForm.includes_glassware}
                        onChange={(e) => setPkgForm({ ...pkgForm, includes_glassware: e.target.checked })}
                        className="w-4 h-4 accent-olive-gold"
                      />
                      <span className="text-warm-sand text-sm">Includes glassware</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={editingPackage ? handleUpdatePackage : handleCreatePackage} disabled={saving}>
                      {saving ? "Saving..." : editingPackage ? "Update Package" : "Create Package"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowPackageForm(false);
                        setEditingPackage(null);
                        setPkgForm({
                          name: "",
                          description: "",
                          base_price: "",
                          pricing_type: "per_hour",
                          min_guests: "",
                          max_guests: "",
                          includes_bartenders: "1",
                          includes_glassware: true,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "gallery" && (
        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-warm-sand text-sm mb-4">
              Showcase your events, drinks, menus, and more. Control visibility for each photo.
            </p>
            
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap mb-4">
                {mediaTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMediaFilter(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      mediaFilter === type.value
                        ? "bg-olive-gold text-charcoal"
                        : "text-warm-sand bg-warm-sand/10 hover:text-warm-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-warm-sand/30 rounded-lg cursor-pointer hover:border-olive-gold transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 text-warm-sand" />
                  <span className="text-sm text-warm-sand mt-1">Upload Photos</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    setUploading(true);
                    for (const file of files) {
                      try {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const base64 = event.target?.result as string;
                          await createGalleryItem(organization.id, {
                            file_data: base64,
                            file_name: file.name,
                            type: mediaFilter === "all" ? "other" : mediaFilter,
                            is_public: true,
                          });
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        console.error("Error uploading:", error);
                      }
                    }
                    setUploading(false);
                  }}
                />
              </label>
            </div>

            {galleryItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-warm-sand">No photos yet. Upload images to showcase your work.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-warm-sand text-sm">
                    Drag photos to reorder • {galleryItems.filter(i => i.is_public).length} public
                  </p>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-sm text-olive-gold hover:text-warm-white"
                  >
                    {editMode ? "Done" : "Edit Order"}
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems
                    .filter((item) => mediaFilter === "all" || item.type === mediaFilter)
                    .map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`relative group ${editMode ? 'cursor-move' : ''}`}
                        draggable={editMode}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
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
                        }}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-warm-sand/10 border-2 border-transparent hover:border-olive-gold transition-colors">
                          <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                          {item.is_featured && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-olive-gold text-charcoal text-xs rounded font-medium">
                              ★ Featured
                            </div>
                          )}
                          {editMode && (
                            <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
                              <span className="text-warm-white font-medium">#{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                          <span className="px-2 py-1 bg-charcoal/80 text-warm-white text-xs rounded">
                            {mediaTypes.find((t) => t.value === item.type)?.label}
                          </span>
                          <span className={`px-2 py-1 bg-charcoal/80 text-xs rounded ${item.is_public ? "text-olive-gold" : "text-warm-sand"}`}>
                            {item.is_public ? "Public" : "Private"}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async () => {
                              try {
                                await updateGalleryItem(item.id, { is_featured: !item.is_featured });
                              } catch (error) {
                                console.error("Error toggling featured:", error);
                              }
                            }}
                            className={`p-1 rounded text-xs ${item.is_featured ? "bg-olive-gold text-charcoal" : "bg-charcoal/80 text-warm-white"}`}
                            title={item.is_featured ? "Remove from featured" : "Add to featured"}
                          >
                            ★
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await updateGalleryItem(item.id, { is_public: !item.is_public });
                              } catch (error) {
                                console.error("Error toggling visibility:", error);
                              }
                            }}
                            className="p-1 bg-charcoal/80 text-warm-white rounded text-xs"
                            title={item.is_public ? "Make private" : "Make public"}
                          >
                            {item.is_public ? "🔒" : "👁"}
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Delete this photo?")) {
                                try {
                                  await deleteGalleryItem(item.id);
                                } catch (error) {
                                  console.error("Error deleting:", error);
                                }
                              }
                            }}
                            className="p-1 bg-red-500/80 text-white rounded text-xs"
                          >
                            ✕
                          </button>
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
            <p className="text-warm-sand text-sm mb-4">
              Upload important business documents like insurance, licenses, and permits.
            </p>
            
            {!showDocForm ? (
              <Button onClick={() => setShowDocForm(true)} className="flex items-center gap-2 mb-6">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            ) : (
              <div className="mb-6 p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20">
                <h4 className="text-warm-white font-medium mb-4">Add New Document</h4>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="label">Document Name *</label>
                    <Input
                      value={docForm.name}
                      onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                      placeholder="e.g., General Liability Insurance 2024"
                    />
                  </div>
                  <div>
                    <label className="label">Document Type *</label>
                    <div className="flex gap-2 flex-wrap">
                      {docTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setDocForm({ ...docForm, type: type.value })}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            docForm.type === type.value
                              ? "bg-olive-gold text-charcoal"
                              : "text-warm-sand bg-warm-sand/10 hover:text-warm-white"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Document File * (PDF, JPG, PNG)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-warm-sand file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-olive-gold file:text-charcoal hover:file:bg-olive-gold/90"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setDocForm({ 
                              ...docForm, 
                              file_data: event.target?.result as string,
                              file_name: file.name
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Expiration Date (optional)</label>
                    <Input
                      value={docForm.expires_at}
                      onChange={(e) => setDocForm({ ...docForm, expires_at: e.target.value })}
                      type="date"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUploadDocument} disabled={uploading}>
                      {uploading ? "Uploading..." : "Save Document"}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDocForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-warm-sand text-center p-4">No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-warm-sand/5 rounded-lg border border-warm-sand/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-olive-gold/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-olive-gold" />
                      </div>
                      <div>
                        <p className="text-warm-white font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-warm-sand capitalize">{doc.type}</span>
                          <span className="text-warm-sand/50">•</span>
                          <span className={`text-sm ${isExpiringSoon(doc.expires_at) ? "text-yellow-400" : "text-warm-sand"}`}>
                            {isExpiringSoon(doc.expires_at) && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            Expires: {formatDate(doc.expires_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-warm-sand hover:text-warm-white"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-warm-sand hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
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
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}