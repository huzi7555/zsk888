import SideBar from "@/app/components/SideBar";
import { useState } from "react";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-screen">
      <SideBar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
} 