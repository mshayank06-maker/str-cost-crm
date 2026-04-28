import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  try {
    // 1. Get access token
    const tokenRes = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.HOSTAWAY_ACCOUNT_ID,
        client_secret: process.env.HOSTAWAY_API_KEY
      })
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      return res.status(400).json({ step: "token_error", tokenData })
    }

    // 2. Fetch tasks
    const tasksRes = await fetch("https://api.hostaway.com/v1/tasks", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })

    const tasksData = await tasksRes.json()

    const tasks = tasksData.result || []

    // 3. Filter ONLY completed tasks
    const completedTasks = tasks.filter(task => task.status === "completed")

    // 4. Insert into CRM
    for (const task of completedTasks) {
      const { data: existing } = await supabase
        .from("maintenance_jobs")
        .select("*")
        .eq("external_id", task.id)
        .single()

      if (!existing) {
        await supabase.from("maintenance_jobs").insert({
          external_id: task.id,
          job: task.title || "Hostaway Task",
          description: task.description || "",
          status: "Completed",
          cost: 0,
          property_id: null // we map later
        })
      }
    }

    return res.status(200).json({
      message: "Tasks synced",
      total: tasks.length,
      completed: completedTasks.length
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}