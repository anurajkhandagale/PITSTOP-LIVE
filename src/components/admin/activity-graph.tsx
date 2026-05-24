"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, X, Users, Store, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ActivityEvent = {
  type: "User" | "Garage" | "SOS";
  title: string;
  time: string;
};

export type DayActivity = {
  date: string;
  count: number;
  events: ActivityEvent[];
};

export function ActivityGraph({ data, maxActivity }: { data: DayActivity[]; maxActivity: number }) {
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);

  return (
    <Card className="border-white/5 bg-white/[0.02] overflow-hidden relative">
      <CardHeader className="border-b border-white/5 bg-white/[0.01]">
        <CardTitle className="text-lg flex items-center gap-2 font-outfit italic uppercase">
          <Activity className="w-5 h-5 text-emerald-500" /> Platform Growth Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="flex h-64 items-end gap-2">
          {data.map((day, i) => {
            const height = Math.max((day.count / maxActivity) * 100, 5); // min 5% height
            const isSelected = selectedDay?.date === day.date;
            
            return (
              <div 
                key={i} 
                className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative cursor-pointer"
                onClick={() => {
                  if (day.count > 0) setSelectedDay(day);
                }}
              >
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border border-white/10 text-emerald-400 text-[10px] px-3 py-1.5 rounded-lg font-black z-10 pointer-events-none whitespace-nowrap shadow-xl">
                  {day.count} EVENTS
                </div>
                
                <div className="w-full bg-white/5 rounded-t-lg overflow-hidden relative flex flex-col justify-end h-full group-hover:bg-white/10 transition-colors">
                  <div 
                    className={`w-full transition-all duration-500 ${isSelected ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-emerald-500/50 group-hover:bg-emerald-500'}`} 
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className={`text-[10px] uppercase font-black tracking-widest hidden md:block transition-colors ${isSelected ? 'text-emerald-400' : 'text-white/30 group-hover:text-white/60'}`}>
                  Day {i+1}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Slide-up Details Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-0 inset-x-0 bg-[#080808] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-20 max-h-[80%] flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest">
                  Day {data.findIndex(d => d.date === selectedDay.date) + 1}
                </span>
                <span className="text-white/50 text-sm font-bold">{new Date(selectedDay.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-2 flex-1 scrollbar-none">
              {selectedDay.events.map((evt, idx) => (
                <div key={idx} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                      evt.type === 'User' ? 'bg-primary/20 text-primary' :
                      evt.type === 'Garage' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-amber-500/20 text-amber-500'
                    }`}>
                      {evt.type === 'User' && <Users className="w-5 h-5" />}
                      {evt.type === 'Garage' && <Store className="w-5 h-5" />}
                      {evt.type === 'SOS' && <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{evt.title}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">New {evt.type}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-white/30 uppercase bg-black/50 px-2 py-1 rounded-md border border-white/5">
                    {evt.time}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
