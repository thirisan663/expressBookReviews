const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check username + password match
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    let token = jwt.sign({ username }, "access", { expiresIn: 3600 });

    req.session.authorization = {
        accessToken: token,
        username
    };

    return res.status(200).json({ message: "Login successful", token });
});

// Add review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // add or update review (same user overwrites their review)
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;