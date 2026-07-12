import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KingdomFlow Member",
    short_name: "KingdomFlow",
    description: "Member companion for church services, sermons, prayer, messages, giving and next steps.",
    start_url: "/workspace/kings-grace/member",
    display: "standalone",
    background_color: "#070706",
    theme_color: "#caa85d",
    icons: [
      { src: "/kingdom-flow-logo.png", sizes: "1024x1024", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
