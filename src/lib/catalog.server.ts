import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function catalogPublicClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("O catálogo está temporariamente indisponível.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const PUBLIC_VEHICLE_COLUMNS = "id,brand,model,year,color,category,mileage,rental_price_cents,rental_periodicity,status,description,features,transmission,fuel_type,catalog_order,show_in_catalog,vehicle_photos(id,url,is_primary,position)";