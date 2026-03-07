import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

async function buildAdminClient() {
  await esbuild.build({
    entryPoints: ["source/admin-client/app.tsx"],
    bundle: true,
    outdir: "admin-client/assets",
    minify: true,
    sourcemap: true,
    format: "esm",
    target: ["es2020"],
    plugins: [
      // 1. Handle CSS Modules first
      sassPlugin({
        filter: /\.module\.scss$/,
        type: "local-css", // This creates the JS 'styles' object automatically
      }),
      // 2. Handle standard SCSS (global styles)
      sassPlugin({
        filter: /\.scss$/,
        type: "css",
      }),
    ],
    jsxFactory: "h",
    jsxFragment: "Fragment",
    inject: ["./source/admin-client/preact-shim.ts"],
  });
  await Deno.copyFile(
    "source/admin-client/index.html",
    "admin-client/index.html",
  );
  console.log("⚡ Build complete");
  Deno.exit();
}

await buildAdminClient();
