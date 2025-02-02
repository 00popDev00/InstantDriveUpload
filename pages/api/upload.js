import { google } from "googleapis";
import multer from "multer";
import { connectToDatabase } from "../../lib/mongodb";
import Image from "../../models/Image";
import { getSession } from "next-auth/react";
import { Readable } from "stream";

export const config = {
  api: { bodyParser: false },
};

const upload = multer();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, async (err) => {
      if (err)
        return reject(res.status(500).json({ error: "File upload error" }));

      const { file } = req;
      if (!file)
        return reject(res.status(400).json({ error: "No file uploaded" }));

      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: session.user.accessToken });

      const drive = google.drive({ version: "v3", auth });
      const fileMetadata = { name: file.originalname };
      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      try {
        const driveFile = await drive.files.create({
          requestBody: fileMetadata,
          media,
          fields: "id",
        });

        const fileId = driveFile.data.id;
        const googleDriveLink = `https://drive.google.com/file/d/${fileId}/view`;

        await connectToDatabase();
        await Image.create({
          userEmail: session.user.email,
          fileName: file.originalname,
          googleDriveLink,
        });

        resolve(res.status(200).json({ googleDriveLink }));
      } catch (error) {
        reject(res.status(500).json({ error: error.message }));
      }
    });
  });
}
