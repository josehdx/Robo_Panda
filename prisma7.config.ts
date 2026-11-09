import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Explicitly tell it to load the .env file from the root directory
config({ path: '.env' });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});