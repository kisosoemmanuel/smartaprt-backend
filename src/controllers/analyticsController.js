import prisma from '../prismaClient.js';

export async function occupancyRate(req, res) {
  const total = await prisma.unit.count();
  const occupied = await prisma.unit.count({ where: { tenantId: { not: null } } });
  const rate = total === 0 ? 0 : (occupied / total) * 100;
  res.json({ total, occupied, rate });
}

export async function overdueRentCount(req, res) {
  const count = await prisma.invoice.count({
    where: {
      status: 'UNPAID',
      dueDate: { lt: new Date() }
    }
  });
  res.json({ overdue: count });
}

// additional stats can be added later
