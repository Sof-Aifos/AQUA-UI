
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false, // We'll handle the stream manually
  },
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Secure: Only allow logged-in users
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse the multipart form data
  const busboy = require("busboy");
  const bb = busboy({ headers: req.headers });

  let savePath = "";
  let fileWritePromise: Promise<void> | null = null;

  bb.on("file", (fieldname: string, file: NodeJS.ReadableStream, filename: string) => {
    // Only allow .mp3 files
    if (!filename.endsWith(".mp3")) {
      file.resume();
      return res.status(400).json({ error: "Only .mp3 files allowed" });
    }
    const storageDir = path.join(process.cwd(), "storage", "audio_messages");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    savePath = path.join(storageDir, filename);
    const writeStream = fs.createWriteStream(savePath);
    fileWritePromise = new Promise((resolve, reject) => {
      file.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
  });

  bb.on("finish", async () => {
    try {
      if (fileWritePromise) {
        await fileWritePromise;
        return res.status(200).json({ success: true, path: savePath });
      } else {
        return res.status(400).json({ error: "No file uploaded" });
      }
    } catch (err) {
      return res.status(500).json({ error: "Failed to save file" });
    }
  });

  req.pipe(bb);
}
