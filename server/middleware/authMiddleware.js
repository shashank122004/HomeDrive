// Protects API routes by verifying the JWT stored in the "token" cookie.
// On success it attaches the decoded user id to req.user for controllers.
import jwt from 'jsonwebtoken';

export function requireAuthApi(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
