import prisma from '../prismaClient.js';

export async function createUpdate(req, res) {
  const { title, content, apartmentId, publishedAt } = req.body;
  try {
    const update = await prisma.update.create({
      data: {
        title, content, apartmentId: apartmentId || null, authorId: req.user.id,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      }
    });
    res.json(update);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listUpdates(req, res) {
  const apartmentId = req.query.apartmentId;
  const where = { isActive: true };
  if (apartmentId) where.apartmentId = Number(apartmentId);
  const updates = await prisma.update.findMany({
    where,
    include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { publishedAt: 'desc' }
  });
  res.json(updates);
}
