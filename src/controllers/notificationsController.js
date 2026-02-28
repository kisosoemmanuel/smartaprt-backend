import prisma from '../prismaClient.js';

// send a notification to a specific user (landlord/caretaker)
export async function createNotification(req, res) {
  const { recipientId, title, message } = req.body;
  try {
    const notif = await prisma.notification.create({
      data: {
        recipientId: Number(recipientId),
        title,
        message,
      }
    });
    // TODO: integrate email/push delivery here
    res.json(notif);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listNotifications(req, res) {
  const notes = await prisma.notification.findMany({
    where: { recipientId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(notes);
}

export async function markSeen(req, res) {
  const { id } = req.params;
  const updated = await prisma.notification.update({
    where: { id: Number(id) },
    data: { seen: true }
  });
  res.json(updated);
}