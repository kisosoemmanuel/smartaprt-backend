import prisma from '../prismaClient.js';

export async function sendMessage(req, res) {
  const { recipientId, content } = req.body;
  try {
    const msg = await prisma.message.create({
      data: {
        senderId: req.user.id,
        recipientId: Number(recipientId),
        content,
      }
    });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listMessages(req, res) {
  // return both sent and received
  const msgs = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.id },
        { recipientId: req.user.id }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(msgs);
}

export async function conversation(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user.id;
  const conv = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: Number(otherUserId) },
        { senderId: Number(otherUserId), recipientId: userId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
  res.json(conv);
}