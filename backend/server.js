const app = require("./app");
const env = require("./src/config/env");

const {
  sequelize,
} = require("./src/models");

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected");

    await sequelize.sync();

    console.log("Database tables synced successfully");

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