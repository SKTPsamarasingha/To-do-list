import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Terminal List",
  password: "Thiruna123",
  port: 5432,
});
db.connect();

const addUser = async (email, password) => {
  try {
    const result = db.query(
      "INSERT INTO users(email,password) VALUES($1,$2) RETURNING *",
      [email, password]
    );
    return result;
  } catch (error) {
    console.error("DB Error: ", error.message);
  }
};

const getUser = async (email) => {
  const users = [];
  try {
    const result = db.query("SELECT * FROM users WHERE email  = $1", [email]);
    (await result).rows.forEach((item) => {
      users.push(item);
    });
    if (users.length > 0) {
      return users;
    } else {
      return null;
    }
  } catch (error) {
    console.error("DB Error: ", error.message);
  }
};

const getTask = async (userID) => {
  let task = [];
  try {
    const result = await db.query("SELECT * FROM tasks WHERE userid = $1", [
      userID,
    ]);
    result.rows.forEach((item) => {
      task.push(item);
    });
    return task;
  } catch (error) {
    console.error("DB Error: ", error.message);
  }
};

const addTask = async (input, userId) => {
  try {
    await db.query("INSERT INTO Tasks(task,userid) VALUES($1,$2)", [
      input,
      userId,
    ]);
  } catch (error) {
    console.error("DB Error: ", error.message);
  }
};

const deleteTask = async (id) => {
  try {
    await db.query("delete from Tasks where id  = $1", [id]);
  } catch (error) {
    console.error("DB Error: ", error.message);
  }
};

const updateTask = async (id, task) => {
  try {
    await db.query("UPDATE tasks SET task = $1 WHERE id = $2", [id, task]);
  } catch (error) {
    console.error("DB Error: ", error.message);
  }
};

export default {
  addUser,
  getUser,
  getTask,
  addTask,
  deleteTask,
  updateTask,
  db,
};

// UPDATE tasks
// SET task = '321'
// WHERE id = 199
