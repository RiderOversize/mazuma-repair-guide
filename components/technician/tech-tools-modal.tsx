"use client"

import { useState } from "react"
import { X, Calculator, Zap, Gauge, AlertTriangle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function TechToolsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"wire" | "pressure" | "error_codes">("wire")

  // Wire & Breaker Calculator State
  const [wattage, setWattage] = useState<number>(4500)
  const [voltage, setVoltage] = useState<number>(220)

  // Calculations
  const currentAmp = Math.round((wattage / voltage) * 10) / 10
  const recommendedBreaker = currentAmp <= 12 ? 16 : currentAmp <= 16 ? 20 : currentAmp <= 20 ? 25 : currentAmp <= 25 ? 32 : currentAmp <= 32 ? 40 : 50
  const recommendedWire = wattage <= 3500 ? "2.5 sq.mm" : wattage <= 4500 ? "4.0 sq.mm" : wattage <= 6000 ? "6.0 sq.mm" : "10.0 sq.mm"
  const groundWire = wattage <= 6000 ? "2.5 sq.mm" : "4.0 sq.mm"

  // Pressure Converter State
  const [bar, setBar] = useState<string>("2.5")
  const barNum = parseFloat(bar) || 0
  const psi = Math.round(barNum * 14.5038 * 10) / 10
  const kpa = Math.round(barNum * 100 * 10) / 10
  const headMeters = Math.round(barNum * 10.197 * 10) / 10

  // Error codes data
  const errorCodes = [
    {
      code: "LED ELCB กะพริบ",
      symptom: "ไฟ ELCB / ELC ทั้งคู่กะพริบถี่ๆ",
      cause: "มีกระแสไฟรั่วเกิน 15mA หรือวงจรตรวจจับไฟรั่วขัดข้อง",
      action: "ตรวจสอบสายดิน ฉนวนฮีตเตอร์ และบอร์ดตรวจจับไฟรั่ว",
      type: "heater",
    },
    {
      code: "ไฟ Power ไม่ติด",
      symptom: "เครื่องไม่ทำงาน ไม่มีไฟเข้าแผงหน้าปัด",
      cause: "เบรกเกอร์ทริป, สวิตช์แรงดันน้ำไม่ต่อวงจร, หรือเทอร์โมสตัทตัด",
      action: "กดปุ่ม Reset Thermostat และวัดแรงดันไฟขาเข้า",
      type: "heater",
    },
    {
      code: "เสียงบี๊บ 3 ครั้ง (RO)",
      symptom: "เครื่องกรอง RO มีเสียงเตือน",
      cause: "แรงดันน้ำขาเข้าต่ำกว่า 0.5 Bar หรือไส้กรอง Sediment อุดตัน",
      action: "เช็คแรงดันน้ำประปาและเปลี่ยนไส้กรองขั้นตอนที่ 1-2",
      type: "filter",
    },
    {
      code: "ปั๊มตัด-ต่อถี่ๆ",
      symptom: "ปั๊มน้ำเดินและตัดสลับกันแม้ไม่ได้เปิดก๊อก",
      cause: "มีจุดรั่วซึมในระบบ หรือถังแรงดันลมรั่ว/ชำรุด",
      action: "ตรวจสอบเช็ควาล์ว และเติมลมถังแรงดันตามสเปก (0.8-1.2 Bar)",
      type: "pump",
    },
    {
      code: "เครื่องกรองน้ำมีน้ำทิ้งไหลไม่หยุด",
      symptom: "ระบบ RO น้ำทิ้งไหลทิ้งตลอดเวลาแม้ถังพักน้ำเต็ม",
      cause: "Auto Shut-off Valve (4-Way Valve) หรือ High Pressure Switch ชำรุด",
      action: "ตรวจสอบ 4-Way Valve และ High Pressure Switch",
      type: "filter",
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/20">
              <Calculator className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-foreground leading-none">
                เครื่องมือ & ตารางช่าง
              </h2>
              <p className="text-[0.6875rem] text-muted-foreground mt-0.5">Mazuma Tech Reference & Calculator</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-2 bg-muted/30 border-b border-border/30 px-4">
          <button
            onClick={() => setActiveTab("wire")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
              activeTab === "wire" 
                ? "bg-card text-primary shadow-xs border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="size-3.5" />
            <span>สายไฟ & เบรกเกอร์</span>
          </button>
          <button
            onClick={() => setActiveTab("pressure")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
              activeTab === "pressure" 
                ? "bg-card text-primary shadow-xs border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Gauge className="size-3.5" />
            <span>แรงดันน้ำ</span>
          </button>
          <button
            onClick={() => setActiveTab("error_codes")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
              activeTab === "error_codes" 
                ? "bg-card text-primary shadow-xs border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AlertTriangle className="size-3.5" />
            <span>รหัสอาการ</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
          {/* TAB 1: Wire & Breaker Calculator */}
          {activeTab === "wire" && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                    เลือกกำลังวัตต์เครื่องทำน้ำอุ่น (Watt):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3500, 4500, 5500, 6000, 8000, 10000].map((w) => (
                      <button
                        key={w}
                        onClick={() => setWattage(w)}
                        className={cn(
                          "py-2.5 rounded-xl border text-[0.8125rem] font-bold transition-all shadow-2xs",
                          wattage === w
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                            : "bg-card border-border/50 text-foreground hover:bg-muted/50"
                        )}
                      >
                        {w.toLocaleString()} W
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                    หรือกรอกกำลังวัตต์เอง:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={wattage || ""}
                      onChange={(e) => setWattage(parseInt(e.target.value) || 0)}
                      placeholder="เช่น 4500"
                      className="w-full rounded-xl border border-border/60 bg-card py-2.5 pl-4 pr-12 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground text-sm">
                      W
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/15">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">กระแสไฟสูงสุด (Current):</span>
                  <span className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">{currentAmp} A</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl bg-background/80 border border-border/50 p-3 flex flex-col gap-1">
                    <span className="text-[0.6875rem] font-medium text-muted-foreground">ขนาดเบรกเกอร์ (CB):</span>
                    <span className="text-[0.9375rem] font-extrabold text-primary">{recommendedBreaker} A</span>
                    <span className="text-[0.625rem] text-muted-foreground">ชนิด RCBO / ELCB 30mA</span>
                  </div>

                  <div className="rounded-xl bg-background/80 border border-border/50 p-3 flex flex-col gap-1">
                    <span className="text-[0.6875rem] font-medium text-muted-foreground">ขนาดสายไฟทองแดง:</span>
                    <span className="text-[0.9375rem] font-extrabold text-emerald-600 dark:text-emerald-400">{recommendedWire}</span>
                    <span className="text-[0.625rem] text-muted-foreground">สายดิน: {groundWire}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/10 p-2.5 flex items-start gap-2 text-[0.6875rem] text-amber-800 dark:text-amber-200">
                  <ShieldCheck className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>ต้องต่อสายดินขนาดไม่ต่ำกว่า {groundWire} และทดสอบปุ่ม Test ELCB ทุกครั้งหลังติดตั้ง</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pressure Converter */}
          {activeTab === "pressure" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  ระบุแรงดันน้ำ (Bar):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={bar}
                    onChange={(e) => setBar(e.target.value)}
                    placeholder="เช่น 2.5"
                    className="w-full rounded-2xl border border-border/60 bg-card py-3 pl-4 pr-16 text-lg font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary">
                    BAR
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[0.6875rem] text-muted-foreground shrink-0 mr-1">ค่ามาตรฐาน:</span>
                {[
                  { label: "ประปาทั่วไป (1.5 Bar)", val: "1.5" },
                  { label: "ปั๊มบ้าน (2.5 Bar)", val: "2.5" },
                  { label: "ปั๊มแรงดันสูง (3.5 Bar)", val: "3.5" },
                  { label: "ขั้นต่ำ RO (1.0 Bar)", val: "1.0" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setBar(preset.val)}
                    className="shrink-0 rounded-full bg-muted/60 hover:bg-primary/10 border border-border/40 px-2.5 py-1 text-[0.65625rem] font-medium text-foreground/80 hover:text-primary transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Conversion Results Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 p-3.5 text-center">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground block mb-1">PSI (ปอนด์/ตร.นิ้ว)</span>
                  <span className="font-mono text-xl font-bold text-cyan-600 dark:text-cyan-400">{psi}</span>
                  <span className="text-[0.625rem] text-muted-foreground block mt-0.5">psi</span>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 p-3.5 text-center">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground block mb-1">กิโลปาสคาล</span>
                  <span className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">{kpa}</span>
                  <span className="text-[0.625rem] text-muted-foreground block mt-0.5">kPa</span>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-3.5 text-center">
                  <span className="text-[0.6875rem] font-semibold text-muted-foreground block mb-1">ระยะส่งน้ำ</span>
                  <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">{headMeters}</span>
                  <span className="text-[0.625rem] text-muted-foreground block mt-0.5">เมตร (Head)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Error Code Diagnostic Index */}
          {activeTab === "error_codes" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                ตารางวิเคราะห์รหัสอาการและไฟแจ้งเตือนที่พบบ่อย:
              </p>

              <div className="space-y-2.5">
                {errorCodes.map((item, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl bg-card border border-border/50 p-3.5 space-y-2 shadow-2xs hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[0.8125rem] font-bold text-primary flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        {item.code}
                      </span>
                      <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[0.59375rem] font-semibold text-muted-foreground uppercase">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs text-foreground font-medium">
                      {item.symptom}
                    </p>

                    <div className="rounded-xl bg-muted/30 p-2 text-[0.6875rem] text-muted-foreground space-y-1">
                      <p><strong className="text-foreground">สาเหตุ:</strong> {item.cause}</p>
                      <p><strong className="text-emerald-600 dark:text-emerald-400">การแก้ไข:</strong> {item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
