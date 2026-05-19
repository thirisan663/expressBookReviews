const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const allUsers = Object.values(users);

    for (let user of allUsers) {
        if (user.username === username) {
            return res.status(400).json({ message: "User already exists" });
        }
    }

    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/isbn/:isbn', async function (req, res) {

    const isbn = req.params.isbn;

    try {
        const data = await Promise.resolve(books);
        return res.status(200).json(data[isbn]);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching book by ISBN" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    return res.status(200).json(books[isbn]);
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {

    const author = req.params.author;

    try {
        const data = await Promise.resolve(books);

        let result = {};

        for (let isbn in data) {
            if (data[isbn].author === author) {
                result[isbn] = data[isbn];
            }
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {

    const title = req.params.title;

    try {
        const response = await axios.get("http://localhost:5000/");
        const booksData = response.data;

        let result = {};

        for (let isbn in booksData) {
            if (booksData[isbn].title === title) {
                result[isbn] = booksData[isbn];
            }
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    }

    return res.status(404).json({ message: "Book not found" });
});


module.exports.general = public_users;