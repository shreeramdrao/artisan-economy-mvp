"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () { return ({
    port: parseInt(process.env.PORT, 10) || 4000,
    environment: process.env.NODE_ENV || 'development',
    googleCloud: {
        projectId: process.env.GC_PROJECT_ID,
        credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
    firestore: {
        databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
    },
    storage: {
        bucketName: process.env.GCS_BUCKET_NAME,
    },
    ai: {
        vertexLocation: process.env.VERTEX_AI_LOCATION || 'us-central1',
        vertexModel: process.env.VERTEX_AI_MODEL || 'gemini-pro',
        visionEnabled: process.env.VISION_API_ENABLED === 'true',
        speechToTextEnabled: process.env.SPEECH_TO_TEXT_ENABLED === 'true',
        textToSpeechEnabled: process.env.TEXT_TO_SPEECH_ENABLED === 'true',
    },
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
    },
    removeBg: {
        apiKey: process.env.REMOVE_BG_API_KEY,
    },
    canva: {
        apiKey: process.env.CANVA_API_KEY,
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
}); });
