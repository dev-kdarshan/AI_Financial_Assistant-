const User = require("../models/User.model");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, salary } = req.body;

    await User.update(
      { name, phone, salary },
      { where: { id: req.user.id } }
    );

    res.json({ message: "Profile updated" });
  } catch (err) {
    next(err);
  }
};