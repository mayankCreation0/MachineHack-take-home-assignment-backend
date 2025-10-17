import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  score: real('score').notNull(),
  feedback: text('feedback').notNull(),
  file_name: text('file_name').notNull(),
  file_size: integer('file_size').notNull(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
});
