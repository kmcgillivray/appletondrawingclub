import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { auto as autoFormat } from "@cloudinary/url-gen/qualifiers/format";
import { auto as autoQuality } from "@cloudinary/url-gen/qualifiers/quality";
import { compass, autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { center, north } from "@cloudinary/url-gen/qualifiers/compass";
import type { Event } from "$lib/types";

const cld = new Cloudinary({
  cloud: { cloudName: "db5mnmxzn" },
  url: { analytics: false }, // omit the ?_a= SDK tracking query param
});

const PRESETS = {
  card: { w: 750, h: 750 }, // square thumbnail (matches today's cards)
  hero: { w: 1200, h: 750 }, // detail hero, if/when migrated
  og: { w: 1200, h: 630 }, // social share image
} as const;

export type CloudinaryPreset = keyof typeof PRESETS;
export type CloudinaryGravity = "center" | "north" | "auto";

function resolveGravity(gravity: CloudinaryGravity) {
  if (gravity === "north") return compass(north());
  if (gravity === "auto") return autoGravity();
  return compass(center());
}

export function cloudinaryUrl(
  publicId: string,
  preset: CloudinaryPreset = "card",
  gravity: CloudinaryGravity = "center",
): string {
  const { w, h } = PRESETS[preset];
  return cld
    .image(publicId)
    .resize(fill().width(w).height(h).gravity(resolveGravity(gravity)))
    .delivery(format(autoFormat()))
    .delivery(quality(autoQuality()))
    .toURL();
}

/**
 * Convenience wrapper: returns a generated URL for an event's Cloudinary
 * asset, or undefined when the event has no `image_id` (so callers can fall
 * back to a legacy full `image_url`).
 */
export function eventImage(
  event: Event,
  preset: CloudinaryPreset = "card",
): string | undefined {
  if (!event.image_id) return undefined;
  return cloudinaryUrl(event.image_id, preset, event.image_gravity ?? "center");
}
