import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const adminPwd = await bcrypt.hash("admin123!", 10);
  const driverPwd = await bcrypt.hash("driver123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: adminPwd,
      role: "ADMIN",
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: "driver@example.com" },
    update: {},
    create: {
      name: "Driver One",
      email: "driver@example.com",
      password: driverPwd,
      role: "DRIVER",
    },
  });

  const loc = await prisma.location.create({
    data: { name: "Yard A", city: "Greenville", state: "SC" },
  });
  const job = await prisma.job.create({
    data: {
      name: "Line Repaint – Main St",
      client: "City of Greenville",
      locationId: loc.id,
    },
  });
  const veh = await prisma.vehicle.create({
    data: { label: "Truck 12", plate: "SC-12345" },
  });

  await prisma.sheet.create({
    data: {
      date: new Date(),
      driverId: driver.id,
      jobId: job.id,
      vehicleId: veh.id,
      miles: 18,
      materials: { paint_gal: 6, beads_lb: 20 },
      notes: "Night shift, good weather.",
      status: "SUBMITTED",
      events: {
        create: [
          { userId: admin.id, type: "CREATE", payload: { via: "seed" } },
        ],
      },
    },
  });

  console.log("Seed done.");
}

main().finally(() => prisma.$disconnect());
