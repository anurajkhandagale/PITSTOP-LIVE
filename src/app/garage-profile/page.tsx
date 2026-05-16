"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createGarageAction, updateGarageAction } from "@/lib/garages";
import { 
  Store, 
  MapPin, 
  Phone, 
  Settings, 
  Save, 
  Loader2, 
  Info,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface GarageProfilePageProps {
  initialGarage?: any;
}

export default function GarageProfilePage({ initialGarage }: GarageProfilePageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(initialGarage?.name || "");
  const [description, setDescription] = useState(initialGarage?.description || "");
  const [services, setServices] = useState(initialGarage?.services || "");
  const [phone, setPhone] = useState(initialGarage?.phone || "");
  const [address, setAddress] = useState(initialGarage?.address || "");
  const [lat, setLat] = useState(initialGarage?.lat || 12.9716); 
  const [lng, setLng] = useState(initialGarage?.lng || 77.5946);
  const [garageImageUrl, setGarageImageUrl] = useState(initialGarage?.garageImageUrl || "");
  const [govIdUrl, setGovIdUrl] = useState(initialGarage?.govIdUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const data = { name, description, services, phone, address, lat, lng, garageImageUrl, govIdUrl };

    try {
      if (initialGarage) {
        await updateGarageAction(initialGarage.id, data);
      } else {
        await createGarageAction(data);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 px-6 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group">
                <Store className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{initialGarage ? "Edit Garage Profile" : "Create Garage Profile"}</h1>
                <p className="text-muted-foreground mt-1">Manage your shop details and location on the map.</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">Shop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Garage Name</label>
                    <Input placeholder="e.g. Sharma Auto Motors" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      placeholder="About your garage..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest italic">Garage Image URL</label>
                    <Input placeholder="https://..." value={garageImageUrl} onChange={(e) => setGarageImageUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest italic text-amber-500">Government ID URL</label>
                    <Input placeholder="https://..." value={govIdUrl} onChange={(e) => setGovIdUrl(e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">Contact & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest"><Phone className="w-3 h-3" /> Phone Number</label>
                      <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono uppercase tracking-widest"><MapPin className="w-3 h-3" /> Address</label>
                      <Input placeholder="123, MG Road, Bangalore" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats / Map Preview */}
            <div className="space-y-6">
              <Card className="border-white/5 bg-white/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg">Geo-Location</CardTitle>
                  <CardDescription>Enter exact coordinates for mapping.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold">LATITUDE</span>
                      <Input type="number" step="any" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold">LONGITUDE</span>
                      <Input type="number" step="any" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-snug">
                      Users within a 10km radius of these coordinates will see your garage on their map.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button type="submit" className="w-full h-14 text-lg gap-2" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                </Button>
                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 text-emerald-500 font-medium">
                    <CheckCircle className="w-4 h-4" /> Profile Updated Successfully!
                  </motion.div>
                )}
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                {initialGarage && (
                  <Button variant="outline" className="w-full border-white/10" asChild>
                    <a href={`/garage/${initialGarage.id}`} target="_blank">View Public Profile <ExternalLink className="ml-2 w-4 h-4" /></a>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
