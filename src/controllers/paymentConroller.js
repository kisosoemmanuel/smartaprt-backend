import prisma from '../prismaClient.js';

export async function createInvoice(req, res) {
  const { tenantId, amount, dueDate } = req.body;
  const inv = await prisma.invoice.create({
    data: {
      tenantId: Number(tenantId),
      amount: Number(amount),
      dueDate: new Date(dueDate),
      status: 'UNPAID'
    }
  });
  res.json(inv);
}

export async function listInvoices(req, res) {
  if (req.user.role.name === 'TENANT') {
    const inv = await prisma.invoice.findMany({ where: { tenantId: req.user.id } });
    return res.json(inv);
  } else {
    const inv = await prisma.invoice.findMany();
    return res.json(inv);
  }
}

export async function createPaymentRecord(req, res) {
  const { tenantId, invoiceId, amount, method } = req.body;
  const payment = await prisma.payment.create({
    data: {
      tenantId: Number(tenantId),
      amount: Number(amount),
      method: method || 'MPESA',
      status: 'PENDING',
      description: invoiceId ? `Invoice ${invoiceId}` : null
    }
  });
  res.json(payment);
}
