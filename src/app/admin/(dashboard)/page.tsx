import { auth } from "@/auth";
import { db } from "@/db";
import { usersTable, garagesTable, serviceRequestsTable } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, AlertTriangle, Activity } from "lucide-react";
import { FormattedDate } from "@/components/ui/formatted-date";

export default async function AdminDashboardOverview() {
  const session = await auth();

  // Fetch all data for the admin overview
  const [users, garages, requests] = await Promise.all([
    (db as any).select().from(usersTable),
    (db as any).select().from(garagesTable),
    (db as any).select().from(serviceRequestsTable)
  ]);

  // Dynamic Activity Logic
  const now = new Date();
  const last14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return { date: d.toISOString().split('T')[0], count: 0 };
  });

  const countActivity = (items: any[]) => {
    items.forEach(item => {
      if (!item.createdAt) return;
      const dateStr = new Date(item.createdAt).toISOString().split('T')[0];
      const dayIndex = last14Days.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) {
        last14Days[dayIndex].count++;
      }
    });
  };

  countActivity(users);
  countActivity(garages);
  countActivity(requests);

  const maxActivity = Math.max(...last14Days.map(d => d.count), 1);

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black font-outfit uppercase italic tracking-tighter text-white">
          System <span className="text-red-500">Overview</span>
        </h1>
        <p className="text-white/50 font-medium text-sm">Global metrics and recent activity across the PitStop Live network.</p>
      </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(251,26,26,0.2)]">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Total Users</p>
                <p className="text-4xl font-bold font-outfit text-white">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Active Garages</p>
                <p className="text-4xl font-bold font-outfit text-white">{garages.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">SOS Requests</p>
                <p className="text-4xl font-bold font-outfit text-white">{requests.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Analytics Dashboard */}
        <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
              <Activity className="w-5 h-5 text-emerald-500" /> Platform Growth Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex h-64 items-end gap-2">
              {last14Days.map((day, i) => {
                const height = Math.max((day.count / maxActivity) * 100, 5); // min 5% height
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border border-white/10 text-emerald-400 text-[10px] px-3 py-1.5 rounded-lg font-black z-10 pointer-events-none whitespace-nowrap shadow-xl">
                      {day.count} EVENTS
                    </div>
                    <div className="w-full bg-white/5 rounded-t-lg overflow-hidden relative flex flex-col justify-end h-full">
                      <div 
                        className="w-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-all duration-500" 
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest hidden md:block">Day {i+1}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Garages Table */}
          <Card className="border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-[500px]">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
                <Store className="w-5 h-5 text-blue-500" /> Registered Garages
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {garages.map((g: any) => (
                <div key={g.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white uppercase italic text-sm">{g.name}</h3>
                    <p className="text-xs text-muted-foreground">{g.phone || "No Phone"}</p>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full font-black uppercase">ID: {g.id}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* SOS Requests Table */}
          <Card className="border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-[500px]">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Emergency Logs
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {requests.map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-sm">{r.vehicleType}</h3>
                      <p className="text-xs text-muted-foreground italic">{r.problem}</p>
                    </div>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/20 text-primary'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium border-t border-white/5 pt-2 mt-1">
                    <span>Garage ID: {r.garageId}</span>
                    <FormattedDate date={r.createdAt} type="both" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
    </div>
  );
}
