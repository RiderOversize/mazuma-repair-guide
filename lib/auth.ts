export type Role = "technician" | "admin"

export interface AuthUser {
  role: Role
  name: string
  title: string
  initials: string
  avatar: string
  lineName: string
  employeeCode: string
}

export const MOCK_USERS: Record<Role, AuthUser> = {
  technician: {
    role: "technician",
    name: "ช่างสมชาย",
    title: "ช่างเทคนิคภาคสนาม",
    initials: "สช",
    avatar: "/avatars/technician.png",
    lineName: "Somchai.M",
    employeeCode: "MZ-102",
  },
  admin: {
    role: "admin",
    name: "แอดมินภานุเดช",
    title: "ผู้ดูแลระบบ",
    initials: "ภด",
    avatar: "/avatars/admin.png",
    lineName: "Panudet.T",
    employeeCode: "MZ-001",
  },
}

// Valid employee codes for new-user identity binding (Scenario C).
// Maps an employee code to the role that will be granted after binding.
export const VALID_EMPLOYEE_CODES: Record<string, Role> = {
  "MZ-205": "technician",
  "MZ-206": "technician",
  "MZ-102": "technician",
}
