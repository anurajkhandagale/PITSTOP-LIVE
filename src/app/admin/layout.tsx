import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Users, Store, AlertTriangle, LayoutDashboard, Settings } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white flex font-inter">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#080808] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <span className="font-black font-outfit uppercase tracking-tighter text-lg">
              PitStop<span className="text-red-500">Admin</span>
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-bold">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-bold">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link href="/admin/garages" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-bold">
            <Store className="w-4 h-4" /> Garages
          </Link>
          <Link href="/admin/requests" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-bold">
            <AlertTriangle className="w-4 h-4" /> SOS Logs
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-bold">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar for mobile */}
        <header className="h-20 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span className="font-black font-outfit uppercase tracking-tighter">Admin</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
