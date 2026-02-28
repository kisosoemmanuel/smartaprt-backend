import prisma from '../prismaClient.js';

export async function createSuggestion(req, res) {
  const { title, content } = req.body;
  try {
    const sug = await prisma.suggestion.create({
      data: {
        title,
        content,
        userId: req.user ? req.user.id : null,
      }
    });
    res.json(sug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listSuggestions(req, res) {
  // restrict to staff/landlord/caretaker
  const suggestions = await prisma.suggestion.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(suggestions);
}