import { supabase } from "@/lib/supabaseClient";

export type TherapyDifficulty = "Easy" | "Medium" | "Hard";

export type TherapySessionDraft = {
  goal: string;
  task: string;
  nextStep: string;
  minutes: number;
  difficulty: TherapyDifficulty;
  interventionsUsed: string[];
  startedFromQuest?: boolean;
  questTitle?: string;
  questXp?: number;
};

export type TherapySession = {
  id: string;
  createdAt: string;
  goal: string;
  task: string;
  nextStep: string;
  minutes: number;
  difficulty: TherapyDifficulty;
  interventionsUsed: string[];
  focusRating: number;
  stressRating: number;
  helped: string;
  blocked: string;
  changeNext: string;
  completed: boolean;
  questTitle?: string;
  questXp?: number;
};

const THERAPY_SESSIONS_KEY = "zeyin.therapy.sessions.v1";
const THERAPY_DRAFT_KEY = "zeyin.therapy.draft.v1";
const XP_KEY = "zeyin.xp.v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadTherapyDraft(): TherapySessionDraft | null {
  if (typeof window === "undefined") return null;
  const parsed = safeParse<Partial<TherapySessionDraft>>(
    localStorage.getItem(THERAPY_DRAFT_KEY)
  );
  if (!parsed) return null;
  return {
    goal: String(parsed.goal ?? ""),
    task: String(parsed.task ?? ""),
    nextStep: String(parsed.nextStep ?? ""),
    minutes: Number(parsed.minutes ?? 10),
    difficulty: (parsed.difficulty as TherapyDifficulty) ?? "Medium",
    interventionsUsed: Array.isArray(parsed.interventionsUsed)
      ? parsed.interventionsUsed.map(String)
      : [],
    startedFromQuest: Boolean(parsed.startedFromQuest),
    questTitle: parsed.questTitle ? String(parsed.questTitle) : undefined,
    questXp:
      typeof parsed.questXp === "number" ? parsed.questXp : undefined,
  };
}

export function saveTherapyDraft(draft: TherapySessionDraft): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THERAPY_DRAFT_KEY, JSON.stringify(draft));
}

export function clearTherapyDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(THERAPY_DRAFT_KEY);
}

export function loadTherapySessions(): TherapySession[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<Partial<TherapySession>[]>(
    localStorage.getItem(THERAPY_SESSIONS_KEY)
  );
  if (!parsed) return [];
  return parsed.map((item) => ({
    id: String(item.id ?? crypto.randomUUID()),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
    goal: String(item.goal ?? ""),
    task: String(item.task ?? ""),
    nextStep: String(item.nextStep ?? ""),
    minutes: Number(item.minutes ?? 10),
    difficulty: (item.difficulty as TherapyDifficulty) ?? "Medium",
    interventionsUsed: Array.isArray(item.interventionsUsed)
      ? item.interventionsUsed.map(String)
      : [],
    focusRating: Number(item.focusRating ?? 3),
    stressRating: Number(item.stressRating ?? 3),
    helped: String(item.helped ?? ""),
    blocked: String(item.blocked ?? ""),
    changeNext: String(item.changeNext ?? ""),
    completed: Boolean(item.completed),
    questTitle: item.questTitle ? String(item.questTitle) : undefined,
    questXp: typeof item.questXp === "number" ? item.questXp : undefined,
  }));
}

function saveSessionsToLocal(sessions: TherapySession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THERAPY_SESSIONS_KEY, JSON.stringify(sessions));
}

async function saveSessionToSupabase(
  session: TherapySession
): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const check = await supabase
      .from("therapy_sessions")
      .select("id")
      .limit(1);
    if (check.error) return false;

    const { error } = await supabase.from("therapy_sessions").insert({
      user_id: userData.user.id,
      created_at: session.createdAt,
      goal: session.goal,
      task: session.task,
      next_step: session.nextStep,
      minutes: session.minutes,
      difficulty: session.difficulty,
      interventions_used: session.interventionsUsed,
      focus_rating: session.focusRating,
      stress_rating: session.stressRating,
      helped: session.helped,
      blocked: session.blocked,
      change_next: session.changeNext,
      completed: session.completed,
      quest_title: session.questTitle ?? null,
      quest_xp: session.questXp ?? null,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function saveTherapySession(
  session: TherapySession
): Promise<{ savedToSupabase: boolean }> {
  const existing = loadTherapySessions();
  const next = [session, ...existing].slice(0, 50);
  saveSessionsToLocal(next);

  const savedToSupabase = await saveSessionToSupabase(session);
  return { savedToSupabase };
}

export function addQuestXp(xp: number): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(XP_KEY);
  const current = raw ? Number(raw) : 0;
  const next = current + xp;
  localStorage.setItem(XP_KEY, String(next));
  return next;
}

export function loadXpTotal(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(XP_KEY);
  return raw ? Number(raw) : 0;
}
