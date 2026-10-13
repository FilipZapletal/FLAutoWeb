// Ikony aplikací na ploše telefonu (čtverce s celým logem FL Auto).
//  - veřejný web: logo na černém pozadí  -> src/app/apple-icon.png
//  - administrace: logo na bílém pozadí  -> public/icons/admin-{180,192,512}.png
// Spuštění: node scripts/make-admin-icons.mjs
import sharp from "sharp";

/** Barva pozadí loga (levý horní roušek), aby čtverec kolem loga nebyl znát. */
async function cornerColor(file) {
  const { data } = await sharp(file).extract({ left: 2, top: 2, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2] };
}

async function icon(logoFile, size, out) {
  const background = await cornerColor(logoFile);
  const logo = await sharp(logoFile)
    .resize({ width: Math.round(size * 0.84), fit: "inside" })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "center" }])
    .flatten({ background })
    .png()
    .toFile(out);
}

await icon("public/logo-dark.png", 180, "src/app/apple-icon.png");
for (const size of [180, 192, 512]) await icon("public/logo-light.png", size, `public/icons/admin-${size}.png`);
console.log("Hotovo: src/app/apple-icon.png a public/icons/admin-{180,192,512}.png");
