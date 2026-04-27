export default async function handler(req, res) {
  try {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;

    if (!accountId || !apiKey) {
      return res.status(500).json({
        error: "Missing HOSTAWAY_ACCOUNT_ID or HOSTAWAY_API_KEY",
      });
    }

    const tokenResponse = await fetch("https://api.hostaway.com/v1/accessTokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
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
        hint: "Check that HOSTAWAY_ACCOUNT_ID is the numeric Account ID and HOSTAWAY_API_KEY is the full API key.",
        error: tokenData,
      });
    }

    const tasksResponse = await fetch("https://api.hostaway.com/v1/tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Cache-Control": "no-cache",
      },
    });

    const tasksData = await tasksResponse.json();

    if (!tasksResponse.ok) {
      return res.status(500).json({
        step: "tasks_error",
        error: tasksData,
      });
    }

    const completedTasks = (tasksData.result || []).filter((task) => {
      const status = String(task.status || "").toLowerCase();
      return status === "done" || status === "completed" || status === "finished";
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