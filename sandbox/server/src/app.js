import express from 'express';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.get('/api/sandbox/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Sandbox server is healthy!' });
});


export default app;