import { Link } from "wouter";
import { Shield } from "lucide-react";
import { getAuth, clearAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const auth = getAuth();

  const handleLogout = () => {
    clearAuth();
    setLocation("/");
  };

  return (
    <header className="border-b bg-primary text-primary-foreground sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Shield className="h-6 w-6 text-accent" />
          <div className="flex flex-col">
            <span className="font-bold leading-tight tracking-tight">HAL</span>
            <span className="text-[10px] uppercase tracking-wider text-primary-foreground/70 leading-none">Security Portal</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/track" className="text-sm font-medium hover:text-accent transition-colors">
            Track Request
          </Link>
          {auth ? (
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm font-medium hover:text-accent transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-2 pl-4 border-l border-primary-foreground/20">
                <span className="text-xs text-primary-foreground/70">{auth.role.replace("_", " ").toUpperCase()}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10">
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <Link href="/admin/login" className="text-sm font-medium hover:text-accent transition-colors">
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
