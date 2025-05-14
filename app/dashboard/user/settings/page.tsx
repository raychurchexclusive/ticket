"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, User, Upload, X, MapPin } from "lucide-react"
import Image from "next/image"

const EVENT_CATEGORIES = [
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "arts", label: "Arts & Theater" },
  { id: "comedy", label: "Comedy" },
  { id: "conference", label: "Conferences" },
  { id: "food", label: "Food & Drink" },
]

export default function SettingsPage() {
  const { userData, updateUserProfile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile state
  const [displayName, setDisplayName] = useState(userData?.displayName || "")
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(userData?.photoURL || null)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Address state
  const [street, setStreet] = useState(userData?.address?.street || "")
  const [city, setCity] = useState(userData?.address?.city || "")
  const [state, setState] = useState(userData?.address?.state || "")
  const [zipCode, setZipCode] = useState(userData?.address?.zipCode || "")
  const [country, setCountry] = useState(userData?.address?.country || "")
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false)
  const [addressError, setAddressError] = useState("")

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(userData?.preferences?.emailNotifications || false)
  const [smsNotifications, setSmsNotifications] = useState(userData?.preferences?.smsNotifications || false)
  const [eventCategories, setEventCategories] = useState<string[]>(userData?.preferences?.eventCategories || [])
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false)
  const [preferencesError, setPreferencesError] = useState("")

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onload = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError("")
    setIsUpdatingProfile(true)

    try {
      await updateUserProfile(
        {
          displayName,
          phoneNumber,
        },
        profilePicture
      )
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setProfileError("Failed to update profile. Please try again.")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressError("")
    setIsUpdatingAddress(true)

    try {
      await updateUserProfile({
        address: {
          street,
          city,
          state,
          zipCode,
          country,
        },
      })
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error updating address:", error)
      setAddressError("Failed to update address. Please try again.")
    } finally {
      setIsUpdatingAddress(false)
    }
  }

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setPreferencesError("")
    setIsUpdatingPreferences(true)

    try {
      await updateUserProfile({
        preferences: {
          emailNotifications,
          smsNotifications,
          eventCategories,
        },
      })
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error updating preferences:", error)
      setPreferencesError("Failed to update preferences. Please try again.")
    } finally {
      setIsUpdatingPreferences(false)
    }
  }

  const toggleEventCategory = (category: string) => {
    setEventCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-tct-magenta" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              {profileError && (
                <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <p>{profileError}</p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-tct-cyan/30">
                      <Image
                        src={profilePicturePreview || "/placeholder.svg?height=128&width=128"}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                      {profilePicturePreview && profilePicture && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProfilePicture(null)
                            setProfilePicturePreview(userData?.photoURL || null)
                          }}
                          className="text-xs text-red-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-tct-navy/50 border-tct-cyan/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userData?.email || ""}
                        disabled
                        className="bg-tct-navy/50 border-tct-cyan/30 text-white opacity-70"
                      />
                      <p className="text-xs text-gray-400">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="bg-tct-navy/50 border-tct-cyan/30 text-white"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="bg-tct-magenta hover:bg-tct-magenta/90"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-tct-cyan" />
                Address Information
              </CardTitle>
              <CardDescription>Update your shipping and billing address</CardDescription>
            </CardHeader>
            <CardContent>
              {addressError && (
                <div className="mb-4 p-3 rounded-md bg-red-900/20 border border-red-500 text-white flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <p>{addressError}</p>
                </div>
              )}

              <form onSubmit={handleUpdateAddress} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main St"
                    className="bg-tct-navy/50 border-tct-cyan/30 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value\
