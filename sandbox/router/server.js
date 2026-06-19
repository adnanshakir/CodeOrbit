import server from "./src/app.js";

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Router is running at http://0.0.0.0:${PORT}`);
});
