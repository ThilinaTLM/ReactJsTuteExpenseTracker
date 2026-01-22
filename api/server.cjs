const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Parse JSON bodies
server.use(jsonServer.bodyParser);

// Simulate network delay (300-800ms)
server.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 500) + 300;
  setTimeout(next, delay);
});

// Login endpoint
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + user.id
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// Register endpoint
server.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  const db = router.db;

  // Check if user exists
  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Create new user
  const users = db.get('users');
  const newId = String(users.value().length + 1);
  const newUser = {
    id: newId,
    email,
    password,
    name,
    avatar: null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser).write();

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    user: userWithoutPassword,
    token: 'mock-jwt-token-' + newId
  });
});

// Simulate occasional errors (5% chance) - useful for teaching error handling
// Uncomment to enable:
// server.use((req, res, next) => {
//   if (Math.random() < 0.05) {
//     return res.status(500).json({ error: 'Simulated server error' });
//   }
//   next();
// });

// Use default router
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running at http://localhost:${PORT}`);
  console.log(`📊 Database: ${path.join(__dirname, 'db.json')}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET    /users`);
  console.log(`  POST   /login`);
  console.log(`  POST   /register`);
  console.log(`  GET    /transactions`);
  console.log(`  POST   /transactions`);
  console.log(`  PUT    /transactions/:id`);
  console.log(`  DELETE /transactions/:id`);
  console.log(`  GET    /categories`);
  console.log(`  GET    /budgets`);
  console.log(`\nQuery examples:`);
  console.log(`  /transactions?_page=1&_limit=10`);
  console.log(`  /transactions?type=expense`);
  console.log(`  /transactions?q=grocery\n`);
});
