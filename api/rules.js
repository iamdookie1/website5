const GIST_RAW_URL =
  "https://gist.githubusercontent.com/iamdookie1/ed4e18ef20b9ffd2f43c29fdee968ed9/raw/";

module.exports = async (req, res) => {
  try {
    const gistResponse = await fetch(`${GIST_RAW_URL}?_=${Date.now()}`, {
      headers: { "User-Agent": "website5-rules-endpoint" },
      cache: "no-store",
    });

    if (!gistResponse.ok) {
      res
        .status(502)
        .send(`Failed to fetch gist (${gistResponse.status} ${gistResponse.statusText})`);
      return;
    }

    const text = await gistResponse.text();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send("Error fetching gist content.");
  }
};
