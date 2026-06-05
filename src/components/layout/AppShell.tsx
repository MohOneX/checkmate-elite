import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/stores/profileStore";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Button } from "@/components/ui/Button";

export function Sidebar() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] pt-20 pb-8 bg-surface-elevated/90 backdrop-blur-xl border-r border-glass-stroke shadow-2xl shadow-black/40 z-40">
      <div className="px-6 mb-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border-2 border-glass-stroke mb-4 overflow-hidden shadow-lg shadow-black/50 bg-surface-variant flex items-center justify-center">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <MaterialIcon name="person" className="text-primary text-4xl" />
          )}
        </div>
        <h2 className="font-headline-sm text-headline-sm font-black text-primary">{profile.username}</h2>
        <p className="font-label-mono text-label-mono text-on-surface-variant mt-1">
          ELO {profile.ratings.blitz}
          {profile.title ? ` • ${profile.title}` : ""}
        </p>
      </div>

      <div className="flex flex-col flex-1 gap-1 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "px-4 py-3 flex items-center gap-3 font-label-mono text-label-mono transition-all duration-200 rounded-lg",
                isActive
                  ? "bg-gold-muted text-primary border-l-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface",
              )
            }
          >
            {({ isActive }) => (
              <>
                <MaterialIcon name={item.icon} filled={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-4 mt-auto pt-6 border-t border-glass-stroke mx-4">
        <Button className="w-full" onClick={() => navigate("/play")}>
          New Game
        </Button>
        <div className="flex flex-col gap-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "text-on-surface-variant px-4 py-2 flex items-center gap-3 font-label-mono text-label-mono rounded transition-all",
                isActive ? "text-primary bg-gold-muted" : "hover:bg-surface-variant/50 hover:text-on-surface",
              )
            }
          >
            <MaterialIcon name="settings" />
            <span>Settings</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "text-on-surface-variant px-4 py-2 flex items-center gap-3 font-label-mono text-label-mono rounded transition-all",
                isActive ? "text-primary bg-gold-muted" : "hover:bg-surface-variant/50 hover:text-on-surface",
              )
            }
          >
            <MaterialIcon name="person" />
            <span>Profile</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface flex h-screen overflow-hidden">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex-1 md:ml-[280px] flex flex-col h-full overflow-hidden relative"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        {children}
      </motion.main>
    </div>
  );
}
