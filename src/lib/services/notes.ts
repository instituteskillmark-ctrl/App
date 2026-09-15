import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserNotes(userId: string = 'default_user') {
  try {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
  } catch (err) {
    console.error('Error fetching notes:', err);
    return [];
  }
}

export async function createNote(
  title: string,
  content: string,
  tags?: string,
  taskId?: string,
  projectId?: string,
  userId: string = 'default_user'
) {
  try {
    const [newNote] = await db.insert(notes).values({
      userId,
      title,
      content,
      tags,
      taskId: taskId || null,
      projectId: projectId || null,
    }).returning();
    return { success: true, note: newNote };
  } catch (err) {
    console.error('Error creating note:', err);
    return { success: false, error: String(err) };
  }
}

export async function deleteNote(id: string) {
  try {
    await db.delete(notes).where(eq(notes.id, id));
    return { success: true };
  } catch (err) {
    console.error('Error deleting note:', err);
    return { success: false, error: String(err) };
  }
}
