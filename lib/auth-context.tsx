"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase"
import { uploadProfilePicture } from "./storage-service"

type UserRole = "admin" | "seller" | "user"

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  photoURL?: string | null
  phoneNumber?: string | null
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences?: {
    emailNotifications?: boolean
    smsNotifications?: boolean
    eventCategories?: string[]
  }
  createdAt?: any
  updatedAt?: any
}

interface AuthContextType {
  currentUser: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<UserCredential>
  logIn: (email: string, password: string) => Promise<UserCredential>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<UserData>, profilePicture?: File | null) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  async function getUserData(user: User) {
    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: data.role || "user",
          photoURL: user.photoURL || data.photoURL,
          phoneNumber: user.phoneNumber || data.phoneNumber,
          address: data.address,
          preferences: data.preferences,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as UserData
      } else {
        // If user document doesn't exist, create it with default role
        const newUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "user" as UserRole,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            eventCategories: [],
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        await setDoc(userDocRef, newUserData)
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "user",
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          preferences: newUserData.preferences,
        } as UserData
      }
    } catch (error) {
      console.error("Error getting user data:", error)
      return null
    }
  }

  async function refreshUserData() {
    if (currentUser) {
      const data = await getUserData(currentUser)
      setUserData(data)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        const data = await getUserData(user)
        setUserData(data)
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  async function signUp(email: string, password: string, displayName: string, role: UserRole = "user") {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const { user } = userCredential

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Create user document in Firestore
      const userDocRef = doc(db, "users", user.uid)
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          eventCategories: [],
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return userCredential
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  function logIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logOut() {
    return signOut(auth)
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email)
  }

  async function updateUserProfile(data: Partial<UserData>, profilePicture?: File | null) {
    if (!currentUser) throw new Error("No user logged in")

    try {
      // Update Firebase Auth profile if displayName is provided
      const authUpdateData: { displayName?: string; photoURL?: string } = {}
      if (data.displayName) authUpdateData.displayName = data.displayName

      // Upload profile picture if provided
      let photoURL = data.photoURL
      if (profilePicture) {
        photoURL = await uploadProfilePicture(currentUser.uid, profilePicture)
        authUpdateData.photoURL = photoURL
      }

      // Update Auth profile if needed
      if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(currentUser, authUpdateData)
      }

      // Update Firestore user document
      const userDocRef = doc(db, "users", currentUser.uid)
      await updateDoc(userDocRef, {
        ...data,
        photoURL,
        updatedAt: serverTimestamp(),
      })

      // Refresh user data
      await refreshUserData()
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    logIn,
    logOut,
    resetPassword,
    updateUserProfile,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
