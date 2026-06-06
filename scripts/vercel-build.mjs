import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

function requireEnv(name) {
  if (!process.env[name]?.trim()) {
    console.error(`\n[error] Missing environment variable: ${name}`);
    console.error("Set it in Vercel → Settings → Environment Variables (Production).");
    process.exit(1);
  }
}

console.log("=== Smart Step Academy — Vercel build ===\n");

requireEnv("DATABASE_URL");
requireEnv("DIRECT_URL");

if (!process.env.JWT_SECRET?.trim()) {
  console.warn("[warn] JWT_SECRET is not set — using a temporary build default.");
  console.warn("       Set JWT_SECRET in Vercel for secure logins in production.");
  process.env.JWT_SECRET = "smart-step-build-placeholder-change-in-vercel";
}

run("npx prisma generate");
run("npx prisma db push --accept-data-loss --skip-generate");

try {
  run("npx prisma db seed");
} catch {
  console.warn("[warn] Database seed skipped (admin may already exist).");
}

run("npx next build");

console.log("\n=== Build successful — ready to deploy ===\n");
