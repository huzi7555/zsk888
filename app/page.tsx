import { Logo } from "@/components/Logo"
import { QuickActions } from "@/components/QuickActions"
import { SearchInput } from "@/components/SearchInput"

export default function HomePage() {
  return (
    <div className="absolute inset-0 left-[84px] flex flex-col items-center justify-center -translate-y-16">
      <Logo />
      <SearchInput />
      <QuickActions />
    </div>
  );
}
