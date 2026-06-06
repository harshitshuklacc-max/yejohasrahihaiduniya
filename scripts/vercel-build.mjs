import { execSync } from "node:child_process";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

async function runWithRetry(cmd, retries = 3, delayMs = 5000) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      run(cmd);
      return;
    } catch (error) {
      lastError = error;
      console.error(`[error] Attempt ${attempt}/${retries} failed for: ${cmd}`);
      if (attempt < retries) {
        console.log(`[info] Retrying in ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

function resolveDatabaseEnv() {
  // Vercel Postgres / Neon marketplace integrations
  if (!process.env.DATABASE_URL?.trim()) {
    if (process.env.POSTGRES_PRISMA_URL?.trim()) {
      process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL.trim();
      console.log("[info] Using POSTGRES_PRISMA_URL as DATABASE_URL");
    } else if (process.env.POSTGRES_URL?.trim()) {
      process.env.DATABASE_URL = process.env.POSTGRES_URL.trim();
      console.log("[info] Using POSTGRES_URL as DATABASE_URL");
    }
  }

  if (!process.env.DIRECT_URL?.trim()) {
    if (process.env.POSTGRES_URL_NON_POOLING?.trim()) {
      process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING.trim();
      console.log("[info] Using POSTGRES_URL_NON_POOLING as DIRECT_URL");
    } else if (process.env.POSTGRES_URL?.trim()) {
      process.env.DIRECT_URL = process.env.POSTGRES_URL.trim();
      console.log("[info] Using POSTGRES_URL as DIRECT_URL");
    } else if (process.env.DATABASE_URL?.trim()) {
      process.env.DIRECT_URL = process.env.DATABASE_URL.trim();
      console.log("[warn] DIRECT_URL not set — using DATABASE_URL (use Neon direct URL if db push fails)");
    }
  }
}

async function main() {
  console.log("=== Smart Step Academy — Vercel build ===\n");

  resolveDatabaseEnv();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("\n[error] DATABASE_URL is not set.");
    console.error("Add it in Vercel → Settings → Environment Variables.");
    console.error("For Neon: use the pooled connection string as DATABASE_URL.");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET?.trim()) {
    console.warn("[warn] JWT_SECRET not set — logins will use a default until you set it on Vercel.");
    process.env.JWT_SECRET = "smart-step-vercel-default-change-me-in-production";
  }

  await runWithRetry("npx prisma generate", 2, 3000);
  await runWithRetry("npx prisma db push --accept-data-loss --skip-generate", 3, 5000);

  try {
    run("node prisma/seed.mjs");
  } catch {
    console.warn("[warn] Seed skipped (database may already be seeded).");
  }

  run("npx next build");

  console.log("\n=== Build successful ===\n");
}

main().catch((error) => {
  console.error("\n[error] Vercel build failed:", error?.message || error);
  process.exit(1);
});
