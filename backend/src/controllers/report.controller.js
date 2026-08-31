const { Expense, User } = require("../models/index");
const { Op } = require("sequelize");
const axios = require("axios");
const env = require("../config/env");

exports.generateReport = async (req, res, next) => {
  try {
    // Fetch user details
    const user = await User.findByPk(req.user.id);

    // Fetch all non-deleted expenses
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
      },
      order: [["date", "ASC"]],
    });

    if (expenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No expenses found to generate report",
      });
    }

    // Build monthly trend (group by day)
    const trendMap = {};
    expenses.forEach((e) => {
      const day = new Date(e.date).toISOString().split("T")[0];
      trendMap[day] = (trendMap[day] || 0) + e.amount;
    });

    const monthlyTrend = Object.entries(trendMap).map(([day, amount]) => ({
      day,
      amount,
    }));

    // Build payload for report service
    const payload = {
      user_id: user.id,
      monthly_income: user.salary || 0,
      expenses: expenses.map((e) => ({
        category: e.category,
        amount: e.amount,
      })),
      monthly_trend: monthlyTrend,
    };

    // Call report Python service
    const response = await axios.post(
      `${env.REPORT_SERVICE_URL}/generate-report`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );

    const reportData = response.data;

    res.json({
    success: true,
    data: {
        message: reportData.message,
        fileName: reportData.fileName,
        downloadUrl: `${env.REPORT_SERVICE_URL}${reportData.download_url}`,
     },
   });
  } catch (err) {
    next(err);
  }
};
