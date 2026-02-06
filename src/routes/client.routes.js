const router = require("express").Router();
const controller = require("../controllers/client.controller");
const auth = require("../middlewares/auth.middleware");
const {
  uploadClientLogo,
  compressClientLogo
} = require("../middlewares/uploadClientLogo");

router.post(
  "/",
  auth(["ADMIN"]),
  uploadClientLogo,
  compressClientLogo,
  controller.addClient
);

router.put(
  "/:clientCode",
  auth(["ADMIN"]),
  uploadClientLogo,
  compressClientLogo,
  controller.updateClient
);

router.delete(
  "/:clientCode",
  auth(["ADMIN"]),
  controller.disableClient
);

module.exports = router;
