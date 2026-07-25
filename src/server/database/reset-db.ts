import { neon } from "@neondatabase/serverless";
import { env } from "../config/env";

async function main() {
  const sql = neon(env.databaseUrl);
  console.log("💥 Dropping existing tables to reset schema...");
  await sql`DROP TABLE IF EXISTS "quiz_answers", "quiz_attempts", "quiz_options", "quiz_questions", "quizzes", "flashcard_reviews", "flashcards", "flashcard_decks", "learning_progress", "module_progress", "ai_messages", "ai_conversations", "ai_prompt_templates", "ai_usage_logs", "media_assets", "content_versions", "prompt_templates", "glossary_entries", "bookmarks", "notes", "highlights", "notifications", "audit_logs", "gemini_api_keys", "lessons", "chapters", "modules", "levels", "roadmaps", "session", "account", "verification", "users", "user" CASCADE;`;
  console.log("✅ Tables dropped cleanly.");
}

main().catch(console.error);
