"use client";

import { useState } from "react";
import { X, ExternalLink, FileBadge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Base64ViewerProps {
  url: string;
  label: string;
  className?: string;
  icon?: any;
}

export function Base64Viewer({ url, label, className, icon: Icon = ExternalLink }: Base64ViewerProps) {
  const [open, setOpen] = useState(false);
  
  // If it's not a data URL, we can safely just use an anchor tag
  if (!url.startsWith("data:")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {label} <Icon className="w-3 h-3" />
      </a>
    );
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setOpen(true)} 
        className={cn("flex items-center gap-1 cursor-pointer transition-colors", className)}
      >
        {label} <Icon className="w-3 h-3" />
      </button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-[#09090b] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-white font-black uppercase italic tracking-widest text-sm">{label}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)} 
                className="text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-black/50 min-h-[300px]">
              {url.startsWith("data:application/pdf") ? (
                <iframe src={url} className="w-full h-[70vh] rounded-xl border border-white/10" />
              ) : (
                <img src={url} alt={label} className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
