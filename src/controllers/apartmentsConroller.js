import prisma from '../prismaClient.js';

export async function createApartment(req, res) {
  const { name, address } = req.body;
  const a = await prisma.apartment.create({ data: { name, address } });
  res.json(a);
}

export async function listApartments(req, res) {
  const apartments = await prisma.apartment.findMany({ include: { units: true } });
  res.json(apartments);
}

export async function createUnit(req, res) {
  const { apartmentId, number } = req.body;
  const u = await prisma.unit.create({ data: { apartmentId: Number(apartmentId), number } });
  res.json(u);
}

export async function assignTenant(req, res) {
  const { unitId } = req.params;
  const { tenantId } = req.body;
  const unit = await prisma.unit.update({ where: { id: Number(unitId) }, data: { tenantId: Number(tenantId) } });
  await prisma.user.update({ where: { id: Number(tenantId) }, data: { tenantUnitId: Number(unitId) } });
  res.json(unit);
}
