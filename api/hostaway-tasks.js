import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. GET HOSTAWAY TOKEN
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
      return res.status(500).json({
        step: "token_error",
        error: tokenData,
      });
    }

    // 2. FETCH HOSTAWAY TASKS
    const tasksRes = await fetch("https://api.hostaway.com/v1/tasks", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const tasksData = await tasksRes.json();
    const tasks = tasksData.result || [];

    // 3. FETCH HOSTAWAY LISTINGS
    const listingsRes = await fetch("https://api.hostaway.com/v1/listings", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const listingsData = await listingsRes.json();
    const listings = listingsData.result || [];

    const listingMap = {};
    listings.forEach((listing) => {
      listingMap[String(listing.id)] = listing.name;
    });

    // 4. FETCH HOSTAWAY → CRM PROPERTY MAP
    const { data: propertyMap, error: mapError } = await supabase
      .from("hostaway_property_map")
      .select("hostaway_listing_id, property_id");

    if (mapError) {
      return res.status(500).json({
        step: "property_map_error",
        error: mapError.message,
      });
    }

    // 5. FETCH CRM PROPERTIES
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name, address");

    if (propertiesError) {
      return res.status(500).json({
        step: "properties_error",
        error: propertiesError.message,
      });
    }

    const mapByHostawayId = {};
    propertyMap.forEach((row) => {
      mapByHostawayId[String(row.hostaway_listing_id)] = row.property_id;
    });

    const propertiesById = {};
    properties.forEach((property) => {
      propertiesById[String(property.id)] = property;
    });

    // 6. FILTER COMPLETED TASKS ONLY
    const completedTasks = tasks.filter((task) =>
      ["completed", "done"].includes(
        String(task.status || "").trim().toLowerCase()
      )
    );

    // 7. MAP TASKS INTO YOUR CRM FORMAT
    const rows = completedTasks.map((task) => {
      const description = task.description || "";
      const title = task.title || "";

      const parsedDetails = extractStructuredTaskDetails(description);

      const jobDoneText = parsedDetails.jobDone || title || description;
      const labourType = detectLabourType(jobDoneText, jobDoneText);
      const rate = getLabourRate(labourType);

      const labourHours = parsedDetails.labourHours || 1;
      const materialCost = parsedDetails.materialCost || 0;

      const labourTotal = labourHours * rate;
      const totalCost = labourTotal + materialCost;

      const hostawayListingId = String(
        task.listingMapId ||
          task.listingId ||
          task.listing?.id ||
          task.listing_map_id ||
          ""
      );

      const hostawayName = listingMap[hostawayListingId] || "";

      const crmPropertyId = mapByHostawayId[hostawayListingId] || null;

      const matchedProperty = crmPropertyId
        ? propertiesById[String(crmPropertyId)]
        : null;

      const completedAt =
        task.completedAt ||
        task.completed_at ||
        task.completionDate ||
        task.completion_date ||
        task.doneAt ||
        task.done_at ||
        task.updatedAt ||
        task.updated_at ||
        task.endDate ||
        task.end_date ||
        task.createdAt ||
        task.created_at ||
        null;

      return {
        id: `HA-${task.id}`,
        external_id: String(task.id),

        property_id: matchedProperty ? matchedProperty.id : null,

        hostaway_listing_id: hostawayListingId,
        hostaway_listing_name: hostawayName,

        crm_property_id: matchedProperty ? matchedProperty.id : null,

        property_name: matchedProperty ? matchedProperty.name : hostawayName,
        property_address: matchedProperty ? matchedProperty.address : "",

        title: title || "Hostaway Task",
        description: description,

        task_name: labourType,
        category: labourType,
        job_done: parsedDetails.jobDone || labourType,

        assigned_to: "Hostaway",
        status: "Completed",

        labour_hours: labourHours,
        labour_rate: rate,
        labour_total: labourTotal,
        material_cost: materialCost,
        total_cost: totalCost,

        completed_at: completedAt,

        invoice_status: "Ready to Invoice",
      };
    });

    // 8. INSERT / UPDATE MAINTENANCE JOBS
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
      message: "Hostaway sync complete",
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      inserted_or_updated: rows.length,
      mapped_jobs: rows.filter((r) => r.crm_property_id).length,
      unmapped_jobs: rows.filter((r) => !r.crm_property_id).length,
      sample_rows: rows.slice(0, 5).map((r) => ({
        id: r.id,
        hostaway_listing_id: r.hostaway_listing_id,
        hostaway_listing_name: r.hostaway_listing_name,
        crm_property_id: r.crm_property_id,
        property_name: r.property_name,
        completed_at: r.completed_at,
        job_done: r.job_done,
        labour_hours: r.labour_hours,
        labour_rate: r.labour_rate,
        labour_total: r.labour_total,
        material_cost: r.material_cost,
        total_cost: r.total_cost,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      step: "server_error",
      error: error.message,
    });
  }
}

/* ---------------- HELPERS ---------------- */

function extractStructuredTaskDetails(description = "") {
  const text = String(description || "");

  const labourHoursMatch = text.match(
    /labou?r\s*hours?\s*:\s*([0-9]+(?:\.[0-9]+)?)/i
  );

  const jobDoneMatch = text.match(
    /what\s*job\s*was\s*done\s*:\s*([\s\S]*?)(?=\n\s*materials?\s*cost\s*:|$)/i
  );

  const materialCostMatch = text.match(
    /materials?\s*cost\s*:\s*£?\s*([0-9]+(?:\.[0-9]+)?)/i
  );

  return {
    labourHours: labourHoursMatch ? Number(labourHoursMatch[1]) : 1,
    jobDone: jobDoneMatch ? jobDoneMatch[1].trim() : "",
    materialCost: materialCostMatch ? Number(materialCostMatch[1]) : 0,
  };
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
    "Freezer / fridge defrost service": 40,
  };

  return rates[taskName] || 40;
}