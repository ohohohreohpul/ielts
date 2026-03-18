const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude Next.js specific files from Metro bundler
// These files use Node.js APIs (crypto, etc.) that don't exist in the browser/RN runtime
config.resolver.blockList = [
  // Next.js API routes (use Node.js crypto, supabase-server, etc.)
  /app\/api\/.*/,
  // Next.js page files (use next/navigation, next/dynamic)
  /app\/(?!_layout\.tsx$|index\.tsx$|\+not-found\.tsx$)[^/]+\/page\.js$/,
  /app\/[^/]+\/[^/]+\/page\.js$/,
  // Next.js layout (conflicts with Expo _layout.tsx)
  /app\/layout\.js$/,
  // Next.js root page.js (conflicts with Expo index.tsx)
  /app\/page\.js$/,
  // Next.js globals.css (handled differently in Expo)
  /app\/globals\.css$/,
  // Next.js config files
  /next\.config\.js$/,
  // Server-side lib files
  /lib\/supabase-server\.js$/,
];

module.exports = config;
