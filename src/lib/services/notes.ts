import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

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

export async function deleteNote(id: string, userId: string = 'default_user') {
  try {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return { success: true };
  } catch (err) {
    console.error('Error deleting note:', err);
    return { success: false, error: String(err) };
  }
}
