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

exports.insertUserClientMapping = async (payload) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // normalize input
    let records = Array.isArray(payload.mappings)
      ? payload.mappings
      : [payload];

    if (!records.length) {
      throw new Error("No data provided for insert");
    }

    const request = new sql.Request(transaction);
    const now = new Date();

    // ✅ build values safely
    const valuesArray = records.map((item, index) => {
      if (!item.userid || !item.client_code) {
        throw new Error(
          `userid and client_code are required at row ${index + 1}`
        );
      }

      request.input(`userid${index}`, sql.Int, item.userid);
      request.input(`client_code${index}`, sql.Int, item.client_code);
      request.input(
        `status${index}`,
        sql.Char(1),
        item.status || "Y"
      );

      // ✅ createdby OPTIONAL
      request.input(
        `createdby${index}`,
        sql.Int,
        item.createdby ?? null
      );

      request.input(
        `createddate${index}`,
        sql.DateTime,
        now
      );

      return `(
        @userid${index},
        @client_code${index},
        @status${index},
        @createddate${index},
        @createdby${index}
      )`;
    });

    const insertQuery = `
      INSERT INTO dbo.user_client_mapping
      (
        userid,
        client_code,
        status,
        createddate,
        createdby
      )
      VALUES ${valuesArray.join(",")}
    `;

    await request.query(insertQuery);
    await transaction.commit();

    return {
      message: "User-client mapping inserted successfully",
      insertedCount: records.length,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};