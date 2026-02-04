import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/community";
  if (next.startsWith("/login")) return "/community";
  if (next.startsWith("/auth")) return "/community";
  return next;
}

export async function GET(request: NextRequest) {
  // Создаём response, чтобы записывать Set-Cookie
  const response = NextResponse.redirect(new URL("/community", request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  // ВАЖНО: именно ЭТО создаёт cookie-сессию
  const { error } = await supabase.auth.exchangeCodeForSession(request.url);

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("err", "callback");
    return NextResponse.redirect(loginUrl);
  }

  // редиректим туда, куда хотел пользователь
  return NextResponse.redirect(new URL(next, request.url), {
    headers: response.headers, // сохраняем Set-Cookie
  });
}
