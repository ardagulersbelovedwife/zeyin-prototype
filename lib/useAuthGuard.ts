"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AUTH_CHECK_TIMEOUT_MS = 7000;

const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
function devLog(step: string, data?: unknown) {
  if (isDev) console.log(`[useAuthGuard] ${step}`, data ?? "");
}

export type ProfileRole = "Parent" | "Teacher" | "Relative";

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: ProfileRole;
};

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectToLogin = useCallback(() => {
    const next = pathname && pathname !== "/login" ? pathname : "/community";
    const url = `/login?next=${encodeURIComponent(next)}`;
    devLog("redirectToLogin", { pathname, url });
    router.replace(url);
    router.refresh();
  }, [router, pathname]);

  const runCheck = useCallback(async () => {
    setError(null);
    setLoading(true);
    let done = false;
    const ensureDone = () => {
      if (!done) {
        done = true;
        setLoading(false);
      }
    };

    const timeoutPromise = new Promise<"timeout">((resolve) => {
      setTimeout(() => resolve("timeout"), AUTH_CHECK_TIMEOUT_MS);
    });

    const doCheck = async (): Promise<"ok"> => {
      devLog("getSession");
      const { data: sessionData } = await supabase.auth.getSession();
      devLog("getSession result", { hasSession: !!sessionData?.session });

      if (!sessionData?.session) {
        ensureDone();
        redirectToLogin();
        return "ok";
      }

      const userId = sessionData.session.user.id;
      const email = sessionData.session.user.email ?? "";
      devLog("select profiles", { userId });
      const { data: row, error: selectError } = await supabase
        .from("profiles")
        .select("id, email, name, role")
        .eq("id", userId)
        .single();

      if (selectError) {
        devLog("profiles select error (RLS or missing row)", selectError);
        const { error: upsertError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            email,
            name: sessionData.session.user.user_metadata?.name ?? "User",
            role: (sessionData.session.user.user_metadata?.role as ProfileRole) ?? "Parent",
          },
          { onConflict: "id" }
        );
        if (upsertError) {
          devLog("profiles upsert error", upsertError);
          setError(selectError.message || "Профиль не найден. Нет доступа к данным.");
          ensureDone();
          return "ok";
        }
        const { data: row2, error: select2Error } = await supabase
          .from("profiles")
          .select("id, email, name, role")
          .eq("id", userId)
          .single();
        if (select2Error || !row2) {
          setError(select2Error?.message || "Не удалось загрузить профиль.");
          ensureDone();
          return "ok";
        }
        setProfile(row2 as Profile);
        ensureDone();
        return "ok";
      }

      if (!row) {
        setError("Профиль не найден.");
        ensureDone();
        return "ok";
      }

      setProfile(row as Profile);
      ensureDone();
      return "ok";
    };

    try {
      const result = await Promise.race([doCheck(), timeoutPromise]);
      if (result === "timeout") {
        devLog("timeout");
        setError("Превышено время ожидания. Проверьте сеть или попробуйте снова.");
        ensureDone();
      }
    } catch (e) {
      devLog("exception", e);
      setError(e instanceof Error ? e.message : "Ошибка проверки входа");
      ensureDone();
    }
  }, [redirectToLogin]);

  useEffect(() => {
    let isMounted = true;
    runCheck();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        setProfile(null);
        setLoading(false);
        setError(null);
        redirectToLogin();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [runCheck, redirectToLogin]);

  const retry = useCallback(() => {
    setError(null);
    runCheck();
  }, [runCheck]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await supabase.auth.signOut();
    } catch {}
    setProfile(null);
    setLoading(false);
    redirectToLogin();
  }, [redirectToLogin]);

  return { profile, loading, error, retry, logout };
}
