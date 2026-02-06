const { poolPromise, sql } = require("mssql");

exports.addClient = async (data, createdBy) => {
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
    .input("createdby", sql.Int, createdBy)
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
        'A', @createdby, GETDATE()
      )
    `);

  return result;
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
        AND status='A'
    `);
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
