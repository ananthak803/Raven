import Joi from "joi";

const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  const v = String(value).toLowerCase().trim();
  return ["true", "1", "yes", "y", "on"].includes(v);
};

const toOriginsList = (value) => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const NODE_ENV = process.env.NODE_ENV || "development";

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default(NODE_ENV),

  PORT: Joi.number().integer().min(1).max(65535).default(5000),

  // Auth (required)
  ACCESS_TOKEN_SECRET: Joi.string().min(16).required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().optional().default("1d"),

  // Database (required depending on DB_REQUIRED)
  MONGO_URI: Joi.string().min(10).optional(),
  DB_NAME: Joi.string().optional().default("Raven"),
  DB_REQUIRED: Joi.boolean().optional(),

  // Frontend/CORS
  FRONTEND_URL: Joi.string().uri().optional(),
  CORS_ALLOWED_ORIGINS: Joi.string().optional(),

  // Security/Cookie + proxy behavior
  TRUST_PROXY: Joi.boolean().optional(),

  // Cloudinary (optional; used by upload endpoint)
  CLOUDINARY_CLOUD_NAME: Joi.string().optional().default("deuvjfc0v"),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // Redis (optional)
  REDIS_ENABLED: Joi.boolean().optional().default(true),
  REDIS_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().integer().optional(),

  // Kafka (optional)
  KAFKA_BROKER: Joi.string().optional(),
  KAFKA_USERNAME: Joi.string().optional(),
  KAFKA_PASSWORD: Joi.string().optional(),
  KAFKA_SASL_MECHANISM: Joi.string().optional(),
}).unknown(true);

const { value: validatedEnv, error } = schema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(
    `Invalid environment variables:\n${error.details
      .map((d) => `- ${d.message}`)
      .join("\n")}`
  );
}

const DB_REQUIRED =
  validatedEnv.DB_REQUIRED !== undefined
    ? validatedEnv.DB_REQUIRED
    : NODE_ENV === "production";

if (DB_REQUIRED && !validatedEnv.MONGO_URI) {
  throw new Error("MONGO_URI is required for production startup");
}

const origins = new Set();

// Allow local dev by default.
if (NODE_ENV !== "production") {
  origins.add("http://localhost:5173");
}

if (validatedEnv.FRONTEND_URL) origins.add(validatedEnv.FRONTEND_URL);
for (const origin of toOriginsList(validatedEnv.CORS_ALLOWED_ORIGINS)) {
  origins.add(origin);
}

if (NODE_ENV === "production" && origins.size === 0) {
  // Keep the server booting, but warn loudly. Production security requires an explicit origin list.
  console.warn(
    "[config] No CORS origins configured in production. Set FRONTEND_URL and/or CORS_ALLOWED_ORIGINS."
  );
}

export const config = {
  NODE_ENV,
  PORT: validatedEnv.PORT,

  ACCESS_TOKEN_SECRET: validatedEnv.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: validatedEnv.ACCESS_TOKEN_EXPIRES_IN,

  MONGO_URI: validatedEnv.MONGO_URI,
  DB_NAME: validatedEnv.DB_NAME,
  DB_REQUIRED,

  TRUST_PROXY: validatedEnv.TRUST_PROXY ?? NODE_ENV === "production",

  CORS_ORIGINS: Array.from(origins),
  FRONTEND_URL: validatedEnv.FRONTEND_URL,

  CLOUDINARY_CLOUD_NAME: validatedEnv.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: validatedEnv.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: validatedEnv.CLOUDINARY_API_SECRET,

  REDIS_ENABLED: parseBoolean(validatedEnv.REDIS_ENABLED) ?? Boolean(validatedEnv.REDIS_ENABLED),
  REDIS_URL: validatedEnv.REDIS_URL,
  REDIS_HOST: validatedEnv.REDIS_HOST,
  REDIS_PORT: validatedEnv.REDIS_PORT,

  KAFKA_BROKER: validatedEnv.KAFKA_BROKER,
  KAFKA_USERNAME: validatedEnv.KAFKA_USERNAME,
  KAFKA_PASSWORD: validatedEnv.KAFKA_PASSWORD,
  KAFKA_SASL_MECHANISM: validatedEnv.KAFKA_SASL_MECHANISM,
};

