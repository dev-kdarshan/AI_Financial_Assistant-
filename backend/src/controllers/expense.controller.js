const { Expense } = require("../models/index");
const { Op } = require("sequelize");
const ocrService = require("../services/ocr.service");

// Add expense manually
exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, date, merchantName, description } = req.body;

    const expense = await Expense.create({
      userId: req.user.id,
      amount,
      category,
      date,
      merchantName,
      description,
      source: "manual",
      slipUrl: null,
      isAiSuggested: false,
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Update expense
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const { amount, category, date, merchantName, description } = req.body;

    await expense.update({
      amount: amount !== undefined ? amount : expense.amount,
      category: category !== undefined ? category : expense.category,
      date: date !== undefined ? date : expense.date,
      merchantName:
        merchantName !== undefined ? merchantName : expense.merchantName,
      description:
        description !== undefined ? description : expense.description,
    });

    res.json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Add expense via OCR (slip scan)
exports.addExpenseFromOCR = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Call OCR service with file buffer
    const ocrResult = await ocrService.extractFromSlip(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Save expense using OCR result
    const expense = await Expense.create({
      userId: req.user.id,
      amount: ocrResult.amount || 0,
      category: ocrResult.category || "other",
      date: ocrResult.date ? new Date(ocrResult.date) : new Date(),
      merchantName: ocrResult.merchant || null,
      description: ocrResult.raw_text || null,
      source: "ocr",
      slipUrl: req.file.originalname,
      isAiSuggested: false,
    });

    res.status(201).json({
      success: true,
      data: expense,
      ocr_raw: ocrResult,
    });
  } catch (err) {
    next(err);
  }
};

// Get all expenses for logged in user
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        deletedAt: null,
      },
      order: [["date", "DESC"]],
    });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// Get single expense by id
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Soft delete expense
exports.softDeleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        deletedAt: null,
      },
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.update({ deletedAt: new Date() });

    res.json({
      success: true,
      message: "Expense removed successfully",
    });
  } catch (err) {
    next(err);
  }
};
