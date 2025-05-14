import { getFunctions, httpsCallable } from "firebase/functions"
import { app } from "./firebase"

// Initialize Firebase Functions
const functions = getFunctions(app)

// Function to update user role to seller
export async function updateUserToSeller() {
  try {
    const updateToSellerFunction = httpsCallable(functions, "updateUserToSeller")
    const result = await updateToSellerFunction()
    return result.data
  } catch (error) {
    console.error("Error updating to seller:", error)
    throw error
  }
}

// Add more client-side functions as needed
