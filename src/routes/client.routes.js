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
  "/updateClient",
  uploadClientLogo,
  compressClientLogo,
  controller.updateClient
);

router.post(
  "/disableClient",
  controller.disableClient
);

router.get(
  "/getClient/:clientCode",
  controller.getClientByCode
);


router.get(
  "/getClientList",
  controller.getClientList
);


module.exports = router;
