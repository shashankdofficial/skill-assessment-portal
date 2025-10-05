require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
// const skillRoutes = require('./routes/skill');
// const questionRoutes = require('./routes/question');
const quizRoutes = require('./routes/quiz');
const reportRoutes = require('./routes/report');
// near other route imports
const skillsRouter = require('./routes/skills');
const questionsRouter = require('./routes/questions');
const reportsRouter = require('./routes/report');
const adminUsersRouter = require('./routes/adminUsers');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/quiz', quizRoutes);
app.use('/api/reports', reportRoutes);

// after app.use('/api/auth', authRouter) etc:
// app.use('/api/skills', skillsRouter);
// app.use('/api/questions', questionsRouter);
app.use('/api/reports', reportsRouter);

app.use('/api/admin', adminUsersRouter); // so GET /api/admin/users works

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// const PORT = process.env.PORT || 4000;
// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('DB connected');
//     await sequelize.sync({ alter: true });
//     app.listen(PORT, () => console.log(`Server running on ${PORT}`));
//   } catch (err) {
//     console.error('Failed to start app', err);
//     process.exit(1);
//   }
// })();


// Server start helper (only run when file executed directly)
const PORT = process.env.PORT || 4000;
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Failed to start app', err);
    if (process.env.NODE_ENV === 'test') {
      // in tests, re-throw so test runner can handle it
      throw err;
    } else {
      process.exit(1);
    }
  }
}

// Only start server when run directly (node src/app.js) AND not in test env
if (require.main === module && process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export the express app for Supertest / Jest
module.exports = app;