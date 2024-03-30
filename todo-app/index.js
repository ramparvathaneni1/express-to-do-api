// imports the express npm module
const express = require("express");

// imports the cors npm module
const cors = require("cors");

// imports the Pool object from the pg npm module, specifically
const Pool = require("pg").Pool;

// This creates a new connection to our database. Postgres listens on port 5432 by default
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "todo_app_db",
  password: "postgres",
  port: 5432,
});

// Creates a new instance of express for our app
const app = express();

// .use is middleware - something that occurs between the request and response cycle.
app.use(cors());

// We will be using JSON objects to communcate with our backend, no HTML pages.
app.use(express.json());

// This route will return 'Hi There' when you go to localhost:3001/ in the browser
app.get("/", (req, res) => {
  res.send("Hi There");
});

// GET all Todos
app.get("/api/todos", (request, response) => {
    pool.query(
    `SELECT * 
    FROM todos
    ORDER BY id ASC`, (error, results) => {
        if (error) {
            throw error;
        }
        console.log(results);
        response.status(200).json(results.rows);
    });
});

// CREATE new Todo Item
app.post("/api/todos", (request, response) => {
    const {title, done, user_id} = request.body;
    pool.query(
        `INSERT INTO todos (title, done, user_id)
        VALUES ($1, $2, $3) RETURNING *
        `,
        [title, done, user_id],
        (error, results) => {
            if (error) {
                return error;
            }
            const newTodo = {
                title: results.rows[0].title,
                done: results.rows[0].done,
                user_id: results.rows[0].user_id
            };
            console.log(newTodo);
            response.status(201).json(newTodo);
        }
    );
});

// GET todo by ID
app.get("/api/todos/:id", (request, response) => {
    const todoId = parseInt(request.params.id);
    console.log(`Getting by id = ${todoId}`);
    pool.query(
        `SELECT todos.id,
            todos.title,
            todos.done,
            users.id,
            users.username
        FROM todos
        JOIN users
            ON todos.user_id = users.id
            AND todos.id = $1`,
        [todoId],
        (error, results) => {
            console.log(results);
            if (error) {
                response.status(500).json({
                    error: `An error occurred while getting the todo.`
                });
            } else if (results.rowCount > 0) {
                response.status(200).json(results.rows);
            } else {
                response.status(404).json({
                    message: `Todo not found.`
                });
            }
        }
    );
});

// DELETE Single Todo Item
app.delete("/api/todos/:id", (request, response) => {
    const id = parseInt(request.params.id);
    pool.query(
        `DELETE FROM todos WHERE id = $1`,
        [id],
        (error, results) => {
            if (error) {
                response.status(500).json({
                    error: `An error occurred while deleting the todo.`
                });
            } else if (results.rowCount > 0) {
                response.status(200).json({
                    message: `Todo with ID: ${id} was successfully deleted.`
                });
            } else {
                response.status(404).json({
                    message: `Todo not found.`
                });
            }
        }
    );
});

// UPDATE a Todo Item
app.put("/api/todos/:id", (request, response) => {
    const id = parseInt(request.params.id);
    const {title, done, user_id} = request.body;
    pool.query(
        `UPDATE todos SET title = $1, done = $2, user_id = $3 WHERE id = $4`,
        [title, done, user_id, id],
        (error, results) => {
            if (error) {
                response.status(500).json({
                    error: "An error occurred while updating the todo."
                });
            } else if (results.rowCount > 0) {
                response.status(200).json({
                    message: `Todo modified with ID: ${id}`,
                    todo: {id, ...request.body}
                });
            } else {
                response.status(404).json({
                    message: `Todo not found.`
                });
            }
        }
    );
});

// GET All Users
app.get('/api/users', (request, response) => {
    pool.query(
        `SELECT * FROM users ORDER BY id ASC`,
        (error, results) => {
            if (error) {
                throw error;
            }

            console.log(results);
            response.status(200).json(results.rows);
        }
    );
});

// CREATE New User
app.post('/api/users', (request, response) => {
    const {username, password} = request.body;
    pool.query(
        `INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING *`,
        [username, password],
        (error, result) => {
            if (error) {
                throw error;
            }
            console.log(result);
            response.status(201).send(
                `User added with ID = ${result.rows[0].id}`
            );
        }
    );
});

// DELETE User
app.delete('/api/users/:id', (request, response) => {
    const id = parseInt(request.params.id);
    pool.query(
        `DELETE FROM users
        WHERE id = $1`,
        [id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(
                `User with ${id} successfully deleted`
            );
        }
    );
});

// GET User By ID
app.get("/api/users/:id", (request, response) => {
    const id = parseInt(request.params.id);
    console.log(`Getting User by id = ${id}`);
    pool.query(
        `SELECT id, username
        FROM users
        WHERE id = $1`,
        [id],
        (error, results) => {
            console.log(results);
            if (error) {
                response.status(500).json({
                    error: `An error occurred while getting the user.`
                });
            } else if (results.rowCount > 0) {
                response.status(200).json(results.rows);
            } else {
                response.status(404).json({
                    message: `User not found.`
                });
            }
        }
    );
});

// GET Todos By User Id
app.get("/api/users/:id/todos", (request, response) => {
    const id = parseInt(request.params.id);

    console.log(`Getting Todos by User id = ${id}`);

    pool.query(
        `SELECT *
        FROM todos
        WHERE user_id = $1`,
        [id],
        (error, results) => {
            if (error) {
                response.status(500).json({
                    error: `An error occurred while getting the user.`
                });
            } else if (results.rowCount > 0) {
                response.status(200).json(results.rows);
            } else {
                response.status(404).json({
                    message: `User not found.`
                });
            }
        }
    );
});

// This tells the express application to listen for requests on port 3001
app.listen("3001", () => {});
