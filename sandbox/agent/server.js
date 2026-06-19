import httpServer from "./src/app.js";

const PORT = process.env.PORT || 3000;


httpServer.listen(PORT, () => {
  console.log(`Agent server is running on port ${PORT}`);
});

