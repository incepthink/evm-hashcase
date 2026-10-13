import { cn } from "@/components/lib/utils";
import ContactModal from "./ContactModal";
import { homeFontVariables } from "./fonts";
import "./home.css";

/** Fonts, base colours and the contact modal shared by the marketing pages. */
export default function HomeShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hc-home relative min-h-screen overflow-x-clip", homeFontVariables, className)}>
      {children}
      <ContactModal />
    </div>
  );
}
