
import cuid from "cuid";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const newChatId = cuid();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get the next order integer for this user
    const maxOrder = await prisma.chat.aggregate({
      _max: { order: true },
      where: { userId: session.user.id },
    });
    const nextOrder = (maxOrder._max.order ? Number(maxOrder._max.order) : 0) + 1;

    // Create the new chat record
    const chat = await prisma.chat.create({
      data: {
        id: newChatId,
        userId: session.user.id,
        order: nextOrder,
        title: "Untitled",
      },
    });

    // res.status(200).json({ chat });
    res.status(200).json({
      chat: {
        ...chat,
        order: chat.order ? Number(chat.order) : null,
      }
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
}


