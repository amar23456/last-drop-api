const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Middleware
const requireAuth = require('./src/middleware/requireAuth');

// Routes
const authRouter = require('./src/routes/authRoutes');

const app = express();

// Instantiate the routers
app.use(express.json());
app.use(authRouter);
const mongoUri =
'mongodb://root:geCMog6LAHLldA8g@89.44.246.66:29017/ld_web?authSource=admin&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance');
});
mongoose.connection.on('error', (err) => {
  console.error('error connecting to mongo', err);
});

app.get('/', requireAuth, (req, res) => {
  res.send(`Your email:${req.user.email}`);
});

app.listen('29080', () => {
  console.log('Listening at http://localhost:29080');
});
