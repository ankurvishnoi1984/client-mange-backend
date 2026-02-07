const { poolPromise, sql } = require("../models/db");

exports.getUserList = async ({
    page = 1,
    limit = 0,
    search,
    isactive,
    status
}) => {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";

    if (search) {
        whereClause += `
      AND (
        username LIKE '%' + @search + '%'
        OR displayname LIKE '%' + @search + '%'
      )
    `;
    }

    if (isactive) {
        whereClause += " AND isactive = @isactive";
    }

    if (status !== undefined) {
        whereClause += " AND status = @status";
    }

    /* =========================
       DATA QUERY
    ========================= */
    const dataQuery = `
    SELECT
      userid,
      username,
      displayname,
      ipaddress,
      isactive,
      status,
      createdby,
      createddate,
      modifiedby,
      modifieddate
    FROM dbo.user_mst
    ${whereClause}
    ORDER BY createddate DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `;

    /* =========================
       COUNT QUERY
    ========================= */
    const countQuery = `
    SELECT COUNT(*) AS total
    FROM dbo.user_mst
    ${whereClause}
  `;

    const request = pool.request()
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, limit);

    if (search) {
        request.input("search", sql.VarChar(50), search);
    }

    if (isactive) {
        request.input("isactive", sql.Char(1), isactive);
    }

    if (status !== undefined) {
        request.input("status", sql.Bit, status);
    }

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
