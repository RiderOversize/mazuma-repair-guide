"use client"

import { useState, useEffect, useRef } from "react"
import { X, Camera, Upload, AlertCircle, Check, ArrowRight, Zap, RefreshCw, Smartphone } from "lucide-react"
import { type DeviceModel } from "@/lib/types"

export function QrScannerModal({
  models,
  onClose,
  onScanResult,
}: {
  models: DeviceModel[]
  onClose: () => void
  onScanResult: (model: DeviceModel) => void
}) {
  const [manualCode, setManualCode] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const qrScannerRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMatchModel = (code: string) => {
    const clean = code.trim().toLowerCase()
    if (!clean) return false

    // Search model by code, name, id, or partial match
    const found = models.find(
      (m) =>
        m.code.toLowerCase().trim() === clean ||
        m.name.toLowerCase().trim() === clean ||
        m.id.toLowerCase().trim() === clean ||
        clean.includes(m.code.toLowerCase().trim()) ||
        clean.includes(m.id.toLowerCase().trim()) ||
        m.name.toLowerCase().includes(clean)
    )

    if (found) {
      setErrorMsg(null)
      setSuccessMsg(`ตรวจพบ: ${found.name} (${found.code})`)
      
      // Short delay for visual feedback before navigating
      setTimeout(() => {
        onScanResult(found)
        onClose()
      }, 500)
      return true
    } else {
      setErrorMsg(`สแกนพบข้อความ "${code}" แต่ไม่พบข้อมูลรุ่นนี้ในระบบ`)
      setSuccessMsg(null)
      return false
    }
  }

  // Initialize camera scanner
  useEffect(() => {
    let isMounted = true
    let scanner: any = null

    async function initScanner() {
      setCameraLoading(true)
      try {
        const { Html5Qrcode } = await import("html5-qrcode")
        if (!isMounted) return

        const scannerElement = document.getElementById("qr-camera-reader")
        if (!scannerElement) return

        scanner = new Html5Qrcode("qr-camera-reader")
        qrScannerRef.current = scanner

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            const qrboxSize = Math.floor(minEdge * 0.75)
            return {
              width: Math.min(qrboxSize, 280),
              height: Math.min(qrboxSize, 280),
            }
          },
          aspectRatio: 1.0,
        }

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            if (isProcessing) return
            setIsProcessing(true)
            handleMatchModel(decodedText)
            setTimeout(() => {
              if (isMounted) setIsProcessing(false)
            }, 2000)
          },
          () => {
            // Ignore frame-by-frame read failures
          }
        )

        if (isMounted) {
          setCameraActive(true)
          setCameraLoading(false)
          setCameraError(null)
        }
      } catch (err: any) {
        console.warn("Camera init failed:", err)
        if (isMounted) {
          setCameraActive(false)
          setCameraLoading(false)
          setCameraError("ไม่สามารถเปิดกล้องได้ (โปรดอนุญาตสิทธิ์กล้องในเบราว์เซอร์ หรือใช้การอัปโหลดรูปภาพ / พิมพ์รหัสด้านล่าง)")
        }
      }
    }

    // Small delay to ensure DOM element is rendered
    const timer = setTimeout(() => {
      initScanner()
    }, 150)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (qrScannerRef.current) {
        try {
          qrScannerRef.current
            .stop()
            .then(() => qrScannerRef.current?.clear())
            .catch(() => {})
        } catch (e) {}
      }
    }
  }, [])

  // Scan from photo / gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsProcessing(true)
      const { Html5Qrcode } = await import("html5-qrcode")
      const fileScanner = new Html5Qrcode("qr-file-reader")
      const result = await fileScanner.scanFile(file, true)
      handleMatchModel(result)
      fileScanner.clear()
    } catch (err) {
      setErrorMsg("ไม่พบบาร์โค้ดหรือ QR Code ในรูปภาพที่เลือก กรุณาลองภาพที่ชัดเจนขึ้น")
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const sampleModels = [
    { code: "LINEAR 4500", name: "เครื่องทำน้ำอุ่น LINEAR" },
    { code: "AQ-50UF", name: "เครื่องกรองน้ำ AQ-50UF" },
    { code: "POWER 3500", name: "เครื่องทำน้ำอุ่น POWER" },
    { code: "SUPERIOR", name: "เครื่องกรองน้ำ SUPERIOR" },
  ]

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 animate-in fade-in duration-200">
      {/* Hidden container for file scan processing */}
      <div id="qr-file-reader" className="hidden" />

      <div className="w-full max-w-sm rounded-[32px] bg-card border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/90 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Camera className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-foreground flex items-center gap-1.5">
                สแกน QR / บาร์โค้ด
              </h2>
              <p className="text-[11px] text-muted-foreground">ส่องกล้องไปที่ฉลากสินค้า Mazuma</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Camera Viewport */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-border/60 shadow-inner">
            
            {/* Live Camera Feed Container */}
            <div id="qr-camera-reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

            {/* Camera Loading Overlay */}
            {cameraLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white gap-2 z-20">
                <RefreshCw className="size-7 animate-spin text-primary" />
                <p className="text-xs font-medium text-muted-foreground">กำลังเปิดกล้องถ่ายทอดสด...</p>
              </div>
            )}

            {/* Camera Error Fallback */}
            {cameraError && !cameraLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 p-4 text-center text-foreground gap-3 z-20">
                <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Smartphone className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">ไม่สามารถเข้าถึงกล้องสดได้</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px]">
                    สามารถเลือกรูปภาพจากอัลบั้ม หรือพิมพ์รหัสสินค้าด้านล่างได้ทันทีครับ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Upload className="size-3.5" />
                  เลือกรูปภาพจากเครื่อง
                </button>
              </div>
            )}

            {/* HUD Viewfinder Overlay (When camera is active) */}
            {cameraActive && !cameraLoading && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                {/* Dark Vignette Mask */}
                <div className="absolute inset-0 bg-black/25" />

                {/* Target Box */}
                <div className="relative size-[210px] rounded-2xl border-2 border-primary/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  
                  {/* Glowing Corner Accents */}
                  <div className="absolute -top-1 -left-1 size-5 border-t-3 border-l-3 border-primary rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 size-5 border-t-3 border-r-3 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 size-5 border-b-3 border-l-3 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 size-5 border-b-3 border-r-3 border-primary rounded-br-lg" />

                  {/* Animated Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser" />

                  <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-medium text-white/90 border border-white/10">
                      วาง QR / บาร์โค้ด ในกรอบ
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Message Banner */}
          {successMsg && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in zoom-in-95">
              <Check className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-2.5 flex items-center gap-2 text-destructive text-xs font-medium animate-in zoom-in-95">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Gallery Upload Action */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-muted/30 py-2.5 px-3 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              <Upload className="size-3.5 text-primary" />
              <span>สแกนจากรูปภาพในเครื่อง</span>
            </button>
          </div>

          {/* Manual Input Search */}
          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <label className="text-xs font-semibold text-foreground/80 flex items-center justify-between">
              <span>หรือพิมพ์รหัสสินค้า / ชื่อรุ่น</span>
              <span className="text-[10.5px] text-muted-foreground font-normal">กด Enter หรือ ตกลง</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="เช่น LINEAR, AQ-50UF, POWER..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMatchModel(manualCode)
                }}
                className="flex-1 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleMatchModel(manualCode)}
                disabled={!manualCode.trim()}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-opacity"
              >
                ค้นหา
              </button>
            </div>
          </div>

          {/* Fast Test Shortcuts */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Zap className="size-3 text-amber-500" /> ทางลัดทดสอบรุ่นยอดนิยม:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {sampleModels.map((sample) => (
                <button
                  key={sample.code}
                  type="button"
                  onClick={() => handleMatchModel(sample.code)}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-2.5 py-1.5 text-left text-[11px] hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <span className="font-medium text-foreground truncate">{sample.code}</span>
                  <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
