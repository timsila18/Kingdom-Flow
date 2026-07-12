import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KingdomFlow Member",
    short_name: "KingdomFlow",
    description: "Member companion for church services, sermons, prayer, messages, giving and next steps.",
    start_url: "/workspace/kings-grace/member",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#10243f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
