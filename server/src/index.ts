import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(config.PORT, () => {
    console.log(`🚀 BorrowBox Server is running at http://localhost:${config.PORT}`);
    console.log(`📦 REST API mounted at http://localhost:${config.PORT}/api/v1`);
    console.log(`🤖 AI Engine configured for model: ${config.GEMINI_MODEL}`);
  });
};

startServer();
