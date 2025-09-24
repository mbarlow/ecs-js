/**
 * Development Server
 * Simple static file server with live reload for development
 */

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;

    // Default to index.html for root
    if (filePath === "/") {
      filePath = "/index.html";
    }

    // Security: prevent directory traversal
    if (filePath.includes("..")) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      // Try to serve the file
      const file = Bun.file("." + filePath);
      const exists = await file.exists();

      if (!exists) {
        return new Response("Not Found", { status: 404 });
      }

      // Get appropriate content type
      const contentType = getContentType(filePath);

      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    } catch (error) {
      console.error("Server error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

function getContentType(filePath) {
  const ext = filePath.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    case "js":
      return "application/javascript";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "eot":
      return "application/vnd.ms-fontobject";
    default:
      return "text/plain";
  }
}

console.log(`🚀 Development server running at http://localhost:${server.port}`);
console.log("📁 Serving files from current directory");
console.log("🔄 Auto-reload enabled with --hot flag");
console.log("\n🎮 ECS Game Engine Development Environment");
console.log("📖 Open http://localhost:3000 in your browser to start");
console.log("\n⌨️  Controls:");
console.log("   SPACE - Spawn random mob");
console.log("   R - Restart game");
console.log("   P - Pause/Resume");
console.log("   H - Show help");
console.log("\n🛠️  Use Ctrl+C to stop the server");
