const router = require("express").Router();
const controller = require("../controllers/user.controller");
router.get(
  "/",
  controller.getUserList
);
router.post("/user-client-mapping",controller.insertUserClientMapping);
router.get(
  "/user-client-mapping",
  controller.getUserClientMapping
);
router.post(
  "/user-client-mapping/delete",
  controller.removeUserClientMapping
);


module.exports = router;
