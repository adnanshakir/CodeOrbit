import axios from "axios";

try {
  const res = await axios.get("http://127.0.0.1/list-files", {
    headers: {
      Host: "019e3b71-a53c-74ca-8994-de103665e0f0.agent.localhost",
    },
  });

  console.log(res.data);
} catch (err) {
  console.error(err.message);
}
