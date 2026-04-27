export default async function handler(req, res) {
  try {
    const accountId = process.env.HOSTAWAY_API_SECRET;
    const apiKey = process.env.HOSTAWAY_API_KEY;

    // 1. Get access token
    const tokenResponse = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: accountId,
        client_secret: apiKey,
        scope: "general",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(500).json({
        step: "token_error",
        error: tokenData,
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch tasks
    const tasksResponse = await fetch("https://api.hostaway.com/v1/tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tasksData = await tasksResponse.json();

    if (!tasksResponse.ok) {
      return res.status(500).json({
        step: "tasks_error",
        error: tasksData,
      });
    }

    // 3. FILTER ONLY COMPLETED TASKS
    const completedTasks = (tasksData.result || []).filter((task) => {
      const status = (task.status || "").toLowerCase();

      return (
        status === "done" ||
        status === "completed" ||
        status === "finished"
      );
    });

    return res.status(200).json({
      ok: true,
      total_tasks: tasksData.result?.length || 0,
      completed_tasks: completedTasks.length,
      data: completedTasks,
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}