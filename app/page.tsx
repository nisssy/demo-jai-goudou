"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { RoleSelectionView } from "@/components/screens/role-selection.view"

export default function HomePage() {
  const router = useRouter()
  const { setCurrentGoudouRole } = useProject()

  useEffect(() => {
    setCurrentGoudouRole(null)
  }, [setCurrentGoudouRole])

  const handleSelectRole = (role: "SalesInsight" | "DesignVendor" | "PrizeVendor" | "Admin") => {
    setCurrentGoudouRole(role)
    if (role === "SalesInsight") router.push("/sales")
    else if (role === "DesignVendor") router.push("/vendor")
    else if (role === "PrizeVendor") router.push("/prize-vendor")
    else if (role === "Admin") router.push("/admin")
  }

  return (
    <main>
      <RoleSelectionView onSelectRole={handleSelectRole} />
    </main>
  )
}
