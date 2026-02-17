const router = require("express").Router();
const controller = require("../controllers/user.controller");
router.get(
  "/",
  controller.getUserList
);
router.post("/user-client-mapping",controller.insertUserClientMapping)

module.exports = router;
