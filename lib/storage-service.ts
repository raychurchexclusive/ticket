import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

// Upload a file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Delete a file from Firebase Storage
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

// Upload a profile picture
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  const path = `profile_pictures/${userId}/${Date.now()}_${file.name}`
  return uploadFile(file, path)
}

// Upload an event image
export async function uploadEventImage(eventId: string, file: File): Promise<string> {
  const path = `event_images/${eventId}/${Date.now()}_${file.name}`
  return uploadFile(file, path)
}

// Upload a ticket attachment
export async function uploadTicketAttachment(ticketId: string, file: File): Promise<string> {
  const path = `ticket_attachments/${ticketId}/${Date.now()}_${file.name}`
  return uploadFile(file, path)
}
