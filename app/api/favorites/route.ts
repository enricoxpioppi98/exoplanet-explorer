import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

async function getSupabase() {
  const { userId, getToken } = await auth();
  if (!userId) return { supabase: null, userId: null };

  // With native Clerk+Supabase integration, use the session token directly
  const token = await getToken();
  if (!token) return { supabase: null, userId: null };

  return { supabase: createSupabaseClient(token), userId };
}

export async function GET() {
  const { supabase, userId } = await getSupabase();
  if (!supabase || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_planets")
    .select("*")
    .order("saved_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}

export async function POST(request: Request) {
  const { supabase, userId } = await getSupabase();
  if (!supabase || !userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planet = await request.json();
  const { data, error } = await supabase
    .from("saved_planets")
    .insert({
      user_id: userId,
      pl_name: planet.pl_name,
      hostname: planet.hostname,
      pl_rade: planet.pl_rade,
      pl_bmasse: planet.pl_bmasse,
      pl_eqt: planet.pl_eqt,
      pl_orbper: planet.pl_orbper,
      pl_orbsmax: planet.pl_orbsmax,
      disc_year: planet.disc_year,
      disc_method: planet.discoverymethod,
      disc_facility: planet.disc_facility,
      sy_dist: planet.sy_dist,
      sy_pnum: planet.sy_pnum,
      st_teff: planet.st_teff,
      st_rad: planet.st_rad,
      st_mass: planet.st_mass,
      st_spectype: planet.st_spectype,
    })
    .select()
    .single();

  if (error?.code === "23505") {
    return Response.json({ error: "Planet already saved" }, { status: 409 });
  }
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}

export async function DELETE(request: Request) {
  const { supabase } = await getSupabase();
  if (!supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pl_name } = await request.json();
  const { error } = await supabase
    .from("saved_planets")
    .delete()
    .eq("pl_name", pl_name);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ success: true });
}
