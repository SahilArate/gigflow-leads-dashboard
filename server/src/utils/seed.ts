import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../modules/auth/auth.model";
import { Lead } from "../modules/leads/leads.model";
import { UserRole, LeadStatus, LeadSource } from "../types";

const seedData = async () => {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Create admin user
  const existingAdmin = await User.findOne({ email: "admin@gigflow.com" });
  let admin;

  if (!existingAdmin) {
    admin = await User.create({
      name: "Admin User",
      email: "admin@gigflow.com",
      password: "Admin1234",
      role: UserRole.ADMIN,
    });
    console.log("✅ Admin created — email: admin@gigflow.com, password: Admin1234");
  } else {
    admin = existingAdmin;
    console.log("✅ Admin already exists");
  }

  // Delete existing leads
  await Lead.deleteMany({});

  // Create dummy leads
  const leads = [
    { name: "Rahul Sharma", email: "rahul@example.com", status: LeadStatus.NEW, source: LeadSource.INSTAGRAM, notes: "Interested in premium plan", createdBy: admin._id },
    { name: "Priya Patel", email: "priya@example.com", status: LeadStatus.CONTACTED, source: LeadSource.WEBSITE, notes: "Called twice, no response", createdBy: admin._id },
    { name: "Amit Singh", email: "amit@example.com", status: LeadStatus.QUALIFIED, source: LeadSource.REFERRAL, notes: "Ready to close deal", createdBy: admin._id },
    { name: "Neha Gupta", email: "neha@example.com", status: LeadStatus.LOST, source: LeadSource.WEBSITE, notes: "Went with competitor", createdBy: admin._id },
    { name: "Vikram Mehta", email: "vikram@example.com", status: LeadStatus.NEW, source: LeadSource.INSTAGRAM, notes: "DM on Instagram", createdBy: admin._id },
    { name: "Anjali Verma", email: "anjali@example.com", status: LeadStatus.CONTACTED, source: LeadSource.REFERRAL, notes: "Referred by Amit", createdBy: admin._id },
    { name: "Rohit Kumar", email: "rohit@example.com", status: LeadStatus.QUALIFIED, source: LeadSource.WEBSITE, notes: "Demo scheduled", createdBy: admin._id },
    { name: "Sunita Joshi", email: "sunita@example.com", status: LeadStatus.NEW, source: LeadSource.INSTAGRAM, notes: "Liked our post", createdBy: admin._id },
    { name: "Karan Malhotra", email: "karan@example.com", status: LeadStatus.CONTACTED, source: LeadSource.WEBSITE, notes: "Filled contact form", createdBy: admin._id },
    { name: "Deepika Nair", email: "deepika@example.com", status: LeadStatus.QUALIFIED, source: LeadSource.REFERRAL, notes: "High priority lead", createdBy: admin._id },
    { name: "Arjun Reddy", email: "arjun@example.com", status: LeadStatus.NEW, source: LeadSource.WEBSITE, notes: "Downloaded our brochure", createdBy: admin._id },
    { name: "Meera Iyer", email: "meera@example.com", status: LeadStatus.LOST, source: LeadSource.INSTAGRAM, notes: "Budget constraints", createdBy: admin._id },
  ];

  await Lead.insertMany(leads);
  console.log(`✅ Created ${leads.length} leads`);
  console.log("🎉 Seeding complete!");

  await mongoose.connection.close();
  process.exit(0);
};

seedData().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});