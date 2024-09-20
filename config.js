// // src/config.js


import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URI || 'mongodb+srv://jaganarasuaj:gHrogIIFmvUNH4Pd@cluster0.iivk7tp.mongodb.net/hotelBookingDB';
export const JWT_SECRET = process.env.JWT_SECRET || 'UR1j3lXQJf3Z8aeredG3onnzrsycDQ5o';
