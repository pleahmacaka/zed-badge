import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const snapshots = sqliteTable(
  "snapshots",
  {
    extensionId: text("extension_id").notNull(),
    date: text("date").notNull(),
    downloads: integer("downloads").notNull(),
  },
  table => [primaryKey({ columns: [table.extensionId, table.date] })],
)
