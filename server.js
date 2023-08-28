const express = require("express");
const app = express();

// Load Env Variables
require("dotenv").config();

// Connect With DB
require("./config/dbConnect");

// Mount Routers
const usersRoute = require("./routes/users");
const postsRoute = require("./routes/posts");
const categoriesRoute = require("./routes/categories");
const commentsRoute = require("./routes/comments");
// Middleware
const globalErrHandler = require("./middlewares/globalErrHandler");

// Body-Parser
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// Call Routes
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/posts", postsRoute);
app.use("/api/v1/categories", categoriesRoute);
app.use("/api/v1/comments", commentsRoute);

// Error (Custom Global) Handlers Middleware
app.use(globalErrHandler);

// 404 Error not found
app.use("*", (req, res) => {
  return res
    .status(404)
    .json({ error: `Invalid Route Not Found ${req.originalUrl}` });
});

// Start Server
const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server is running is port on ${port}`));
