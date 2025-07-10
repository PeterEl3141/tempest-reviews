const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const prisma = new PrismaClient();

app.use(cors({
    origin: 'https://tempest-reviews.vercel.app',
    credentials: true // if you're using cookies or auth headers
  }));
app.use(express.json());

// Utility: Authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // contains userId and role
    next();
  });
}

// 📽️ GET all movies with reviews and users
app.get("/movies", async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        reviews: {
          include: { user: true },
        },
      },
    });
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch movies" });
  }
});

// 🎬 GET single movie with reviews and users
app.get("/movies/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        reviews: {
          include: { user: true },
        },
      },
    });

    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch movie" });
  }
});

// 📝 POST review (authenticated)
app.post("/reviews", authenticateToken, async (req, res) => {
  const { content, movieId } = req.body;
  const userId = req.user.userId;

  try {
    const review = await prisma.review.create({
      data: {
        content,
        user: { connect: { id: userId } },
        movie: { connect: { id: movieId } },
      },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// 👤 POST signup (register and return token + user)
app.post("/signup", async (req, res) => {
  const { email, password, adminCode } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = adminCode === process.env.ADMIN_SECRET ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// 🔐 POST login (returns token + user)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true, // 🔥 ensure role is fetched!
    },
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
});

app.post("/movies", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);

  const { title, synopsis } = req.body;
  try {
    const movie = await prisma.movie.create({ data: { title, synopsis } });
    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add movie" });
  }
});

app.put("/movies/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);

  const id = parseInt(req.params.id);
  const { title, synopsis } = req.body;
  try {
    const movie = await prisma.movie.update({
      where: { id },
      data: { title, synopsis },
    });
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update movie" });
  }
});

app.delete("/movies/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);

  const id = parseInt(req.params.id);
  try {
    await prisma.movie.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete movie" });
  }
});

app.put("/reviews/:id", authenticateToken, async (req, res) => {
  const reviewId = parseInt(req.params.id);
  const { content, quality, fun } = req.body;

  try {
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!existing) return res.status(404).json({ error: "Review not found" });

    const isOwner = existing.userId === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) return res.sendStatus(403);

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { content, quality, fun },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

app.delete("/reviews/:id", authenticateToken, async (req, res) => {
  const reviewId = parseInt(req.params.id);

  try {
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!existing) return res.status(404).json({ error: "Review not found" });

    const isOwner = existing.userId === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) return res.sendStatus(403);

    await prisma.review.delete({ where: { id: reviewId } });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
