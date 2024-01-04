- [TODO Express API App](#todo-express-api-app)
- [Todo App Set-up](#todo-app-set-up)
- [Configure Postgres in the VM](#configure-postgres-in-the-vm)
- [Create a SQL file to create a table](#create-a-sql-file-to-create-a-table)
    - [YOU DO (5 minutes)](#you-do-5-minutes)
- [Create the todo\_app\_db Database](#create-the-todo_app_db-database)
- [GET TODOS](#get-todos)
- [CREATE A TODO (POST)](#create-a-todo-post)
- [GET SINGLE TODO ITEM](#get-single-todo-item)
- [DELETE SINGLE TODO ITEM](#delete-single-todo-item)
- [UPDATE TODO ITEM (PUT)](#update-todo-item-put)
- [References](#references)

## TODO Express API App

Let's build our own Node/Express API and test it out with Postman. We will use a PostgreSQL datastore and write raw SQL to query the database.

There is a Postman collection in this folder that contains the endpoints we'll build: `pru_todo_app.postman_collection.json`

## Todo App Set-up

1. In your VM, open your Terminal and change into your MEF folder: `cd /home/USERNAME/mef/`.
1. Fork and clone down your fork of this repo using the SSH URL option: `git clone git@git.generalassemb.ly:<THIS_SHOULD_BE_YOUR_USERNAME>/express-to-do-api.git`.
1. `cd` into the `express-to-do-api` folder.
1. Inside it, create a new folder: `mkdir todo-app`
1. `cd todo-app`
1. Run `npm init -y`.
   - This will create a `package.json` file to initialize our node application.
     > `package.json` is a JSON file that lives in the root directory of your project. Your `package.json` holds important information about the project. It contains human-readable metadata about the project (like the project name and description) as well as functional metadata like the package version number and a list of dependencies required by the application.
1. `npm i cors express pg nodemon`
   - This will install a few node packages for us:
     - `cors` - (helps with potential [cross-origin resource sharing issues](https://www.telerik.com/blogsall-you-need-to-know-cors-errors#:~:text=CORS%20errors%20happen%20when%20a,by%20the%20server's%20CORS%20configuration.))
     - `express` -[Express](https://expressjs.com/) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
     - `pg` - [This package](https://www.npmjs.com/package/pg) allows us to connect with our Postgres database.
     - `nodemon` - [This will automatically restart](https://www.npmjs.com/package/nodemon) the node application when file changes in the directory are detected.
1. Open the application (so far) in VS Code: `code .`
1. `touch index.js` - Running this command will create a file to serve as the entrypoint of our app.
1. Open the `index.js` file in your editor and add the following content:
   ```js
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

   // This tells the express application to listen for requests on port 3001
   app.listen("3001", () => {});
   ```

10. In `package.json` let's update the start script to use `nodemon`. This way we don't have to stop and restart the server each time we make a change to our code.

  ```sh
  jq '.scripts.start = "nodemon index.js"' package.json > package.json.new
  mv package.json.new package.json
  ```

  The `package.json` file should now look like this:

   ```js
   "scripts": {
     "test": "echo \"Error: no test specified\" && exit 1",
     "start": "nodemon index.js" // NEW LINE YOU JUST ADDED
   },
   ```

11. To start the server, run `npm run start`. Go to `localhost:3001` in the browser. you should see this:

   ![](./assets/hi-there.png)

## Configure Postgres in the VM

The Postgres software runs a little differently in our VM than on a Mac or PC. You can read more about that [here](https://devopscube.com/install-configure-postgresql-amazon-linux/).

1. `sudo vi /var/lib/pgsql/data/pg_hba.conf`
2. Hit `i` to insert into the file.
3. Copy and paste the following lines just below the configuration headers (must be above the other connection configurations):

   ```bash
   host                all        postgres   127.0.0.1/32   md5
   local               all        postgres                  md5
   host                all        all        0.0.0.0/0      md5
   host                all        all        localhost      md5
   ```

   ![](./assets/pg_config.png)

4. Hit `esc` then `:wq` to write and close the file.
5. Run `sudo systemctl restart postgresql` to restart the postgresql server.

## Create a SQL file to create a table

There are several ways to create a database, a table, and seed it with some starter Todos. To make things simple, we'll create a `sql` file then run it to accomplish these objectives.

1. `mkdir db`
   - We'll create a separate directory for our database logic.
1. `touch db/todo.sql`

   ```sql
   CREATE TABLE todos (
     ID SERIAL PRIMARY KEY,
     title VARCHAR(50),
     done BOOLEAN
   );

   INSERT INTO todos (title, done)
   VALUES ('Get Milk', false), ('Walk Dog', false);
   ```

   - This will create a table named `todos` and insert 2 starter todos. Feel free to add some of your own then save the file.

#### YOU DO (5 minutes)

Add a few more todos based on the `INSERT INTO` example above.

## Create the todo_app_db Database

1. Let's create the database. You can run this from anywhere on the command line since it's global: `createdb todo_app_db -U postgres`

   - Note - If you're asked, the default password for the `postgres` user is `postgres`

1. Run the SQL file to create the table and add 2 todos: `psql -U postgres -d todo_app_db < db/todo.sql`

   - This command will run the `todo.sql` inside the `todo_app_db` we just created. **Make sure** you're in the `todo-app` directory when you run this command.
   - Note: If you're asked, the default password for the `-U postgres` user is `postgres`.

1. To confirm the database and table are created, we can check the `todo_app_db` database from inside the `psql` shell: `psql -d todo_app_db -U postgres`

1. `SELECT * FROM todos;`

You should see this:

```text
 id |       title       | done | user_id 
----+-------------------+------+---------
  1 | Get Milk          | f    |       1
  2 | Walk Dog          | f    |       2
(2 rows)

todo_app_db=# 

```

## GET TODOS

We're gonna create CRUD (Create, Read, Update, Delete) functionality for the todos app. We'll start with Read.

1. You'll start to see a pattern as we build our routes. First, we'll define an HTTP verb (GET) and a method (app.get) in the `index.js` file. The route will accept `request` and `response` as arguments. We'll then write a database SQL query inside the body like so:

   ```js
   app.get("/api/todos", (request, response) => {
     pool.query("SELECT * FROM todos ORDER BY id ASC", (error, results) => {
       if (error) throw error;

       console.log(results);
       response.status(200).json(results.rows);
     });
   });
   ```
   - You can add this route underneath the existing `app.get` method and above the `app.listen` in the `index.js` file.
1. Save the `index.js` file.
1. Be sure to test this out in Postman with the provided collection of queries in this folder: `pru_todo_app.postman_collection.json`.
1. Open Postman and open the collection: 
   1. Run `/opt/Postman/app/Postman` in the terminal
   2. Select "Open existing file" and open the collection.

![](./assets/postman-get-todos.png)

## CREATE A TODO (POST)

1. In `index.js`, you can add this code below the `app.get("/api/todos/")` route. _Take a minute to consider what this code is doing._

   ```js
   app.post("/api/todos", (request, response) => {
     const { title, done } = request.body;

     pool.query(
       "INSERT INTO todos (title, done) VALUES ($1, $2) RETURNING *",
       [title, done],
       (error, results) => {
         if (error) throw error;
         console.log(results);
         response.status(201).json(results.rows[0]);
       }
     );
   });
   ```
1. Be sure to test this out in Postman with the provided collection of queries.

![](./assets/postman-create-todos.png)

## GET SINGLE TODO ITEM

1. In `index.js`, you can add this code below the previous route. _Take a minute to consider what this code is doing._

   ```js
   app.get("/api/todos/:id", (request, response) => {
     const id = parseInt(request.params.id);

     pool.query("SELECT * FROM todos WHERE id = $1", [id], (error, results) => {
       if (error) throw error;
       response.status(200).json(results.rows);
     });
   });
   ```

1. Be sure to test this out in Postman with the provided collection of queries.

![](./assets/postman-get-single-todo.png)

## DELETE SINGLE TODO ITEM

1. In `index.js`, you can add this code below the previous route. _Take a minute to consider what this code is doing._

   ```js
   app.delete("/api/todos/:id", (request, response) => {
     const id = parseInt(request.params.id);

     pool.query("DELETE FROM todos WHERE id = $1", [id], (error, results) => {
       if (error) throw error;
       response.status(204).send();
     });
   });
   ```
1. Be sure to test this out in Postman with the provided collection of queries. First, delete a todo item then get all todos to confirm it's been deleted.

![](./assets/postman-delete-todo.png)

## UPDATE TODO ITEM (PUT)

1. In `index.js`, you can add this code below the previous route. _Take a minute to consider what this code is doing._

   ```js
   app.put("/api/todos/:id", (request, response) => {
     const id = parseInt(request.params.id);
     const { title, done } = request.body;

     pool.query(
       "UPDATE todos SET title = $1, done = $2 WHERE id = $3",
       [title, done, id],
       (error, results) => {
         if (error) throw error;
         response.status(200).send(`Todo modified with ID: ${id}`);
       }
     );
   });
   ```
   - Note: we need to send _both_ the `title` and `done` fields to the database even if we're updating only one field. Otherwise, the other field will be updated with `null`. What are some other strategies to avoid this? [Check this article.](https://medium.com/developer-rants/conditional-update-in-postgresql-a27ddb5dd35)
1. Be sure to test this out in Postman with the provided collection of queries.

![](./assets/postman-update-todo.png)

Congrats! You built a full CRUD Todo API application and tested the endpoints with Postman!

## References

- https://expressjs.com/en/starter/generator.html
- https://blog.logrocket.com/crud-rest-api-node-js-express-postgresql/#creating-postgresql-database
- [What is package.json](https://heynode.com/tutorial/what-packagejson/)
