import { test } from "node:test";
import assert from "node:assert/strict";

const restoreEnv = (original) => {
  for (const key of Object.keys(process.env)) {
    if (!(key in original)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(original)) {
    process.env[key] = value;
  }
};

test("env validation requires ACCESS_TOKEN_SECRET", async () => {
  const original = { ...process.env };
  try {
    delete process.env.ACCESS_TOKEN_SECRET;
    process.env.NODE_ENV = "development";

    await assert.rejects(async () => {
      await import(`../src/config/env.js?bust=${Date.now()}`);
    });
  } finally {
    restoreEnv(original);
  }
});

test("CORS origins include localhost in development", async () => {
  const original = { ...process.env };
  try {
    process.env.NODE_ENV = "development";
    process.env.ACCESS_TOKEN_SECRET = "supersecret1234567890";
    delete process.env.FRONTEND_URL;
    delete process.env.CORS_ALLOWED_ORIGINS;

    const mod = await import(`../src/config/env.js?bust=${Date.now()}`);
    assert.ok(
      mod.config.CORS_ORIGINS.includes("http://localhost:5173"),
      "Expected localhost origin in development"
    );
  } finally {
    restoreEnv(original);
  }
});

test("redis disabled returns null cache reads", async () => {
  const original = { ...process.env };
  try {
    process.env.NODE_ENV = "development";
    process.env.ACCESS_TOKEN_SECRET = "supersecret1234567890";
    process.env.REDIS_ENABLED = "false";

    const redisMod = await import(
      `../src/config/redis.js?bust=${Date.now()}`
    );

    const cached = await redisMod.getCachedMessages("channel123", 1);
    assert.equal(cached, null);
  } finally {
    restoreEnv(original);
  }
});

