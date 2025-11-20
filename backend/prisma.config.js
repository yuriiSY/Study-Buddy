const { defineConfig } = require("@prisma/config");

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
