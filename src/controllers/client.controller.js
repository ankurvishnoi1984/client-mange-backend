const clientService = require("../services/client.service");

exports.addClient = async (req, res) => {
  try {
    const data = {
      ...req.body,
      clientlogo: req.file ? req.file.filename : null
    };

    await clientService.addClient(data, req.user.userId);
    res.json({ message: "Client added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { clientCode } = req.params;

    const data = {
      ...req.body,
      clientlogo: req.file ? req.file.filename : req.body.existingLogo
    };

    await clientService.updateClient(clientCode, data);
    res.json({ message: "Client updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.disableClient = async (req, res) => {
  try {
    const { clientCode } = req.params;
    await clientService.disableClient(clientCode);
    res.json({ message: "Client disabled successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
