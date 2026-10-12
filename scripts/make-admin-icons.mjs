// Ikony administrace (aplikace na ploše, upozornění): tmavý čtverec s logem FL Auto.
// Spuštění: node scripts/make-admin-icons.mjs
import sharp from "sharp";

const BG = "#0b0c0e";
for (const size of [180, 192, 512]) {
  const logo = await sharp("public/logo-dark.png")
    .resize({ width: Math.round(size * 0.78), fit: "inside" })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`public/icons/admin-${size}.png`);
}
console.log("Hotovo: public/icons/admin-{180,192,512}.png");
