const { poolPromise, sql } = require("../models/db");

exports.addClient = async (data, createdby) => {
  const pool = await poolPromise;

   const result = await pool.request()
    .input("name", sql.VarChar(50), data.name)
    .input("shortcode", sql.VarChar(50), data.shortcode)
    .input("contactperson", sql.VarChar(50), data.contactperson)
    .input("contactnumber", sql.VarChar(20), data.contactnumber)
    .input("domain_url", sql.VarChar(100), data.domain_url)
    .input("clientlogo", sql.VarChar(250), data.clientlogo)
    .input("clientfavicon", sql.VarChar(150), data.clientfavicon)
    .input("layoutid", sql.Int, data.layoutid)
    .input("themeid", sql.Int, data.themeid)
    .input("isallowmultisession", sql.Char(1), data.isallowmultisession)
    .input("createdby", sql.Int, createdby)
    .query(`
      INSERT INTO client_mst (
        name, shortcode, contactperson, contactnumber,
        domain_url, clientlogo, clientfavicon,
        layoutid, themeid, isallowmultisession,
        status, createdby, createddate
      )
      VALUES (
        @name, @shortcode, @contactperson, @contactnumber,
        @domain_url, @clientlogo, @clientfavicon,
        @layoutid, @themeid, @isallowmultisession,
        'Y', @createdby, GETDATE()
      )
      SELECT CAST(SCOPE_IDENTITY() AS INT) AS client_code;
    `);

  return result.recordsets[0][0];
};

exports.addClientWithMapping = async (data, mappedUserId, createdBy) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    /* =========================
       1️⃣ INSERT CLIENT
    ========================= */
    const clientReq = new sql.Request(transaction);

    const clientResult = await clientReq
      .input("name", sql.VarChar(50), data.name)
      .input("shortcode", sql.VarChar(50), data.shortcode)
      .input("contactperson", sql.VarChar(50), data.contactperson)
      .input("contactnumber", sql.VarChar(20), data.contactnumber)
      .input("domain_url", sql.VarChar(100), data.domain_url)
      .input("clientlogo", sql.VarChar(250), data.clientlogo)
      .input("layoutid", sql.Int, data.layoutid)
      .input("themeid", sql.Int, data.themeid)
      .input("isallowmultisession", sql.Char(1), data.isallowmultisession)
      .input("createdby", sql.Int, createdBy)
      .query(`
        INSERT INTO dbo.client_mst (
          name, shortcode, contactperson, contactnumber,
          domain_url, clientlogo,
          layoutid, themeid, isallowmultisession,
          status, createdby, createddate
        )
        VALUES (
          @name, @shortcode, @contactperson, @contactnumber,
          @domain_url, @clientlogo,
          @layoutid, @themeid, @isallowmultisession,
          'Y', @createdby, GETDATE()
        );

        SELECT CAST(SCOPE_IDENTITY() AS INT) AS client_code;
      `);

    const clientCode = clientResult.recordset[0]?.client_code;

    if (!clientCode) {
      throw new Error("Failed to generate client_code");
    }

    /* =========================
       2️⃣ INSERT USER–CLIENT MAPPING
    ========================= */
    const mappingReq = new sql.Request(transaction);

    await mappingReq
      .input("userid", sql.Int, mappedUserId)
      .input("client_code", sql.Int, clientCode)
      .input("createdby", sql.Int, createdBy)
      .query(`
        INSERT INTO dbo.user_client_mapping (
          userid,
          client_code,
          status,
          createddate,
          createdby
        )
        VALUES (
          @userid,
          @client_code,
          'Y',
          GETDATE(),
          @createdby
        )
      `);

    /* =========================
       ✅ COMMIT TRANSACTION
    ========================= */
    await transaction.commit();
    return clientCode;

  } catch (err) {
    /* =========================
       ❌ ROLLBACK ON ERROR
    ========================= */
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }

    console.error("Add Client Service Error:", err);
    throw err; // important: propagate to controller
  }
};


exports.updateClient = async (clientCode, data) => {
  const pool = await poolPromise;

  await pool.request()
    .input("client_code", sql.Int, clientCode)
    .input("name", sql.VarChar(50), data.name)
    .input("shortcode", sql.VarChar(50), data.shortcode)
    .input("contactperson", sql.VarChar(50), data.contactperson)
    .input("contactnumber", sql.VarChar(20), data.contactnumber)
    .input("domain_url", sql.VarChar(100), data.domain_url)
    .input("clientlogo", sql.VarChar(250), data.clientlogo)
    .input("clientfavicon", sql.VarChar(150), data.clientfavicon)
    .input("layoutid", sql.Int, data.layoutid)
    .input("themeid", sql.Int, data.themeid)
    .input("isallowmultisession", sql.Char(1), data.isallowmultisession)
    .query(`
      UPDATE client_mst
      SET
        name=@name,
        shortcode=@shortcode,
        contactperson=@contactperson,
        contactnumber=@contactnumber,
        domain_url=@domain_url,
        clientlogo=@clientlogo,
        clientfavicon=@clientfavicon,
        layoutid=@layoutid,
        themeid=@themeid,
        isallowmultisession=@isallowmultisession
      WHERE client_code=@client_code
        AND status='Y'
    `);
  // console.log("result",result)
};



exports.disableClient = async (clientCode) => {
  const pool = await poolPromise;

  await pool.request()
    .input("client_code", sql.Int, clientCode)
    .query(`
      UPDATE client_mst
      SET status='N'
      WHERE client_code=@client_code
    `);
};


exports.getClientByCode = async (clientCode) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input("client_code", sql.Int, clientCode)
    .query(`
      SELECT
        client_code,
        name,
        shortcode,
        contactperson,
        contactnumber,
        domain_url,
        clientlogo,
        layoutid,
        themeid,
        isallowmultisession,
        status,
        createdby,
        createddate
      FROM dbo.client_mst
      WHERE client_code = @client_code
      `);
  return result.recordset[0] || null;
};

exports.getClientList = async ({ page = 1, limit = 10, search, status }) => {
  const pool = await poolPromise;

  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  if (search) {
    whereClause += `
      AND (
        name LIKE '%' + @search + '%'
        OR shortcode LIKE '%' + @search + '%'
      )
    `;
  }

  if (status) {
    whereClause += " AND status = @status";
  }

  // 👉 Data query
  const dataQuery = `
    SELECT
      client_code,
      name,
      shortcode,
      contactperson,
      contactnumber,
      domain_url,
      clientlogo,
      status,
      createddate,
      isallowmultisession
    FROM dbo.client_mst
    ${whereClause}
    ORDER BY createddate DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

  // 👉 Count query (for pagination)
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM dbo.client_mst
    ${whereClause}
  `;

  const request = pool.request()
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit);

  if (search) request.input("search", sql.VarChar, search);
  if (status) request.input("status", sql.Char(1), status);

  const dataResult = await request.query(dataQuery);
  const countResult = await request.query(countQuery);

  return {
    data: dataResult.recordset,
    pagination: {
      page,
      limit,
      total: countResult.recordset[0].total
    }
  };
};
