import { v2 as cloudinaryV2 } from "cloudinary";
import { env } from "./env";

cloudinaryV2.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

export const cloudinary = cloudinaryV2;

export const CLOUDINARY_FOLDERS = {
  modules: "brevetai/modules",
  lessons: "brevetai/lessons",
  glossary: "brevetai/glossary",
  avatars: "brevetai/avatars",
  aiGenerated: "brevetai/ai-generated",
  cms: "brevetai/cms",
  temp: "brevetai/temp",
} as const;

export type CloudinaryFolder = (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];
