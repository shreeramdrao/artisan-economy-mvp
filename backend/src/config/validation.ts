import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),
  
  GC_PROJECT_ID: Joi.string().required(),
  GOOGLE_APPLICATION_CREDENTIALS: Joi.string().optional(),
  
  FIRESTORE_DATABASE_ID: Joi.string().default('(default)'),
  GCS_BUCKET_NAME: Joi.string().required(),
  
  VERTEX_AI_LOCATION: Joi.string().default('us-central1'),
  VERTEX_AI_MODEL: Joi.string().default('gemini-pro'),
  VISION_API_ENABLED: Joi.boolean().default(true),
  SPEECH_TO_TEXT_ENABLED: Joi.boolean().default(true),
  TEXT_TO_SPEECH_ENABLED: Joi.boolean().default(true),
  
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  REMOVE_BG_API_KEY: Joi.string().required(),
  CANVA_API_KEY: Joi.string().required(),
  
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
});