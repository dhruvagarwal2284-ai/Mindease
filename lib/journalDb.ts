import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

// Nayi entry store karna
export const addJournalEntry = async (userId: string, content: string) => {
  await addDoc(collection(db, "journals"), {
    userId, // Tera MindMate handle ya ID
    content,
    createdAt: new Date().toISOString(),
  });
};

// Entry delete karna
export const deleteJournalEntry = async (entryId: string) => {
  await deleteDoc(doc(db, "journals", entryId));
};