const app = require("./app");
const sequelize = require("./src/config/db");
const env = require("./src/config/env");

require("./src/models/index");

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected");

    app.listen(env.PORT, "0.0.0.0", () => {
      console.log(
        `Server running on port ${env.PORT}`
      );
    });

  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();