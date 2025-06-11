"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoldableMetaProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  title?: string;
}

export default function FoldableMeta({ 
  children, 
  defaultOpen = false,
  title = "文档信息"
}: FoldableMetaProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-auto p-0 text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          <span className="text-sm">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </div>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 