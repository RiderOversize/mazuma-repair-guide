export type Role = "technician" | "admin" | "head"

export interface AuthUser {
  role: Role
  name: string
  title: string
  initials: string
  avatar: string
  lineName: string
  lineUserId?: string
  employeeCode: string
  phone?: string
  accessibleMenus?: string[] // Optional array of menu IDs the user can see (Admin only)
  assignedSupervisors?: string[] // Array of supervisor employee codes this tech can contact
  status?: "active" | "inactive"
  createdAt?: string
  lastLogin?: string
}

export const MOCK_USERS: Record<string, AuthUser> = {
  technician: {
    role: "technician",
    name: "ช่างสมชาย",
    title: "ช่างเทคนิคภาคสนาม",
    initials: "สช",
    avatar: "/avatars/technician.png",
    lineName: "Somchai.M",
    employeeCode: "MZ-102",
    status: "active",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  admin: {
    role: "admin",
    name: "แอดมินภานุเดช",
    title: "ผู้ดูแลระบบ",
    initials: "ภด",
    avatar: "/avatars/admin.png",
    lineName: "Panudet.T",
    employeeCode: "MZ-001",
    accessibleMenus: ["dashboard", "create", "guides", "models", "users", "preview", "master-data", "media", "settings"], // Full access
    status: "active",
    createdAt: new Date("2023-11-01").toISOString(),
  },
  adminRestricted: {
    role: "admin",
    name: "แอดมินสมหญิง",
    title: "ผู้ช่วยแอดมิน",
    initials: "สญ",
    avatar: "/avatars/admin.png", // Reusing avatar for mockup
    lineName: "Somying.S",
    employeeCode: "MZ-002",
    accessibleMenus: ["dashboard", "guides"], // Restricted access
    status: "inactive",
    createdAt: new Date("2024-03-20").toISOString(),
  },
  supervisor: {
    role: "head",
    name: "หัวหน้าช่าง สมพงษ์",
    title: "หัวหน้าช่างซ่อมบำรุง",
    initials: "สพ",
    avatar: "/avatars/technician.png",
    lineName: "Sompong.H",
    employeeCode: "MZ-050",
    phone: "0812345678",
    status: "active",
    createdAt: new Date("2023-05-15").toISOString(),
  },
  supervisor2: {
    role: "head",
    name: "หัวหน้าช่าง วิโรจน์",
    title: "หัวหน้าช่างเทคนิค",
    initials: "วร",
    avatar: "/avatars/technician.png",
    lineName: "Wirot.T",
    employeeCode: "MZ-051",
    phone: "0898765432",
    status: "active",
    createdAt: new Date("2023-06-10").toISOString(),
  },
  supervisor3: {
    role: "head",
    name: "หัวหน้าช่าง อนันต์",
    title: "ผู้ช่วยผู้จัดการฝ่ายช่าง",
    initials: "อน",
    avatar: "/avatars/technician.png",
    lineName: "Anan.K",
    employeeCode: "MZ-052",
    phone: "0823456789",
    status: "active",
    createdAt: new Date("2023-07-20").toISOString(),
  },
}

export const SUPERVISORS = [
  MOCK_USERS.supervisor,
  MOCK_USERS.supervisor2,
  MOCK_USERS.supervisor3
]

// Valid employee codes for new-user identity binding (Scenario C).
// Maps an employee code to the role that will be granted after binding.
export const VALID_EMPLOYEE_CODES: Record<string, Role> = {
  "MZ-205": "technician",
  "MZ-206": "technician",
  "MZ-102": "technician",
}
