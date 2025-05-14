"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, QrCode, Clock, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRealtimeCollection } from "@/hooks/use-realtime-data"

export default function ScanPage() {
  const [ticketCode, setTicketCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const { userData } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch verification history in real-time
  const { data: verificationHistory, loading: historyLoading } = useRealtimeCollection("verifications", {
    where: [["verifiedBy", "==", userData?.uid || ""]],
    orderBy: [["createdAt", "desc"]],
    limit: 10,
  })

  const handleManualVerify = async () => {
    if (!ticketCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket code",
        variant: "destructive",
      })
      return
    }

    if (!userData?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to verify tickets",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)

    try {
      // Call the verification API
      const response = await fetch(`/api/verify/${ticketCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: userData.uid,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify ticket")
      }

      setScanResult(result)

      // Clear the input
      setTicketCode("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify ticket",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const toggleCamera = async () => {
    if (isCameraActive) {
      // Stop the camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setIsCameraActive(false)
    } else {
      // Start the camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraActive(true)

          // Start scanning for QR codes
          scanQRCode()
        }
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Could not access the camera. Please check permissions.",
          variant: "destructive",
        })
      }
    }
  }

  const scanQRCode = () => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // This is a placeholder for QR code scanning
    // In a real app, you would use a library like jsQR or a service like Dynamsoft
    // For demo purposes, we'll just simulate scanning

    const checkVideoReady = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw the video frame to the canvas
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // In a real app, you would process the canvas image to detect QR codes
        // For demo purposes, we'll simulate finding a QR code after 5 seconds
        setTimeout(() => {
          if (isCameraActive) {
            // Simulate finding a QR code
            const simulatedTicketCode = "TCT-1-VALID" + Math.floor(Math.random() * 1000)
            setTicketCode(simulatedTicketCode)
            handleManualVerify()
          }
        }, 5000)
      } else {
        requestAnimationFrame(checkVideoReady)
      }
    }

    video.onloadedmetadata = () => {
      checkVideoReady()
    }
  }

  // Clean up camera on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Scan Tickets</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-tct-magenta" />
                Ticket Scanner
              </CardTitle>
              <CardDescription>Scan or enter a ticket code to verify</CardDescription>
            </CardHeader>
            <CardContent>
              {isCameraActive ? (
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-md"></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  <div className="absolute inset-0 border-2 border-tct-magenta/50 rounded-md pointer-events-none"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter ticket code (e.g., TCT-1-ABC123)"
                      value={ticketCode}
                      onChange={(e) => setTicketCode(e.target.value)}
                      className="bg-tct-navy/50 border-tct-cyan/30 text-white placeholder:text-gray-400"
                    />
                    <Button
                      onClick={handleManualVerify}
                      disabled={isScanning || !ticketCode.trim() || !userData?.uid}
                      className="bg-tct-magenta hover:bg-tct-magenta/90"
                    >
                      Verify
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">- or -</p>
                    <Button variant="outline" onClick={toggleCamera} disabled={!userData?.uid} className="w-full">
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isCameraActive && (
                <Button variant="outline" onClick={toggleCamera} className="w-full">
                  Stop Camera
                </Button>
              )}
            </CardFooter>
          </Card>

          {scanResult && (
            <Alert
              className={`
              ${
                scanResult.status === "valid"
                  ? "bg-green-900/20 border-green-500"
                  : scanResult.status === "used"
                    ? "bg-yellow-900/20 border-yellow-500"
                    : "bg-red-900/20 border-red-500"
              } 
              text-white
            `}
            >
              {scanResult.status === "valid" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : scanResult.status === "used" ? (
                <Clock className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertTitle>
                {scanResult.status === "valid"
                  ? "Valid Ticket"
                  : scanResult.status === "used"
                    ? "Already Used"
                    : "Invalid Ticket"}
              </AlertTitle>
              <AlertDescription>
                {scanResult.status === "valid" ? (
                  <>Ticket is valid for {scanResult.eventTitle}.</>
                ) : scanResult.status === "used" ? (
                  <>This ticket has already been used on {new Date(scanResult.usedDate).toLocaleString()}.</>
                ) : (
                  <>{scanResult.reason || "This ticket is not valid."}</>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Card className="bg-tct-navy/80 border border-tct-cyan/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-tct-cyan" />
              Verification History
            </CardTitle>
            <CardDescription>Recent ticket verifications</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-tct-navy/50 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : verificationHistory.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-500 mb-2 opacity-20" />
                <p className="text-gray-400">No verification history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationHistory.map((verification) => (
                  <div key={verification.id} className="flex items-start gap-3 p-3 rounded-md bg-tct-navy/50">
                    {verification.status === "valid" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : verification.status === "used" ? (
                      <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{verification.ticketCode}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(verification.verifiedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300">{verification.eventTitle || "Unknown Event"}</p>
                      <p
                        className={`text-xs ${
                          verification.status === "valid"
                            ? "text-green-500"
                            : verification.status === "used"
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
