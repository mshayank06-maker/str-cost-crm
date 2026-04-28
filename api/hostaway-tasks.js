import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. Get token
    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_API_KEY
      })
    })

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    // 2. Get tasks
    const tasksRes = await fetch("https://api.hostaway.com/v1/tasks", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    const tasksData = await tasksRes.json()
    const tasks = tasksData.result || []

    // 3. Filter DONE tasks
    const doneTasks = tasks.filter(t => t.status === "done")

    // 4. Map to YOUR table structure ONLY
    const mapped = doneTasks.map(task => ({
      id: String(task.id),
      property_id: String(task.listingMapId || "unknown"),
      property_name: `Property ${task.listingMapId || ""}`,
      property_address: "Hostaway Property",
      title: task.title || "Maintenance Task"
    }))

    // 5. Insert
    const { data, error } = await supabase
      .from("maintenance_jobs")
      .upsert(mapped)

    if (error) {
      console.error("INSERT ERROR:", error)
      return res.status(500).json({ error })
    }

    return res.status(200).json({
      message: "Tasks synced",
      total: tasks.length,
      completed: doneTasks.length,
      inserted: mapped.length
    })

  } catch (err) {
    console.error("CRASH:", err)
    res.status(500).json({ error: err.message })
  }
}