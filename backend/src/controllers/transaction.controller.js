const { Transaction, Expense } = require("../models/index");
const { Op } = require("sequelize");

// Add transaction manually
exports.addTransaction = async (req, res, next) => {
  try {
    const { amount, type, recipient, description, date } = req.body;

    if (!amount || !date) {
      return res.status(400).json({
        success: false,
        message: "amount and date are required",
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      amount,
      type: type || "debit",
      recipient: recipient || null,
      description: description || null,
      date,
      source: "manual",
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// Get all transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
      },
      order: [["date", "DESC"]],
    });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// Get transactions by date range
exports.getTransactionsByDate = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      order: [["date", "DESC"]],
    });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// Soft delete transaction
exports.softDeleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await transaction.update({ deletedAt: new Date() });

    await Expense.update(
      { deletedAt: new Date() },
      {
        where: {
          transactionId: transaction.id,
          deletedAt: null,
        },
      }
    );

    res.json({
      success: true,
      message: "Transaction removed successfully",
    });
  } catch (err) {
    next(err);
  }
};
