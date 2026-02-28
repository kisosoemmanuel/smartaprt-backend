import prisma from '../prismaClient.js';

export async function createEvent(req, res) {
  const { title, description, start, end, apartmentId } = req.body;
  try {
    const ev = await prisma.event.create({
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        apartmentId: apartmentId ? Number(apartmentId) : null,
      }
    });
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listEvents(req, res) {
  const apartmentId = req.query.apartmentId;
  const where = {};
  if (apartmentId) where.apartmentId = Number(apartmentId);
  const evts = await prisma.event.findMany({ where, orderBy: { start: 'asc' } });
  res.json(evts);
}