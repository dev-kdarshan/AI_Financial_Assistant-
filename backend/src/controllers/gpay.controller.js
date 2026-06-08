const { Transaction, Expense } = require("../models/index");
const gpayService = require("../services/gpay.service");

exports.importGpay = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please upload your GPay activity.html file",
      });
    }

    // Send file to GPay Python service
    const gpayResult = await gpayService.parseGpayFile(
      req.file.buffer,
      req.file.originalname
    );

    const parsedTransactions = gpayResult.transactions || [];

    if (parsedTransactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No transactions found in the uploaded file",
        data: [],
      });
    }

    const savedTransactions = [];
    const savedExpenses = [];

    for (const txn of parsedTransactions) {
      // Save to transactions table (raw record)
      const transaction = await Transaction.create({
        userId: req.user.id,
        amount: txn.amount || 0,
        type: txn.type || "debit",
        recipient: txn.recipient || null,
        description: txn.description || null,
        date: txn.datetime ? new Date(txn.datetime) : new Date(),
        source: "gpay",
      });

      savedTransactions.push(transaction);

      // Save to expenses table (linked to transaction)
      const expense = await Expense.create({
        userId: req.user.id,
        amount: txn.amount || 0,
        category: "other",
        date: txn.datetime ? new Date(txn.datetime) : new Date(),
        merchantName: txn.recipient || null,
        description: txn.description || null,
        source: "gpay",
        transactionId: transaction.id,
        isAiSuggested: false,
      });

      savedExpenses.push(expense);
    }

    res.status(201).json({
      success: true,
      message: `Imported ${savedTransactions.length} transactions successfully`,
      data: {
        transactions: savedTransactions,
        expenses: savedExpenses,
      },
    });
  } catch (err) {
    next(err);
  }
};