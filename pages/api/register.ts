import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, first_name, last_name } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        first_name,
        last_name,
      },
    });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
