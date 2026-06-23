import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';

const app = express();
dotenv.config();


// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(passport.initialize());

// Passport Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Routes
app.get('/_status/healthz', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).json({ status: "ready" });
});

app.use('/api/auth', authRoutes);


export default app;