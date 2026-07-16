const subscribers = new Set<string>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof payload === "object" && payload !== null && "email" in payload
      ? String(payload.email).trim().toLowerCase()
      : "";

  if (!EMAIL_PATTERN.test(email)) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  if (subscribers.has(email)) {
    return Response.json({ subscribed: true, alreadySubscribed: true });
  }

  // Mock-only storage for the demo. Replace this Set with the newsletter database integration.
  subscribers.add(email);

  return Response.json({ subscribed: true, alreadySubscribed: false }, { status: 201 });
}
