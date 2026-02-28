import prisma from '../prismaClient.js';

export async function createTicket(req, res) {
  const { title, description, unitId, priority, images } = req.body;
  try {
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        unitId: unitId ? Number(unitId) : null,
        priority: priority || 'MEDIUM',
        images: images || null,
        createdById: req.user ? req.user.id : null
      }
    });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listTickets(req, res) {
  // role-based filtering:
  if (req.user.role.name === 'TENANT') {
    // tenant sees tickets for their unit or created by them
    const where = {
      OR: [
        { createdById: req.user.id },
        { unit: { tenantId: req.user.id } }
      ]
    };
    const tickets = await prisma.maintenanceTicket.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.json(tickets);
  } else {
    // admin/caretaker see all
    const tickets = await prisma.maintenanceTicket.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(tickets);
  }
}

export async function updateTicket(req, res) {
  const { id } = req.params;
  const data = req.body; // { status, assignedToId, ... }
  try {
    // Only caretaker/landlord/admin allowed to modify broadly
    const ticket = await prisma.maintenanceTicket.update({ where: { id: Number(id) }, data });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
