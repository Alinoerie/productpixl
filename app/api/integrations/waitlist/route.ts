import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

type WaitlistEntry = {
  email: string;
  integration: string;
  createdAt: string;
};

type WaitlistStore = {
  entries: WaitlistEntry[];
};

const STORE_PATH = path.join(process.cwd(), "data", "integration-waitlist.json");

async function getStore(): Promise<WaitlistStore> {
  try {
    const data = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { entries: [] };
  }
}

async function saveStore(store: WaitlistStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { email?: string; integration?: string };
  const { email, integration } = body;

  if (!email || !integration) {
    return NextResponse.json({ error: "Email and integration are required" }, { status: 400 });
  }

  if (!["amazon", "shopify", "zapier"].includes(integration)) {
    return NextResponse.json({ error: "Invalid integration" }, { status: 400 });
  }

  const store = await getStore();

  // Check if already on waitlist for this integration
  const existing = store.entries.find(
    (e) => e.email.toLowerCase() === email.toLowerCase() && e.integration === integration
  );

  if (existing) {
    return NextResponse.json({ success: true, message: "Already on the waitlist" });
  }

  store.entries.push({
    email,
    integration,
    createdAt: new Date().toISOString(),
  });

  await saveStore(store);

  return NextResponse.json({ success: true, message: "Added to waitlist" });
}
