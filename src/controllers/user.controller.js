const userService = require("../services/user.service");

exports.getUserList = async (req, res) => {
  try {
    const { page, limit, search, isactive, status } = req.query;

    const result = await userService.getUserList({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      isactive,
      status:
        status === undefined ? undefined : Number(status)
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message
    });
  }
};
exports.insertUserClientMapping = async (req, res) => {
  try {
    const result = await userService.insertUserClientMapping(
      req.body
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to insert user-client mapping",
      error: err.message,
    });
  }
};