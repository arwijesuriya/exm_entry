import pool from "../config/db.js";
import errorProvider from "../utils/errorProvider.js";

export const createFaculty = async (req, res, next) => {
  let { f_name, email, contact_no, status, m_id } = req.body;

  if (!status) {
    status = "false";
  }

  if (!f_name || !email || !contact_no || !m_id) {
    return next(errorProvider(400, "Missing required fields"));
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if faculty already exists (based on f_name or email)
      const [facultyExists] = await conn.execute(
        "SELECT COUNT(*) AS count FROM faculty WHERE f_name = ? OR email = ?",
        [f_name, email]
      );

      if (facultyExists[0].count > 0) {
        conn.release();
        return next(errorProvider(409, "Faculty already exists"));
      }

      // Insert into faculty table
      const [facultyResult] = await conn.execute(
        "INSERT INTO faculty (f_name, email, contact_no, status) VALUES (?, ?, ?, ?)",
        [f_name, email, contact_no, status]
      );
      const f_id = facultyResult.insertId;

      // Insert into fac_dean table
      await conn.execute("INSERT INTO fac_dean (f_id, m_id) VALUES (?, ?)", [
        f_id,
        m_id,
      ]);

      await conn.commit();

      return res
        .status(201)
        .json({ message: "Faculty created successfully", f_id });
    } catch (error) {
      await conn.rollback();
      console.error("Error while creating faculty:", error);
      return next(
        errorProvider(500, "An error occurred while creating faculty")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const updateFaculty = async (req, res, next) => {
  const { f_id, f_name, email, contact_no, status, m_id } = req.body;

  if (!f_name || !email || !contact_no || !m_id) {
    return next(errorProvider(400, "Missing required fields"));
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if faculty exists
      const [facultyExists] = await conn.execute(
        "SELECT COUNT(*) AS count FROM faculty WHERE f_id = ?",
        [f_id]
      );

      if (facultyExists[0].count === 0) {
        conn.release();
        return next(errorProvider(404, "Faculty not found"));
      }

      // Update faculty table
      await conn.execute(
        "UPDATE faculty SET f_name = ?, email = ?, contact_no = ?, status = ? WHERE f_id = ?",
        [f_name, email, contact_no, status, f_id]
      );

      // Update fac_dean table
      await conn.execute("UPDATE fac_dean SET m_id = ? WHERE f_id = ?", [
        m_id,
        f_id,
      ]);

      await conn.commit();

      return res.status(200).json({ message: "Faculty updated successfully" });
    } catch (error) {
      await conn.rollback();
      console.error("Error while updating faculty:", error);
      return next(
        errorProvider(500, "An error occurred while updating faculty")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const createDepartment = async (req, res, next) => {
  const { d_name, email, contact_no, status, f_id, m_id } = req.body;

  if (!d_name || !email || !contact_no || !f_id || !m_id) {
    return next(errorProvider(400, "Missing required fields"));
  }

  if (!status) {
    status = "false";
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if department already exists
      const [departmentExists] = await conn.execute(
        "SELECT COUNT(*) AS count FROM department WHERE d_name = ? OR email = ?",
        [d_name, email]
      );

      if (departmentExists[0].count > 0) {
        conn.release();
        return next(errorProvider(409, "Department already exists"));
      }

      // Insert into department table
      const [departmentResult] = await conn.execute(
        "INSERT INTO department (d_name, email, contact_no, status) VALUES (?, ?, ?, ?)",
        [d_name, email, contact_no, status]
      );
      const d_id = departmentResult.insertId;

      // Insert into dep_hod table
      await conn.execute("INSERT INTO dep_hod (d_id, m_id) VALUES (?, ?)", [
        d_id,
        m_id,
      ]);

      // Insert into fac_dep table
      await conn.execute("INSERT INTO fac_dep (f_id, d_id) VALUES (?, ?)", [
        f_id,
        d_id,
      ]);

      await conn.commit();

      res.status(201).json({
        message: "Department created successfully",
        d_id,
      });
    } catch (error) {
      await conn.rollback();
      console.error("Error during department creation:", error);
      return next(
        errorProvider(500, "An error occurred while creating department")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};
export const updateDepartment = async (req, res, next) => {
  const { d_id } = req.body;

  const { d_name, email, contact_no, status, f_id, m_id } = req.body;

  if (!d_name || !email || !contact_no || !f_id || !m_id) {
    return next(errorProvider(400, "Missing required fields"));
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [departmentExists] = await conn.execute(
        "SELECT COUNT(*) AS count FROM department WHERE d_id = ?",
        [d_id]
      );

      if (departmentExists[0].count === 0) {
        conn.release();
        return next(errorProvider(404, "Department not found"));
      }

      // Update department table
      await conn.execute(
        "UPDATE department SET d_name = ?, email = ?, contact_no = ?, status = ? WHERE d_id = ?",
        [d_name, email, contact_no, status, d_id]
      );

      // Update dep_hod table
      await conn.execute("UPDATE dep_hod SET m_id = ? WHERE d_id = ?", [
        m_id,
        d_id,
      ]);

      // // Update fac_dep table
      await conn.execute("UPDATE fac_dep SET f_id = ? WHERE d_id = ?", [
        f_id,
        d_id,
      ]);

      await conn.commit();

      return res
        .status(200)
        .json({ message: "Department updated successfully" });
    } catch (error) {
      await conn.rollback();
      console.error("Error while updating department:", error);
      return next(
        errorProvider(500, "An error occurred while updating department")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const createDegree = async (req, res, next) => {
  const { deg_name, short, levels: levelsArr, status, d_id } = req.body;
  const levels = levelsArr.join(":");

  if (!deg_name || !short || !levels || !d_id) {
    return next(errorProvider(400, "Missing required fields"));
  }
  if (!status) {
    status = "false";
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if degree already exists
      const [degreeExists] = await conn.execute(
        "SELECT COUNT(*) AS count FROM degree WHERE deg_name = ? OR short = ?",
        [deg_name, short]
      );

      if (degreeExists[0].count > 0) {
        conn.release();
        return next(errorProvider(409, "Degree already exists"));
      }

      // Insert into degree table
      const [degreeResult] = await conn.execute(
        "INSERT INTO degree (deg_name, short, levels, status) VALUES (?, ?, ?, ?)",
        [deg_name, short, levels, status]
      );
      const deg_id = degreeResult.insertId;

      // Insert into dep_deg table
      await conn.execute("INSERT INTO dep_deg (d_id, deg_id) VALUES (?, ?)", [
        d_id,
        deg_id,
      ]);

      await conn.commit();

      res.status(201).json({
        message: "Degree added successfully",
        deg_id,
      });
    } catch (error) {
      await conn.rollback();
      console.error("Error during degree creation:", error);
      return next(
        errorProvider(500, "An error occurred while adding the degree")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const updateDegree = async (req, res, next) => {
  const { deg_id } = req.body;

  const { deg_name, short, levels: levelsArr, status, d_id } = req.body;
  const levels = levelsArr.join(":");

  if (!deg_name || !short || !levels || !d_id) {
    return next(errorProvider(400, "Missing required fields"));
  }

  try {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if degree exists
      const [degreeExists] = await conn.execute(
        "SELECT COUNT(*) AS count FROM degree WHERE deg_id = ?",
        [deg_id]
      );

      if (degreeExists[0].count === 0) {
        conn.release();
        return next(errorProvider(404, "Degree not found"));
      }

      // Update degree table
      await conn.execute(
        "UPDATE degree SET deg_name = ?, short = ?, levels = ?, status = ? WHERE deg_id = ?",
        [deg_name, short, levels, status, deg_id]
      );

      // Update dep_deg table
      await conn.execute("UPDATE dep_deg SET d_id = ? WHERE deg_id = ?", [
        d_id,
        deg_id,
      ]);

      await conn.commit();

      return res.status(200).json({ message: "Degree updated successfully" });
    } catch (error) {
      await conn.rollback();
      console.error("Error while updating degree:", error);
      return next(
        errorProvider(500, "An error occurred while updating the degree")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getAllFaculties = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();

    try {
      const query = `SELECT * FROM faculty`;

      const [results] = await conn.execute(query);

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching all faculties:", error);
      return next(errorProvider(500, "Failed to fetch all faculties"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getAllFacultiesWithExtraDetails = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();

    try {
      const query = `SELECT  f.*, COUNT(DISTINCT fd.d_id) AS department_count, COUNT(DISTINCT dd.deg_id) AS degree_count, md.name AS manager_name FROM faculty f LEFT JOIN fac_dep fd ON f.f_id = fd.f_id LEFT JOIN 
    dep_deg dd ON fd.d_id = dd.d_id LEFT JOIN fac_dean fdn ON f.f_id = fdn.f_id LEFT JOIN manager_detail md ON fdn.m_id = md.m_id GROUP BY f.f_id, md.name`;

      const [results] = await conn.execute(query);

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching all faculties:", error);
      return next(errorProvider(500, "Failed to fetch all faculties"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getFacultyById = async (req, res, next) => {
  const { f_id } = req.body;

  if (!f_id) {
    return next(errorProvider(400, "Missing f_id."));
  }

  try {
    const conn = await pool.getConnection();

    try {
      const query = `
          SELECT f.*,fac_dean.m_id FROM faculty f INNER JOIN fac_dean ON f.f_id = fac_dean.f_id WHERE f.f_id = ?`;

      const [results] = await conn.execute(query, [f_id]);

      if (results.length === 0) {
        return next(errorProvider(404, `No faculty found for f_id: ${f_id}`));
      }

      return res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error fetching faculty by ID:", error);
      return next(errorProvider(500, "Failed to fetch faculty by ID"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getAllDepartments = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();

    try {
      const query = `
        SELECT * FROM department`;

      const [results] = await conn.execute(query);

      if (results.length === 0) {
        return next(errorProvider(404, "No departments found."));
      }

      return res.status(200).json({ departments: results });
    } catch (error) {
      console.error("Error fetching all departments:", error);
      return next(errorProvider(500, "Failed to fetch all departments"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getAllDepartmentsWithExtraDetails = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();

    try {
      const query = `SELECT  d.*, f.f_name AS faculty_name, COUNT(DISTINCT dd.deg_id) AS degree_count, md.name AS manager_name FROM department d LEFT JOIN fac_dep fd ON d.d_id = fd.d_id LEFT JOIN faculty f ON fd.f_id = f.f_id LEFT JOIN dep_deg dd ON d.d_id = dd.d_id LEFT JOIN dep_hod dh ON d.d_id = dh.d_id LEFT JOIN  manager_detail md ON dh.m_id = md.m_id GROUP BY d.d_id, d.d_name, f.f_name, md.name`;

      const [results] = await conn.execute(query);

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching all faculties:", error);
      return next(errorProvider(500, "Failed to fetch all faculties"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getDepartmentById = async (req, res, next) => {
  const { d_id } = req.body;

  if (!d_id) {
    return next(errorProvider(400, "Missing d_id."));
  }

  try {
    const conn = await pool.getConnection();

    try {
      const query = `
        SELECT d.*,fd.f_id,dh.m_id FROM department d INNER JOIN fac_dep fd ON d.d_id = fd.d_id INNER JOIN dep_hod dh ON dh.d_id = d.d_id WHERE d.d_id = ?`;

      const [results] = await conn.execute(query, [d_id]);

      if (results.length === 0) {
        return next(
          errorProvider(404, `No department found for d_id: ${d_id}`)
        );
      }

      return res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error fetching department by ID:", error);
      return next(errorProvider(500, "Failed to fetch department by ID"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getAllDegrees = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();

    try {
      const query = `
        SELECT * FROM degree`;

      const [results] = await conn.execute(query);

      if (results.length === 0) {
        return next(errorProvider(404, "No degrees found."));
      }

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching all degrees:", error);
      return next(errorProvider(500, "Failed to fetch all degrees"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getAllDegreesWithExtraDetails = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();

    try {
      const query = `SELECT dg.deg_id,dg.deg_name,dg.short,dg.status,d.d_id,d.d_name AS department_name,f.f_id,
    f.f_name AS faculty_name FROM degree dg LEFT JOIN dep_deg dd ON dg.deg_id = dd.deg_id LEFT JOIN department d ON dd.d_id = d.d_id LEFT JOIN fac_dep fd ON d.d_id = fd.d_id LEFT JOIN 
    faculty f ON fd.f_id = f.f_id`;

      const [results] = await conn.execute(query);

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching all faculties:", error);
      return next(errorProvider(500, "Failed to fetch all faculties"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getDegreeById = async (req, res, next) => {
  const { deg_id } = req.body;

  if (!deg_id) {
    return next(errorProvider(400, "Missing deg_id."));
  }

  try {
    const conn = await pool.getConnection();

    try {
      const query = `SELECT dg.*,d.d_id,f.f_id FROM degree dg LEFT JOIN dep_deg dd ON dg.deg_id = dd.deg_id LEFT JOIN department d ON dd.d_id = d.d_id LEFT JOIN fac_dep fd ON d.d_id = fd.d_id LEFT JOIN faculty f ON fd.f_id = f.f_id where dg.deg_id = ?`;
      const [results] = await conn.execute(query, [deg_id]);
      console.log(results);

      if (results.length === 0) {
        return next(
          errorProvider(404, `No degree found for deg_id: ${deg_id}`)
        );
      }

      return res
        .status(200)
        .json({ ...results[0], levels: results[0].levels.split(":") });
    } catch (error) {
      console.error("Error fetching degree by ID:", error);
      return next(errorProvider(500, "Failed to fetch degree by ID"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getDepartmentsByFacultyId = async (req, res, next) => {
  const { f_id } = req.body;

  if (!f_id) {
    return next(errorProvider(400, "Missing f_id."));
  }

  try {
    const conn = await pool.getConnection();

    try {
      const query = `SELECT department.* FROM department INNER JOIN fac_dep ON department.d_id = fac_dep.d_id WHERE fac_dep.f_id = ?`;

      const [results] = await conn.execute(query, [f_id]);

      if (results.length === 0) {
        return next(
          errorProvider(404, `No departments found for f_id: ${f_id}`)
        );
      }
      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching departments by f_id:", error);
      return next(errorProvider(500, "Failed to fetch departments by f_id"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getDegreesByDepartmentId = async (req, res, next) => {
  const { d_id } = req.body;

  if (!d_id) {
    return next(errorProvider(400, "Missing d_id."));
  }

  try {
    const conn = await pool.getConnection();

    try {
      const query = `
        SELECT *FROM degree INNER JOIN dep_deg ON degree.deg_id = dep_deg.deg_id
        WHERE dep_deg.d_id = ?`;

      const [results] = await conn.execute(query, [d_id]);

      if (results.length === 0) {
        return next(errorProvider(404, `No degrees found for d_id: ${d_id}`));
      }

      return res.status(200).json(results);
    } catch (error) {
      console.error("Error fetching degrees by d_id:", error);
      return next(errorProvider(500, "Failed to fetch degrees by d_id"));
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getNoOfFaculty = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "SELECT COUNT(*) AS faculty_count FROM faculty"
      );

      const { faculty_count } = result[0];

      return res.status(200).json({
        count: faculty_count,
      });
    } catch (error) {
      console.error("Error retrieving number of faculty:", error);
      return next(
        errorProvider(500, "An error occurred while the faculty count")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getNoOfDepartments = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "SELECT COUNT(*) AS department_count FROM department"
      );

      const { department_count } = result[0];

      return res.status(200).json({
        count: department_count,
      });
    } catch (error) {
      console.error("Error retrieving number of departments:", error);
      return next(
        errorProvider(500, "An error occurred while the department count")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getNoOfDegrees = async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "SELECT COUNT(*) AS degree_count FROM degree"
      );

      const { degree_count } = result[0];

      return res.status(200).json({
        count: degree_count,
      });
    } catch (error) {
      console.error("Error retrieving number of degrees:", error);
      return next(
        errorProvider(500, "An error occurred while the degree count")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};

export const getNoOfDepartmentsByFaculty = async (req, res, next) => {
  try {
    const { f_id } = req.params;

    if (!f_id) {
      return res.status(400).json({ message: "Faculty ID is required" });
    }

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "SELECT COUNT(DISTINCT d_id) AS department_count FROM fac_dep WHERE f_id = ?",
        [f_id]
      );

      const { department_count } = result[0];

      return res.status(200).json({
        count: department_count,
      });
    } catch (error) {
      console.error("Error retrieving number of departments:", error);
      return next(
        errorProvider(500, "An error occurred while  the department count")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};
export const getNoOfDegreesByDepartment = async (req, res, next) => {
  try {
    const { d_id } = req.params;

    if (!d_id) {
      return res
        .status(400)
        .json({ message: "Department ID (d_id) is required" });
    }

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "SELECT COUNT(DISTINCT deg_id) AS degree_count FROM dep_deg WHERE d_id = ?",
        [d_id]
      );

      const { degree_count } = result[0];

      return res.status(200).json({
        count: degree_count,
      });
    } catch (error) {
      console.error("Error retrieving number of degrees:", error);
      return next(
        errorProvider(500, "An error occurred while  the degree count")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};
export const getNoOfDegreesByLevel = async (req, res, next) => {
  try {
    const { levels } = req.params;

    if (!levels) {
      return res.status(400).json({ message: "Levels is required" });
    }

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        "SELECT COUNT(*) AS degree_count FROM degree WHERE levels = ?",
        [levels]
      );

      const { degree_count } = result[0];

      return res.status(200).json({
        count: degree_count,
      });
    } catch (error) {
      console.error("Error retrieving degree count by levels:", error);
      return next(
        errorProvider(500, "An error occurred while the degree count")
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return next(errorProvider(500, "Failed to establish database connection"));
  }
};
