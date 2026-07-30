import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // خرج مستقل — صورة Docker صغيرة بلا node_modules كاملة
  output: "standalone",
};

export default nextConfig;
