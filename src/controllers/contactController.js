import prisma from '../prismaClient.js';

export async function listContacts(req, res) {
  // optionally filter by apartment
  const apartmentId = req.query.apartmentId;
  const where = {};
  if (apartmentId) where.apartmentId = Number(apartmentId);
  const contacts = await prisma.emergencyContact.findMany({ where });
  res.json(contacts);
}

export async function createContact(req, res) {
  const { name, phone, relation, apartmentId } = req.body;
  try {
    const contact = await prisma.emergencyContact.create({
      data: {
        name,
        phone,
        relation,
        apartmentId: apartmentId ? Number(apartmentId) : null,
      }
    });
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}