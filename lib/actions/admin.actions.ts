"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";

// Superadmin credentials - you can change these
const SUPERADMIN_EMAIL = "superadmin@horizon.com";
const SUPERADMIN_PASSWORD = "SuperAdmin@123";
const SUPERADMIN_NAME = "Super Admin";

export const createSuperadmin = async () => {
  try {
    const { account, Users } = await createAdminClient();

    // Check if superadmin already exists
    const existingUsers = await Users.list([
      Query.equal("email", [SUPERADMIN_EMAIL]),
    ]);

    if (existingUsers.total > 0) {
      return parseStringify({
        message: "Superadmin already exists",
        user: existingUsers.users[0],
      });
    }

    // Create superadmin user
    const newUser = await Users.create(
      ID.unique(),
      SUPERADMIN_EMAIL,
      undefined, // phone
      SUPERADMIN_PASSWORD,
      SUPERADMIN_NAME
    );

    // Create admin team
    const { Teams } = await createAdminClient();
    let adminTeam;
    try {
      adminTeam = await Teams.create("admins", "Administrators");
    } catch (e) {
      // Team might already exist
      const teams = await Teams.list([Query.equal("name", ["Administrators"])]);
      adminTeam = teams.teams[0];
    }

    // Add superadmin to admin team
    await Teams.createMembership(
      adminTeam.$id,
      ["owner"],
      SUPERADMIN_EMAIL
    );

    // Set admin labels
    await Users.updateLabels(newUser.$id, ["superadmin"]);

    return parseStringify({
      message: "Superadmin created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating superadmin:", error);
    return null;
  }
};

export const isSuperadmin = async () => {
  try {
    const { account } = await createAdminClient();
    const user = await account.get();

    // Check if user has superadmin label
    const labels = user.labels || [];
    return labels.includes("superadmin");
  } catch (error) {
    return false;
  }
};

export const signInSuperadmin = async () => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(
      SUPERADMIN_EMAIL,
      SUPERADMIN_PASSWORD
    );

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify(session);
  } catch (error) {
    console.error("Error signing in superadmin:", error);
    return null;
  }
};
