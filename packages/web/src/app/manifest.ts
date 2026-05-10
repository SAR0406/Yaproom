import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yapzi",
    short_name: "Yapzi",
    description: "Room-based multiplayer party games.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F1A",
    theme_color: "#8B5CF6",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
