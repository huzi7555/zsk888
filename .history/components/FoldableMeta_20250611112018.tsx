"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FoldableMeta({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        文章信息 {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="mt-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border">
          {children}
        </div>
      )}
    </div>
  );
} 