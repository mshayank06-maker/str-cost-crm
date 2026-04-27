export default async function handler(req, res) {
  try {
    const apiKey = process.env.HOSTAWAY_API_KEY;
    const apiSecret = process.env.HOSTAWAY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        error: "Missing Hostaway API keys in Vercel environment variables",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Keys loaded successfully. Ready for Hostaway tasks connection.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}