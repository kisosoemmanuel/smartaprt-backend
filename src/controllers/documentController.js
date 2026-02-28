import prisma from '../prismaClient.js';

export async function uploadDocument(req, res) {
  const { title, url } = req.body; // assuming frontend uploads to storage and provides url
  try {
    const doc = await prisma.document.create({
      data: {
        title,
        url,
        uploadedBy: req.user.id,
      }
    });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listDocuments(req, res) {
  const docs = await prisma.document.findMany({
    where: { uploadedBy: req.user.id } // users only see own uploads
  });
  res.json(docs);
}