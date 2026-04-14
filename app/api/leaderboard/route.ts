import { createClient } from "@supabase/supabase-js";

export async function GET() {
  // Use anon key — this query doesn't need auth since we're reading aggregated public data
  // We need a special RLS policy or to use a view for this
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("saved_planets")
    .select("pl_name, hostname, pl_rade, pl_eqt")
    .order("saved_at", { ascending: false });

  if (error) {
    // If RLS blocks this, return empty
    return Response.json([]);
  }

  // Count saves per planet client-side
  const counts = new Map<
    string,
    { pl_name: string; hostname: string | null; pl_rade: number | null; pl_eqt: number | null; saves: number }
  >();

  for (const row of data ?? []) {
    const existing = counts.get(row.pl_name);
    if (existing) {
      existing.saves++;
    } else {
      counts.set(row.pl_name, {
        pl_name: row.pl_name,
        hostname: row.hostname,
        pl_rade: row.pl_rade,
        pl_eqt: row.pl_eqt,
        saves: 1,
      });
    }
  }

  const sorted = Array.from(counts.values())
    .sort((a, b) => b.saves - a.saves)
    .slice(0, 10);

  return Response.json(sorted);
}
