import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getAllThemeConfigs, getAllUploadedImages } from "../db";

/**
 * Fetch siteConfig from the DB and return an inline <script> tag that sets
 * window.__INITIAL_CONFIG__ before React mounts.  This eliminates the
 * "flash of default content" caused by the client-side tRPC round-trip.
 */
async function buildInitialConfigScript(): Promise<string> {
  try {
    const [configs, images] = await Promise.all([
      getAllThemeConfigs(),
      getAllUploadedImages(),
    ]);
    const result: Record<string, unknown> = { uploadedImages: images };
    for (const [key, value] of Object.entries(configs)) {
      try { result[key] = JSON.parse(value); } catch { result[key] = value; }
    }
    // Escape </script> sequences to prevent XSS
    const json = JSON.stringify(result).replace(/<\/script>/gi, "<\\/script>");
    return `<script>window.__INITIAL_CONFIG__ = ${json};</script>`;
  } catch (e) {
    console.error("[vite] Failed to build initial config:", e);
    return "";
  }
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      // Inject server-fetched config before React mounts
      const configScript = await buildInitialConfigScript();
      template = template.replace("</head>", `${configScript}\n</head>`);

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // For production: inject config into every HTML response
  app.use("*", async (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    try {
      let html = await fs.promises.readFile(indexPath, "utf-8");
      const configScript = await buildInitialConfigScript();
      html = html.replace("</head>", `${configScript}\n</head>`);
      res.set("Content-Type", "text/html").send(html);
    } catch {
      res.sendFile(indexPath);
    }
  });
}
