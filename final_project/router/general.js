const axios = require('axios');
const express = require('express');

let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();


// Register New User
public_users.post("/register", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Check if user already exists
    const existingUser = users.find(
        (user) => user.username === username
    );

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    // Add new user
    users.push({ username, password });

    return res.status(201).json({
        message: "User registered successfully"
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {

    const isbn = req.params.isbn;

    try {

        const response = await axios.get("http://localhost:5000/");
        const booksData = response.data;

        if (booksData[isbn]) {
            return res.status(200).json(booksData[isbn]);
        }

        return res.status(404).json({
            message: "Book not found"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching book by ISBN"
        });

    }
});


// Get books based on author
public_users.get('/author/:author', async function (req, res) {

    const author = req.params.author;

    try {

        const response = await axios.get("http://localhost:5000/");
        const booksData = response.data;

        let result = {};

        for (let isbn in booksData) {

            if (booksData[isbn].author === author) {
                result[isbn] = booksData[isbn];
            }

        }

        if (Object.keys(result).length === 0) {
            return res.status(404).json({
                message: "No books found for this author"
            });
        }

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching books by author"
        });

    }
});


// Get books based on title
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

        if (Object.keys(result).length === 0) {

            return res.status(404).json({
                message: "No books found for this title"
            });

        }

        return res.status(200).json(result);

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching books by title"
        });

    }
});


// Get book reviews
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});


module.exports.general = public_users;
