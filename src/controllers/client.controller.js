const clientService = require("../services/client.service");

exports.addClient = async (req, res) => {
  try {
    const data = {
      ...req.body,
      clientlogo: req.file ? req.file.filename : null
    };

    const result= await clientService.addClient(data, req.body.createdby);
    res.json({ message: "Client added successfully",_id:result.recordset[0].client_code });
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

exports.getClientByCode = async (req, res) => {
  try {
    const { clientCode } = req.params;

    const client = await clientService.getClientByCode(clientCode);

    if (!client) {
      return res.status(404).json({
        message: "Client not found"
      });
    }

    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
