const router = require("express").Router();
const controller = require("../controllers/user.controller");
router.get(
  "/",
  controller.getUserList
);

module.exports = router;
