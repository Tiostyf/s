// server.js 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow large image data if Base64

// ===== MongoDB Connection =====
const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
    console.error("❌ MONGO_URL is missing in .env file");
    process.exit(1);
}

mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ===== Mongoose Schema =====
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" } // URL or Base64 string
});
const Book = mongoose.model("Book", bookSchema);

// ===== CRUD Routes =====

// Create Book
app.post("/api/books", async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Read all Books
app.get("/api/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Book
app.put("/api/books/:id", async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete Book
app.delete("/api/books/:id", async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
