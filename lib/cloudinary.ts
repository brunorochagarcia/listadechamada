import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5 MB

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/alunos");

export async function uploadFoto(file: File): Promise<{ url: string; publicId: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  return {
    url: `/uploads/alunos/${filename}`,
    publicId: filename,
  };
}

export async function deleteFoto(publicId: string) {
  const filepath = path.join(UPLOAD_DIR, publicId);
  await unlink(filepath).catch(() => null);
}
