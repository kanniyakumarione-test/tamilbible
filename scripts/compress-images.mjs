import sharp from "sharp";
import { readdir, mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BG_DIR = path.join(__dirname, "..", "public", "bg");
const BACKUP_DIR = path.join(BG_DIR, "backup");

async function compressImages() {
  try {
    // 1. Create backup directory
    try {
      await access(BACKUP_DIR);
    } catch {
      await mkdir(BACKUP_DIR, { recursive: true });
    }

    const files = await readdir(BG_DIR);
    const images = files.filter(f => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg"));

    console.log(`Found ${images.length} images to compress...`);

    for (const file of images) {
      const inputPath = path.join(BG_DIR, file);
      const backupPath = path.join(BACKUP_DIR, file);

      // 2. Backup if not already backed up
      try {
        await access(backupPath);
        console.log(`Backup for ${file} already exists, skipping backup.`);
      } catch {
        console.log(`Backing up ${file}...`);
        await copyFile(inputPath, backupPath);
      }

      // 3. Compress
      console.log(`Compressing ${file}...`);
      const tempPath = path.join(BG_DIR, `temp_${file}`);

      await sharp(backupPath)
        .resize({
          width: 1920,
          withoutEnlargement: true
        })
        .jpeg({ quality: 82, progressive: true })
        .toFile(tempPath);

      // Replace original with compressed version
      await copyFile(tempPath, inputPath);
      // Clean up temp
      const { unlink } = await import("node:fs/promises");
      await unlink(tempPath);

      console.log(`✓ Compressed ${file} successfully.`);
    }

    console.log("\nAll images compressed! Total UI lag reduction will be significant.");
  } catch (error) {
    console.error("Compression failed:", error);
  }
}

compressImages();
