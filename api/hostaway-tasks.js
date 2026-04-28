import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    // 1. Get token
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

    // 2. Fetch tasks
    const tasksRes = await fetch("https://api.hostaway.com/v1/tasks", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const tasksData = await tasksRes.json();
    const tasks = tasksData.result || [];

    // 3. Fetch listings (for property names)
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const listingsData = await listingsRes.json();
    const listings = listingsData.result || [];

    const listingMap = {};
    listings.forEach((l) => {
      listingMap[l.id] = l.name;
    });

    // 4. Filter completed tasks
    const completedTasks = tasks.filter((task) =>
      ["completed", "done"].includes(
        String(task.status || "").trim().toLowerCase()
      )
    );

    // 5. Map tasks correctly (FIXED)
    const rows = completedTasks.map((task) => {
      const details = extractDetails(task.description || "");
      const labourType = detectLabourType(
        task.title || "",
        task.description || ""
      );
      const rate = getLabourRate(labourType);

      return {
        id: `HA-${task.id}`,
        external_id: String(task.id),
        property_id: String(task.listingMapId || ""),
        property_name:
          listingMap[task.listingMapId] ||
          `Property ${task.listingMapId || ""}`,
        property_address: "",
        title: task.title || "Hostaway Maintenance Task",
        description: task.description || "",
        task_name: labourType,
        category: labourType,
        assigned_to: "Hostaway",
        status: "Completed",
        labour_hours: details.labourHours,
        labour_rate: rate,
        material_cost: details.materialCost,
        invoice_status: "Not Started",
      };
    });

    // 6. Insert into Supabase
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

/* ---------------- HELPERS ---------------- */

function extractDetails(description = "") {
  const text = String(description).toLowerCase();

  const hoursMatch = text.match(/(\d+(\.\d+)?)\s*(hour|hours|hr|hrs)/);
  const labourHours = hoursMatch ? Number(hoursMatch[1]) : 1;

  const costMatch = text.match(/£\s*(\d+(\.\d+)?)/);
  const materialCost = costMatch ? Number(costMatch[1]) : 0;

  return { labourHours, materialCost };
}

function detectLabourType(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("light") || text.includes("bulb"))
    return "Light bulb replacement";
  if (text.includes("appliance") || text.includes("reset"))
    return "Appliance check / reset";
  if (text.includes("paint") || text.includes("decor"))
    return "Painting and décor touch-up";
  if (text.includes("sink") || text.includes("clog"))
    return "Clogged sink";
  if (text.includes("lock")) return "Locks / lock adjustment";
  if (text.includes("plumb")) return "Misc plumbing";
  if (text.includes("electric")) return "Misc electrical";
  if (text.includes("floor")) return "Flooring repair";
  if (text.includes("toilet")) return "Toilet blockage";
  if (text.includes("shower") || text.includes("silicone"))
    return "Shower / silicone reseal";
  if (text.includes("door")) return "Door alignment / easing";
  if (text.includes("curtain") || text.includes("blind"))
    return "Curtain / blind fix";
  if (text.includes("smoke alarm"))
    return "Smoke alarm battery / replacement";
  if (text.includes("extractor"))
    return "Extractor fan clean / minor fix";
  if (text.includes("fridge") || text.includes("freezer"))
    return "Fridge / freezer defrost service";

  return "Misc handyman";
}

function getLabourRate(taskName) {
  const rates = {
    "Light bulb replacement": 10,
    "Appliance check / reset": 40,
    "Painting and décor touch-up": 40,
    "Clogged sink": 40,
    "Locks / lock adjustment": 30,
    "Misc plumbing": 40,
    "Misc electrical": 40,
    "Misc handyman": 40,
    "Flooring repair": 40,
    "Toilet blockage": 30,
    "Shower / silicone reseal": 40,
    "Door alignment / easing": 50,
    "Curtain / blind fix": 40,
    "Smoke alarm battery / replacement": 30,
    "Extractor fan clean / minor fix": 40,
    "Fridge / freezer defrost service": 40,
  };

  return rates[taskName] || 40;
}