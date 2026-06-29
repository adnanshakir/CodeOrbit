import 'dotenv/config';
import app from './src/app.js';
import { connectToDB } from './src/cofig/db.js';

connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
