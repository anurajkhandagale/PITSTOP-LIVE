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
      
      <CardContent className="p-8 pb-12 relative">
        <div className="w-full h-64 relative group/chart mt-4">
          
          {/* Background SVG Area Chart */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB1A1A" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FB1A1A" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Horizontal 50% Guide Line */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.02)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="90" x2="100" y2="90" stroke="rgba(255,255,255,0.02)" strokeWidth="1" vectorEffect="non-scaling-stroke" />

            <motion.path 
              d={(() => {
                const points = data.map((day, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const normalizedCount = maxActivity > 0 ? day.count / maxActivity : 0;
                  const y = 90 - (normalizedCount * 80); 
                  return { x, y };
                });
                
                const pathData = points.reduce((acc, pt, i, a) => {
                  if (i === 0) return `M ${pt.x},${pt.y}`;
                  const p = a[i - 1];
                  const cp1x = (p.x + pt.x) / 2;
                  const cp1y = p.y;
                  const cp2x = (p.x + pt.x) / 2;
                  const cp2y = pt.y;
                  return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
                }, "");

                return `${pathData} L 100,100 L 0,100 Z`;
              })()} 
              fill="url(#chartGradient)" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            
            <motion.path 
              d={(() => {
                const points = data.map((day, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const normalizedCount = maxActivity > 0 ? day.count / maxActivity : 0;
                  const y = 90 - (normalizedCount * 80); 
                  return { x, y };
                });
                
                return points.reduce((acc, pt, i, a) => {
                  if (i === 0) return `M ${pt.x},${pt.y}`;
                  const p = a[i - 1];
                  const cp1x = (p.x + pt.x) / 2;
                  const cp1y = p.y;
                  const cp2x = (p.x + pt.x) / 2;
                  const cp2y = pt.y;
                  return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
                }, "");
              })()} 
              fill="none" 
              stroke="#FB1A1A" 
              strokeWidth="3" 
              vectorEffect="non-scaling-stroke" 
              className="drop-shadow-[0_0_12px_rgba(251,26,26,0.8)]"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>

          {/* Interactive HTML Points Overlay */}
          {data.map((day, i) => {
            const isSelected = selectedDay?.date === day.date;
            const x = (i / (data.length - 1)) * 100;
            const normalizedCount = maxActivity > 0 ? day.count / maxActivity : 0;
            const y = 90 - (normalizedCount * 80); 

            return (
              <motion.div 
                key={`point-${i}`}
                className="absolute top-0 bottom-0 cursor-pointer group flex flex-col items-center z-10"
                style={{ 
                  left: `calc(${x}% - ${100 / 26}%)`, 
                  width: `${100 / 13}%` 
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                onClick={() => day.count > 0 && setSelectedDay(day)}
              >
                {/* Vertical Grid Line */}
                <div className="absolute inset-y-0 w-px bg-white/[0.03] group-hover:bg-white/10 transition-colors duration-300 pointer-events-none left-1/2 -translate-x-1/2" />
                
                {day.count > 0 && (
                  <div 
                    className="absolute bg-black/95 border border-primary/30 text-primary text-[10px] px-3 py-1.5 rounded-lg font-black whitespace-nowrap shadow-[0_0_20px_rgba(251,26,26,0.15)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 left-1/2 -translate-x-1/2"
                    style={{ top: `calc(${y}% - 40px)` }}
                  >
                    {day.count} EVENTS
                  </div>
                )}

                {/* Data Point Circle */}
                <div 
                  className="absolute left-1/2 z-10" 
                  style={{ top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={`w-3 h-3 rounded-full border-[2.5px] border-primary shadow-[0_0_10px_rgba(251,26,26,0.5)] transition-all duration-300 group-hover:scale-[1.8] group-hover:bg-primary/20 ${isSelected ? 'scale-[1.8] bg-primary/20 shadow-[0_0_20px_rgba(251,26,26,0.8)]' : 'bg-[#111]'}`} />
                </div>
                
                {/* X-Axis Label */}
                <span className="absolute -bottom-8 text-[10px] uppercase font-black tracking-widest text-white/30 group-hover:text-white/60 transition-colors hidden md:block left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {i % 2 === 0 || i === data.length - 1 ? `Day ${i + 1}` : ''}
                </span>
              </motion.div>
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
