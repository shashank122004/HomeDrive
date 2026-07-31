// Handles register/login/logout. Passwords are hashed with bcrypt and never
// stored or logged in plain text.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';
import { createUserStorage } from '../utils/storagePaths.js';
import { logEvent } from '../utils/logger.js';

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true, // not readable from client-side JS, mitigates XSS token theft
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name, email, hashedPassword);
    createUserStorage(user.id); // give the user their Documents/Photos/Videos folders

    const token = generateToken(user);
    setAuthCookie(res, token);
    logEvent('REGISTER', `New user registered: ${email}`);

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);
    logEvent('LOGIN', `User logged in: ${email}`);

    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export function logoutUser(req, res) {
  logEvent('LOGOUT', `User logged out: ${req.user?.email || 'unknown'}`);
  res.clearCookie('token');
  res.json({ success: true });
}

// Lets the frontend ask "am I logged in, and as who?" on page load, since
// the JWT lives in an httpOnly cookie the client-side JS can't read directly.
export async function getCurrentUser(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
