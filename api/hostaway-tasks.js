import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_API_KEY,
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
    const tasks = tasksData.result || [];

    const completedTasks = tasks.filter(
      (task) => String(task.status || "").trim().toLowerCase() === "completed"
    );

    const rows = completedTasks.map((task) => ({
      id: `HA-${task.id}`,
      external_id: String(task.id),
      property_id: String(task.listingMapId || ""),
      property_name: `Hostaway Property ${task.listingMapId || ""}`,
      property_address: "",
      title: task.title || "Hostaway Maintenance Task",
      description: task.description || "",
      task_name: "Hostaway Completed Task",
      category: "Maintenance",
      assigned_to: "Hostaway",
      status: "Completed",
      labour_hours: 1,
      labour_rate: 0,
      material_cost: 0,
      invoice_status: "Not Started",
    }));

    const { error } = await supabase
      .from("maintenance_jobs")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      return res.status(500).json({
        step: "supabase_insert_error",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Hostaway completed tasks synced",
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      inserted_or_updated: rows.length,
    });
  } catch (error) {
    return res.status(500).json({
      step: "server_error",
      error: error.message,
    });
  }
}