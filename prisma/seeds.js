import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma.js";
import { generateSlug } from "../src/utils/generateSlug.js";

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── 1. ADMIN ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin criado: ${admin.email}`);

  // ── 2. CATEGORIAS ─────────────────────────────────────────
  const categoriesData = [
    { name: "Guitarras" },
    { name: "Baixos" },
    { name: "Acessórios" },
  ];

  const categories = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: generateSlug(cat.name) },
      update: {},
      create: {
        name: cat.name,
        slug: generateSlug(cat.name),
      },
    });
    categories[cat.name] = created;
    console.log(`✅ Categoria criada: ${created.name}`);
  }

  // ── 3. PRODUTOS ───────────────────────────────────────────
  const productsData = [
    {
      categoryId: categories["Guitarras"].id,
      name: "Fender Stratocaster Player",
      mark: "Fender",
      description: "Guitarra elétrica de alto desempenho, corpo em alder, escala em pau-ferro.",
      price: 4999.99,
      stock: 10,
      imageUrl: "https://placehold.co/600x400?text=Stratocaster+1",
      images: [
        "https://placehold.co/600x400?text=Stratocaster+1",
        "https://placehold.co/600x400?text=Stratocaster+2",
        "https://placehold.co/600x400?text=Stratocaster+3",
      ],
    },
    {
      categoryId: categories["Guitarras"].id,
      name: "Gibson Les Paul Standard",
      mark: "Gibson",
      description: "Guitarra clássica com captadores humbucker e acabamento premium.",
      price: 12500.0,
      stock: 5,
      imageUrl: "https://placehold.co/600x400?text=LesPaul+1",
      images: [
        "https://placehold.co/600x400?text=LesPaul+1",
        "https://placehold.co/600x400?text=LesPaul+2",
        "https://placehold.co/600x400?text=LesPaul+3",
      ],
    },
    {
      categoryId: categories["Baixos"].id,
      name: "Fender Jazz Bass",
      mark: "Fender",
      description: "Baixo elétrico versátil com dois captadores single-coil, ideal para todos os estilos.",
      price: 3800.0,
      stock: 8,
      imageUrl: "https://placehold.co/600x400?text=JazzBass+1",
      images: [
        "https://placehold.co/600x400?text=JazzBass+1",
        "https://placehold.co/600x400?text=JazzBass+2",
        "https://placehold.co/600x400?text=JazzBass+3",
      ],
    },
    {
      categoryId: categories["Baixos"].id,
      name: "Music Man StingRay",
      mark: "Ernie Ball",
      description: "Baixo com captador humbucker ativo, timbre poderoso e presença de palco.",
      price: 9200.0,
      stock: 3,
      imageUrl: "https://placehold.co/600x400?text=StingRay+1",
      images: [
        "https://placehold.co/600x400?text=StingRay+1",
        "https://placehold.co/600x400?text=StingRay+2",
        "https://placehold.co/600x400?text=StingRay+3",
      ],
    },
    {
      categoryId: categories["Acessórios"].id,
      name: "Cabo P10 Monster Cable 6m",
      mark: "Monster Cable",
      description: "Cabo de instrumento premium com blindagem total e conectores banhados a ouro.",
      price: 299.9,
      stock: 50,
      imageUrl: "https://placehold.co/600x400?text=MonsterCable+1",
      images: [
        "https://placehold.co/600x400?text=MonsterCable+1",
        "https://placehold.co/600x400?text=MonsterCable+2",
        "https://placehold.co/600x400?text=MonsterCable+3",
      ],
    },
  ];

  for (const { images, ...prod } of productsData) {
    const created = await prisma.product.upsert({
      where: { slug: generateSlug(prod.name) },
      update: {},
      create: {
        ...prod,
        slug: generateSlug(prod.name),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    await prisma.productImage.createMany({
      data: images.map((url) => ({ productId: created.id, url })),
    });

    console.log(`✅ Produto criado: ${created.name} (${images.length} imagens)`);
  }

  console.log("\n🎸 Seed concluído com sucesso!");
  console.log("──────────────────────────────────");
  console.log("📧 Email admin : admin@example.com");
  console.log("🔑 Senha       : admin123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });