const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable require.context for expo-router file-based routing
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Block Next.js specific directories and files from Metro.
// This prevents Metro from trying to resolve/bundle Node.js/Next.js specific imports.
config.resolver.blockList = [
  // Next.js API routes (use Node.js crypto, supabase-server, etc.)
  /app\/api\/.*/,
  // All Next.js page.js files in subdirectories
  /app\/admin\/.*/,
  /app\/auth\/.*/,
  /app\/dashboard\/.*/,
  /app\/lessons\/.*/,
  /app\/login\/.*/,
  /app\/practice\/.*/,
  /app\/pricing\/.*/,
  /app\/profile\/.*/,
  /app\/progress\/.*/,
  /app\/signup\/.*/,
  /app\/welcome\/.*/,
  // Next.js root files
  /app\/page\.js$/,
  /app\/layout\.js$/,
  /app\/globals\.css$/,
  // Next.js config & server libs
  /next\.config\.js$/,
  /lib\/supabase-server\.js$/,
  // Subdirectories that shouldn't be bundled
  /mydemy-expo\/.*/,
  /tests\/.*/,
  /test_reports\/.*/,
  /supabase\/.*/,
  // The src/app copy we created (cleanup later)
  /src\/app\/.*/,
];

module.exports = config;
