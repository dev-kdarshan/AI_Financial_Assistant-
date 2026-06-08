const { Expense } = require("../models/index");
const { analyzeExpenses } = require("../services/prediction.service");

exports.getAnalytics = async (req, res, next) => {
  try {
    // Fetch user expenses from DB first
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
      },
      order: [["date", "DESC"]],
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No expenses found to analyze",
        data: null,
      });
    }

    // Forward to analytics Python service
    const result = await analyzeExpenses(expenses);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};