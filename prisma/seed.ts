// prisma/seed.ts - Database Seed Script
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Categories
  console.log("Creating categories...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "小说", description: "各类小说作品" },
    }),
    prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "科幻", description: "科幻类图书" },
    }),
    prisma.category.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "历史", description: "历史类图书" },
    }),
    prisma.category.upsert({
      where: { id: 4 },
      update: {},
      create: { name: "计算机", description: "计算机与技术类图书" },
    }),
    prisma.category.upsert({
      where: { id: 5 },
      update: {},
      create: { name: "经济管理", description: "经济与管理类图书" },
    }),
    prisma.category.upsert({
      where: { id: 6 },
      update: {},
      create: { name: "文学", description: "文学作品" },
    }),
    prisma.category.upsert({
      where: { id: 7 },
      update: {},
      create: { name: "艺术", description: "艺术类图书" },
    }),
    prisma.category.upsert({
      where: { id: 8 },
      update: {},
      create: { name: "童书", description: "儿童读物" },
    }),
    prisma.category.upsert({
      where: { id: 9 },
      update: {},
      create: { name: "教育", description: "教育类图书" },
    }),
    prisma.category.upsert({
      where: { id: 10 },
      update: {},
      create: { name: "生活", description: "生活类图书" },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Create Books
  console.log("Creating books...");
  const booksData = [
    { isbn: "9787536692930", title: "三体", author: "刘慈欣", publisher: "重庆出版社", price: 93.00, stockQuantity: 100, description: "亚洲首位雨果奖得主刘慈欣代表作，中国科幻文学里程碑之作", coverImage: "https://img1.doubanio.com/view/subject/m/public/s2768378.jpg", categoryId: 2, salesCount: 156 },
    { isbn: "9787020024759", title: "红楼梦", author: "曹雪芹", publisher: "人民文学出版社", price: 59.70, stockQuantity: 80, description: "中国古典四大名著之一", coverImage: "https://img1.doubanio.com/view/subject/m/public/s1070959.jpg", categoryId: 1, salesCount: 89 },
    { isbn: "9787111213826", title: "深入理解计算机系统", author: "Randal E. Bryant", publisher: "机械工业出版社", price: 139.00, stockQuantity: 50, description: "程序员必读经典，从程序员角度理解计算机系统", coverImage: "https://img1.doubanio.com/view/subject/m/public/s29195878.jpg", categoryId: 4, salesCount: 67 },
    { isbn: "9787544253994", title: "百年孤独", author: "加西亚·马尔克斯", publisher: "南海出版公司", price: 39.50, stockQuantity: 60, description: "魔幻现实主义文学代表作", coverImage: "https://img1.doubanio.com/view/subject/m/public/s27237850.jpg", categoryId: 1, salesCount: 123 },
    { isbn: "9787020008735", title: "西游记", author: "吴承恩", publisher: "人民文学出版社", price: 47.20, stockQuantity: 70, description: "中国古典四大名著之一", coverImage: "https://img9.doubanio.com/view/subject/m/public/s1627374.jpg", categoryId: 1, salesCount: 95 },
    { isbn: "9787508353944", title: "明朝那些事儿", author: "当年明月", publisher: "中国友谊出版公司", price: 358.20, stockQuantity: 45, description: "全景展现明朝三百年兴衰", coverImage: "https://img1.doubanio.com/view/subject/m/public/s29399938.jpg", categoryId: 3, salesCount: 78 },
    { isbn: "9787111407010", title: "算法导论", author: "Thomas H. Cormen", publisher: "机械工业出版社", price: 128.00, stockQuantity: 40, description: "算法领域的经典教材", coverImage: "https://img9.doubanio.com/view/subject/m/public/s25648004.jpg", categoryId: 4, salesCount: 45 },
    { isbn: "9787115428028", title: "Python编程从入门到实践", author: "Eric Matthes", publisher: "人民邮电出版社", price: 89.00, stockQuantity: 55, description: "Python入门经典教程", coverImage: "https://img9.doubanio.com/view/subject/m/public/s28891775.jpg", categoryId: 4, salesCount: 112 },
    { isbn: "9787508672069", title: "人类简史", author: "尤瓦尔·赫拉利", publisher: "中信出版社", price: 68.00, stockQuantity: 65, description: "从动物到上帝，人类发展历程", coverImage: "https://img2.doubanio.com/view/subject/m/public/s29357031.jpg", categoryId: 3, salesCount: 134 },
    { isbn: "9787020002207", title: "水浒传", author: "施耐庵", publisher: "人民文学出版社", price: 45.00, stockQuantity: 75, description: "中国古典四大名著之一", coverImage: "https://img1.doubanio.com/view/subject/m/public/s1436519.jpg", categoryId: 1, salesCount: 82 },
    { isbn: "9787506365437", title: "活着", author: "余华", publisher: "作家出版社", price: 28.00, stockQuantity: 90, description: "余华代表作，讲述一个人的苦难与坚韧", coverImage: "https://img9.doubanio.com/view/subject/m/public/s29869926.jpg", categoryId: 1, salesCount: 201 },
    { isbn: "9787544270878", title: "小王子", author: "安东尼·德·圣-埃克苏佩里", publisher: "接力出版社", price: 32.00, stockQuantity: 100, description: "写给大人的童话，关于爱与责任", coverImage: "https://img1.doubanio.com/view/subject/m/public/s1237549.jpg", categoryId: 8, salesCount: 178 },
  ];

  for (const bookData of booksData) {
    await prisma.book.upsert({
      where: { isbn: bookData.isbn },
      update: bookData,
      create: bookData,
    });
  }
  console.log(`✅ Created ${booksData.length} books`);

  // Create Test User
  console.log("Creating test user...");
  const hashedPassword = await bcrypt.hash("123456", 10);
  const testUser = await prisma.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: {
      username: "testuser",
      password: hashedPassword,
      email: "test@example.com",
      fullName: "测试用户",
      phone: "13800138000",
      address: "北京市朝阳区测试街道123号",
      city: "北京",
      postalCode: "100000",
    },
  });

  // Create cart for test user
  await prisma.shoppingCart.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { userId: testUser.id },
  });
  console.log(`✅ Created test user: ${testUser.username} (password: 123456)`);

  // Create Admin
  console.log("Creating admin...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      email: "admin@bookstore.com",
      fullName: "系统管理员",
      phone: "13900139000",
    },
  });
  console.log(`✅ Created admin: ${admin.username} (password: admin123)`);

  // Create Roles
  console.log("Creating roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { roleKey: "super_admin" },
    update: {},
    create: {
      roleName: "超级管理员",
      roleKey: "super_admin",
      description: "拥有系统所有权限",
    },
  });

  await prisma.role.upsert({
    where: { roleKey: "operation_admin" },
    update: {},
    create: {
      roleName: "运营管理员",
      roleKey: "operation_admin",
      description: "负责图书和订单管理",
    },
  });
  console.log("✅ Created roles");

  // Assign role to admin
  await prisma.adminRole.upsert({
    where: { adminId_roleId: { adminId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { adminId: admin.id, roleId: superAdminRole.id },
  });
  console.log("✅ Assigned super_admin role to admin");

  console.log("\n🎉 Database seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
