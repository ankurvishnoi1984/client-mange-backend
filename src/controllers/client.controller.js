const clientService = require("../services/client.service");

exports.addClient = async (req, res) => {
  try {
    const data = {
      ...req.body,
      clientlogo: req.file ? req.file.filename : null
    };

    const result = await clientService.addClient(data, req.body.createdby);
    console.log(result)
    res.json({ message: "Client added successfully",client_code:result.client_code });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/*exports.addClient = async (req, res) => {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.status(400).json({
        message: "userid is required for client mapping"
      });
    }

    const data = {
      ...req.body,
      clientlogo: req.file ? req.file.filename : null
    };

    const clientCode = await clientService.addClientWithMapping(
      data,
      userid,
      req.body.createdby
    );

    return res.status(201).json({
      message: "Client added successfully",
      client_code: clientCode
    });

  } catch (err) {
    console.error("Add Client Controller Error:", err);

    return res.status(500).json({
      message: "Failed to add client",
      error: err.message
    });
  }
};*/


exports.updateClient = async (req, res) => {
  try {
    const { clientCode } = req.body;

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
    const { clientCode } = req.body;
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
        message: `Client not found with client_code ${clientCode}`
      });
    }

    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getClientList = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;

    const result = await clientService.getClientList({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      status
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch client list",
      error: err.message
    });
  }
};
/*
{
 "data": [
   {
     "client_code": 17684,
     "name": "Acme Corp",
     "shortcode": "ACME",
     "contactperson": "John",
     "contactnumber": "9876543210",
     "domain_url": "https://acme.com",
     "clientlogo": "client_1707051234.webp",
     "status": "A",
     "createddate": "2026-02-05T10:30:00.000Z"
   }
 ],
 "pagination": {
   "page": 1,
   "limit": 10,
   "total": 27
 }
}

*/