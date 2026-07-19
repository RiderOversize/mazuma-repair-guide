import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

export const MySwal = withReactContent(Swal)

// Base Configuration for a modern, sleek aesthetic
const baseConfig = {
  customClass: {
    popup: "rounded-2xl border border-border bg-card text-foreground shadow-xl",
    title: "font-display text-xl font-bold text-foreground",
    htmlContainer: "text-sm text-muted-foreground",
    confirmButton: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",
    cancelButton: "rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted transition-colors",
    actions: "gap-2",
  },
  buttonsStyling: false,
}

export const showToast = (title: string, icon: "success" | "error" | "warning" | "info" = "success") => {
  return MySwal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "rounded-xl border border-border bg-card text-foreground shadow-lg px-4 py-3",
      title: "text-sm font-medium",
      timerProgressBar: "bg-primary",
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  })
}

export const confirmDelete = async (title: string = "ยืนยันการลบ", text: string = "ข้อมูลที่ลบจะไม่สามารถกู้คืนได้") => {
  const result = await MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ลบข้อมูล",
    cancelButtonText: "ยกเลิก",
    customClass: {
      ...baseConfig.customClass,
      confirmButton: "rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors",
    }
  })
  return result.isConfirmed
}

export const showAlert = (title: string, text: string, icon: "success" | "error" | "warning" | "info" = "info") => {
  return MySwal.fire({
    ...baseConfig,
    title,
    text,
    icon,
    confirmButtonText: "ตกลง",
  })
}
