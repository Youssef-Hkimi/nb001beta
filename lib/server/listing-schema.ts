import {z} from "zod";

const optionalUrl = z.union([z.literal(""), z.string().url().max(500)]).optional();

const listingObjectSchema = z.object({
  type: z.enum(["server", "bot"]),
  discordId: z.string().regex(/^\d{15,22}$/),
  name: z.string().trim().min(2).max(100),
  shortDescription: z.string().trim().min(10).max(240),
  longDescription: z.string().trim().max(8000).default(""),
  category: z.string().trim().min(2).max(80),
  tags: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
  featureIds: z.array(z.string().trim().min(1).max(80)).max(24).default([]),
  language: z.string().trim().min(2).max(60).default("English"),
  region: z.string().trim().min(2).max(60).default("Global"),
  inviteUrl: z.string().url().max(500),
  supportUrl: optionalUrl,
  websiteUrl: optionalUrl,
  githubUrl: optionalUrl,
  botPrefix: z.string().trim().max(20).optional(),
  botCommands: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(500),
  })).max(100).default([]),
  premium: z.boolean().default(false),
  bannerColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#325578"),
  skipWidgetVerification: z.boolean().default(false),
});

export const createListingSchema = listingObjectSchema.superRefine((value, context) => {
  if (value.type === "bot" && !value.botPrefix) {
    context.addIssue({code: "custom", path: ["botPrefix"], message: "Bot prefix is required"});
  }
});

export const updateListingSchema = listingObjectSchema
  .omit({type: true, discordId: true, skipWidgetVerification: true})
  .partial();

export function createSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70) || "listing";
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}
