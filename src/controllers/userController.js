import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';

export async function getProfile(req, res) {
  // req.user is populated by authMiddleware
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, photoUrl: true, role: true }
  });
  res.json(user);
}

export async function updateProfile(req, res) {
  const { name, phone, photoUrl, password } = req.body;
  const data = {};
  if (name) data.name = name;
  if (phone) data.phone = phone;
  if (photoUrl) data.photoUrl = photoUrl;
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });
    res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, photoUrl: updated.photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}