import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

/**
 * Uploads a profile picture to Firebase Storage
 * @param userId User ID
 * @param file File to upload
 * @returns Download URL of the uploaded file
 */
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

/**
 * Uploads an event image to Firebase Storage
 * @param eventId Event ID
 * @param file File to upload
 * @returns Download URL of the uploaded file
 */
export async function uploadEventImage(eventId: string, file: File): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `events/${eventId}/main-image`)

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

/**
 * Uploads multiple event images to Firebase Storage
 * @param eventId Event ID
 * @param files Files to upload
 * @returns Array of download URLs
 */
export async function uploadEventGallery(eventId: string, files: File[]): Promise<string[]> {
  try {
    const downloadURLs: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Create a storage reference
      const storageRef = ref(storage, `events/${eventId}/gallery/${i}`)

      // Upload the file
      const snapshot = await uploadBytes(storageRef, file)

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      downloadURLs.push(downloadURL)
    }

    return downloadURLs
  } catch (error) {
    console.error("Error uploading event gallery:", error)
    throw error
  }
}

/**
 * Deletes a file from Firebase Storage
 * @param path Path to the file
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

/**
 * Uploads a ticket attachment to Firebase Storage
 * @param ticketId Ticket ID
 * @param file File to upload
 * @returns Download URL of the uploaded file
 */
export async function uploadTicketAttachment(ticketId: string, file: File): Promise<string> {
  try {
    // Create a storage reference
    const storageRef = ref(storage, `tickets/${ticketId}/attachments/${file.name}`)

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
