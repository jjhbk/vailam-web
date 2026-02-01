import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("veilai");
    const collection = db.collection("waitlist");

    // Prevent duplicates
    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 200 }
      );
    }

    await collection.insertOne({
      email,
      createdAt: new Date(),
      source: "landing_page",
    });

    return NextResponse.json(
      { message: "Successfully joined waitlist" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
