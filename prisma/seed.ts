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
      status: "SUBMITTED",
      notes: "Seeded example sheet",
      materials: {
        // ---- Job Details ----
        road_name: "Main Street",
        contractor: "Reeves",
        contract_number: "235400",
        workers: "RF, JT",
        job_time_arrived: "08:00",
        job_time_finished: "12:00",
        dot_employee: false,
        dot_employee_name: "",
        invoice_number: "INV-123",
        fed_payroll: "FP-456",
        job_totals: "Some total",
        daily_minimum: "1000",
        location: "Greenville, SC",

        // ---- PAINT ----
        paint_4_yel_sld: 120,
        paint_4_yel_skip: 80,
        paint_4_wh_sld: 150,
        paint_4_wh_skip: 90,
        paint_6_yel_sld: 50,
        paint_6_yel_skip: 25,
        paint_6_wh_sld: 40,
        paint_6_wh_skip: 30,
        paint_8_wh_sld: 10,
        paint_12_wh_sld: 5,
        paint_24_wh_sld: 2,
        paint_yield_12x18: 4,
        paint_arrows: 12,
        paint_combo: 3,
        paint_stencil: 7,
        paint_speed_hump: 1,

        // ---- RPM ----
        rpm_amber_1_way: 10,
        rpm_amber_2_way: 6,
        rpm_clear_1_way: 8,
        rpm_clear_2_way: 5,

        // ---- GRINDING ----
        grinding_4_wide: 3,
        grinding_24_wide: 1,

        // ---- THERMO ----
        thermo_4_yel_sld: 15,
        thermo_4_yel_skip: 7,
        thermo_4_wh_sld: 12,
        thermo_4_wh_skip: 5,
        thermo_6_yel_sld: 8,
        thermo_6_wh_sld: 10,
        thermo_6_wh_skip: 4,
        thermo_8_wh_sld: 2,
        thermo_12_wh_sld: 1,
        thermo_24_wh_sld: 1,
        thermo_yield_12x18: 2,
        thermo_arrow: 6,
        thermo_combo: 2,
        thermo_speed_hump: 1,

        // ---- NOTES ----
        notes: "Night shift, dry weather, smooth job",
      },
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
