"use client";

import { useRouter } from "next/navigation";

type Quest = {
  title: string;
  level: string;
  minutes: number;
  xp: number;
  steps: string[];
};

const quests: Quest[] = [
  {
    title: "Разгон фокуса",
    level: "Лёгкий",
    minutes: 5,
    xp: 10,
    steps: [
      "Убери телефон в сторону (режим «Не беспокоить»).",
      "Открой одну задачу (только одну).",
      "Запусти таймер и работай без переключений.",
    ],
  },
  {
    title: "Помодоро-челлендж",
    level: "Средний",
    minutes: 25,
    xp: 30,
    steps: [
      "Сформулируй цель: «5 задач / 1 страница / 10 примеров».",
      "25 минут без переключений.",
      "В конце — отметь прогресс и что мешало.",
    ],
  },
  {
    title: "Анти-прокрастинация",
    level: "Лёгкий",
    minutes: 10,
    xp: 15,
    steps: [
      "Запиши 1 маленький следующий шаг.",
      "Сделай его за 10 минут без идеала.",
      "Если пошло — продолжай ещё 5 минут.",
    ],
  },
];

export default function QuestPage() {
  const router = useRouter();

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 6 }}>
        Квесты
      </h1>
      <div style={{ opacity: 0.85, marginBottom: 18 }}>
        Выбирай мини-задание → запускай фокус → получай XP.
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {quests.map((q) => (
          <div
            key={q.title}
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.04)",
              borderRadius: 18,
              padding: 18,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{q.title} ({q.minutes} мин)</div>
                <div style={{ opacity: 0.85 }}>
                  Уровень: {q.level} • Награда: +{q.xp} XP
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem("zeyin.activeQuest.v1", JSON.stringify(q));
                  router.push(`/focus?m=${q.minutes}`);
                }}
                style={{
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.15)",
                  background: "#6d28d9",
                  color: "white",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Начать
              </button>
            </div>

            <div style={{ fontWeight: 800, opacity: 0.95 }}>Шаги:</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9, lineHeight: 1.6 }}>
              {q.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

  