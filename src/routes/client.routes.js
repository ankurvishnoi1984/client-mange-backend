const router = require("express").Router();
const controller = require("../controllers/client.controller");
const {
  uploadClientLogo,
  compressClientLogo
} = require("../middlewares/uploadClientLogo");

router.post(
  "/addNewClient",
  uploadClientLogo,
  compressClientLogo,
  controller.addClient
);

router.put(
  "/updateClient/:clientCode",
  uploadClientLogo,
  compressClientLogo,
  controller.updateClient
);

router.delete(
  "/disableClient/:clientCode",
  controller.disableClient
);

router.get(
  "/getClient/:clientCode",
  controller.getClientByCode
);


module.exports = router;
