import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { app } from "./firebase"

const storage = getStorage(app)

// Upload a profile picture
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `users/${userId}/profile-picture`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    throw error
  }
}

// Upload an event image
export async function uploadEventImage(eventId: string, file: File): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `events/${eventId}/event-image`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading event image:", error)
    throw error
  }
}

// Upload a ticket attachment (e.g., PDF ticket)
export async function uploadTicketAttachment(ticketId: string, file: File): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `tickets/${ticketId}/attachment`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading ticket attachment:", error)
    throw error
  }
}

// Delete a file
export async function deleteFile(path: string): Promise<void> {
  try {
    const fileRef = ref(storage, path)
    await deleteObject(fileRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

// Get a download URL for a file
export async function getFileURL(path: string): Promise<string> {
  try {
    const fileRef = ref(storage, path)
    return await getDownloadURL(fileRef)
  } catch (error) {
    console.error("Error getting file URL:", error)
    throw error
  }
}
