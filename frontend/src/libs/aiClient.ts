export async function askAI(prompt: string): Promise<string> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const res = await fetch(`${base}/api/ai/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "AI request failed");
  return data.answer;
}