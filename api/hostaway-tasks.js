import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;

    if (!supabaseUrl || !supabaseKey || !accountId || !apiKey) {
      return res.status(500).json({
        error: "Missing environment variables",
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        hasHostawayAccountId: !!accountId,
        hasHostawayApiKey: !!apiKey,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: accountId,
        client_secret: apiKey,
        scope: "general",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(500).json({ step: "token_error", error: tokenData });
    }

    const tasksRes = await fetch("https://api.hostaway.com/v1/tasks", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const tasksData = await tasksRes.json();

    if (!tasksRes.ok) {
      return res.status(500).json({ step: "tasks_error", error: tasksData });
    }

    const tasks = tasksData.result || [];

    const doneTasks = tasks.filter((task) => {
      const status = String(task.status || "").trim().toLowerCase();
      return status === "done";
    });

    const rows = doneTasks.map((task) => ({
      id: `HA-${task.id}`,
      external_id: String(task.id),
      property_id: String(task.listingMapId || ""),
      property_name: task.title || "Hostaway Task",
      property_address: "",
      title: task.title || "Hostaway Maintenance Task",
      description: task.description || "",
      task_name: "Hostaway Done Task",
      category: "Maintenance",
      assigned_to: "Hostaway",
      status: "Completed",
      labour_hours: 1,
      labour_rate: 0,
      material_cost: 0,
      invoice_status: "Not Started",
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from("maintenance_jobs")
        .upsert(rows, { onConflict: "id" });

      if (error) {
        return res.status(500).json({
          step: "supabase_insert_error",
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      message: "Hostaway done tasks synced",
      total_tasks: tasks.length,
      done_tasks: doneTasks.length,
      inserted_or_updated: rows.length,
    });
  } catch (error) {
    return res.status(500).json({
      step: "server_crash",
      error: error.message,
    });
  }
}