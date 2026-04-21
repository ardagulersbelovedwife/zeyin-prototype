"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export type ProfileRole = "Parent" | "Teacher" | "Relative";

export type Profile = {
  email: string | null;
  name?: string;
  role?: ProfileRole;
};

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({ email: null });

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      const session = data.session;

      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/community")}`);
        return;
      }

      setProfile({ 
        email: session.user.email ?? null,
        name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'User'
      });
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [pathname, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return { loading, profile, logout };
}
