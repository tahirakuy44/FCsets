import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/config", async (req, res) => {
    try {
      const response = await fetch('https://test.iismedika.online/inject/?action=get_config', {
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'priority': 'u=1, i',
          'referer': 'https://test.iismedika.online/inject/',
          'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Microsoft Edge";v="146"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Find the item with name "FLOW"
      let flowData = null;
      if (Array.isArray(data)) {
        flowData = data.find((item: any) => item.name === "FLOW");
      } else if (data && typeof data === 'object') {
        if (data.name === "FLOW") {
          flowData = data;
        } else if (Array.isArray(data.data)) {
          flowData = data.data.find((item: any) => item.name === "FLOW");
        } else {
          flowData = Object.values(data).find((item: any) => item && item.name === "FLOW");
        }
      }

      let finalData = flowData || data;

      // Extract only the cookies array from cookieSets
      if (finalData && Array.isArray(finalData.cookieSets) && finalData.cookieSets.length > 0) {
        finalData = finalData.cookieSets;
      }

      res.json({ success: true, data: finalData });
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
