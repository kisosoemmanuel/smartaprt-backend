import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '30');

function signAccessToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: ACCESS_EXP });
}

function signRefreshToken(user) {
  return jwt.sign({ userId: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: `${REFRESH_DAYS}d` });
}

export async function signup(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const role = await prisma.role.findUnique({ where: { name: 'TENANT' } });
    if (!role) return res.status(400).json({ error: 'Tenant role not found' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash, roleId: role.id },
      include: { role: true },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Missing credentials' });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: 'refreshToken required' });

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    if (payload.type !== 'refresh')
      return res.status(401).json({ error: 'Invalid token type' });

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ error: 'Invalid refresh token' });

    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  res.json({ ok: true });
}
