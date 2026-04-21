"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuardContext } from "@/app/components/AuthGate";
import { supabase } from "@/lib/supabaseClient";
import type { ProfileRole } from "@/lib/useAuthGuard";

type Post = {
  id: string;
  author: string;
  role: ProfileRole;
  text: string;
  createdAt: number;
};

const LS_POSTS = "zeyin.community.posts.v1";

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  return `${d} дн назад`;
}

function safeAuthor(a: string) {
  const v = (a ?? "").trim();
  return v.length ? v : "Unknown";
}

function CommunityContent() {
  const { profile, logout } = useAuthGuardContext();
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState<ProfileRole>("Parent");
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setAuthor(profile.name ?? "User");
    setRole(profile.role ?? "Parent");
  }, [profile]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }

        if (data) {
          setPosts(
            data.map((p: any) => ({
              id: p.id,
              author: safeAuthor(p.author),
              role: (p.role as ProfileRole) || "Parent",
              text: p.text || "",
              createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const canPost = useMemo(() => text.trim().length >= 5, [text]);

  async function addPost() {
    if (!canPost) return;
    
    const newPost = {
      author: safeAuthor(author),
      role,
      text: text.trim(),
      // Let Supabase handle the ID and created_at timestamp defaults
    };

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([newPost])
        .select()
        .single();

      if (error) {
        console.error("Error adding post:", error);
        alert("Failed to share post. Do you have a 'posts' table created in Supabase?");
        return;
      }

      if (data) {
        const p: Post = {
          id: data.id,
          author: safeAuthor(data.author),
          role: (data.role as ProfileRole) || "Parent",
          text: data.text || "",
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
        };
        setPosts((prev) => [p, ...prev]);
        setText("");
      }
    } catch (err) {
      console.error("Failed to insert post", err);
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistically remove from UI
    setPosts((prev) => prev.filter((x) => x.id !== id));
    
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete post:", error);
        alert("Delete failed! You likely don't have permission to delete rows in Supabase.");
        // We could revert the UI state here by re-fetching, but an alert is enough for the prototype
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    logout();
  };

  return (
    <div style={{ padding: "24px 20px", maxWidth: "800px", margin: "0 auto", paddingBottom: 100 }}>
       {/* Sleek Header */}
       <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Community</div>
          <h1 style={{ fontSize: "24px", fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: "0.02em" }}>Achievements</h1>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            height: 32,
            padding: "0 16px",
            borderRadius: 16,
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontWeight: 400,
            cursor: loggingOut ? "not-allowed" : "pointer",
            fontSize: 12,
            letterSpacing: "0.05em"
          }}
        >
          {loggingOut ? "LOGGING OUT…" : "SIGN OUT"}
        </button>
      </div>

      <div
        style={{
          border: "1px solid var(--color-border)",
          background: "var(--color-card-bg)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          backdropFilter: "blur(12px)"
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "white",
              outline: "none",
              flex: 1,
              minWidth: 140,
              fontSize: 13
            }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProfileRole)}
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "white",
              color: "var(--color-text-primary)",
              outline: "none",
              flex: 1,
              fontSize: 13,
              appearance: "none"
            }}
          >
              <option value="Parent" style={{ color: "#000" }}>Supporter</option>
              <option value="Teacher" style={{ color: "#000" }}>Coach</option>
              <option value="Relative" style={{ color: "#000" }}>Friend</option>
          </select>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share encouragement..."
          rows={2}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-primary)",
            fontSize: 14,
            outline: "none",
            resize: "none",
            marginBottom: 16
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <button
            onClick={addPost}
            disabled={!canPost}
            style={{ 
              background: canPost ? "var(--color-sage)" : "rgba(0,0,0,0.05)",
              border: "none",
              color: canPost ? "white" : "var(--color-text-muted)",
              padding: "10px 24px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              cursor: canPost ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >
            SHARE
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {posts.map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--color-card-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: 20,
              backdropFilter: "blur(12px)",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 500,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--color-text-primary)",
                    fontSize: 14,
                  }}
                >
                  {safeAuthor(p.author).slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: "var(--color-text-primary)", fontSize: 13, letterSpacing: "0.02em" }}>
                    {safeAuthor(p.author).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-muted)", fontSize: 11, marginTop: 4 }}>
                    <span style={{ color: "var(--color-accent)", textTransform: "uppercase" }}>{p.role}</span>
                    <span>•</span>
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 {/* Soft Check Badge icon */}
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <polyline points="20 6 9 17 4 12"></polyline>
                 </svg>
                 <button
                   onClick={() => handleDelete(p.id)}
                   style={{ background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 24, height: 24, display: "grid", placeItems: "center", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 10, fontWeight: 700 }}
                 >✕</button>
              </div>
            </div>
            <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, fontSize: 14, fontWeight: 300 }}>
              {p.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return <CommunityContent />;
}
