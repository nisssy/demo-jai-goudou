"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { GoudouRole } from "@/types"
import type { Project, Company, Hall, Employee, PrizeVendor, Prize, TradingPartner, DesignRequest, DesignRequestComment, DesignRequestType } from "@/types"
import {
  DEMO_DB_STORAGE_KEY,
  getInitialDemoDbData,
  loadDemoDbFromStorage,
  saveDemoDbToStorage,
  clearDemoDbStorage,
} from "@/lib/demo-db/storage"
import type { DemoDbData } from "@/lib/demo-db/types"

type ProjectContextType = {
  currentGoudouRole: GoudouRole | null
  setCurrentGoudouRole: (role: GoudouRole | null) => void
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  companies: Company[]
  halls: Hall[]
  employees: Employee[]
  prizeVendors: PrizeVendor[]
  prizes: Prize[]
  tradingPartners: TradingPartner[]
  getProjectById: (id: string) => Project | null
  createProject: (project: Omit<Project, "id">) => Project
  updateProject: (id: string, updates: Partial<Project>) => Project | null
  designRequests: DesignRequest[]
  addDesignRequest: (params: {
    requestType: DesignRequestType
    projectId: string
    projectName?: string
    companyName: string
    hallNames: string[]
    eventStartDate?: string
    eventEndDate?: string
    requestedBy: string
    requestedByName?: string
    vendorId: string
    vendorName?: string
  }) => DesignRequest
  getDesignRequestsByProject: (projectId: string) => DesignRequest[]
  getDesignRequestsByProjectAndType: (projectId: string, type: DesignRequestType) => DesignRequest[]
  getDesignRequestById: (id: string) => DesignRequest | null
  updateDesignRequest: (id: string, updates: Partial<Pick<DesignRequest, "status" | "uploadedFileName" | "uploadedAt">>) => DesignRequest | null
  addDesignRequestComment: (id: string, comment: Omit<DesignRequestComment, "id" | "createdAt">) => DesignRequest | null
  /** @deprecated use designRequests + getDesignRequestsByProjectAndType(id, "poster") */
  posterRequests: DesignRequest[]
  addPosterRequest: (params: {
    projectId: string
    projectName?: string
    companyName: string
    hallNames: string[]
    eventStartDate?: string
    eventEndDate?: string
    requestedBy: string
    requestedByName?: string
    vendorId: string
    vendorName?: string
  }) => DesignRequest
  getPosterRequestsByProject: (projectId: string) => DesignRequest[]
  getPosterRequestById: (id: string) => DesignRequest | null
  updatePosterRequest: (id: string, updates: Partial<Pick<DesignRequest, "status" | "uploadedFileName" | "uploadedAt">>) => DesignRequest | null
  addPosterRequestComment: (id: string, comment: Omit<DesignRequestComment, "id" | "createdAt">) => DesignRequest | null
  resetDemoData: () => void
  /** ローカルストレージから再読み込み（別タブで更新された依頼を表示するため） */
  refreshFromStorage: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentGoudouRole, setCurrentGoudouRole] = useState<GoudouRole | null>(null)
  const [data, setData] = useState<DemoDbData>(() => getInitialDemoDbData())

  useEffect(() => {
    const loaded = loadDemoDbFromStorage()
    if (loaded) setData(loaded)
  }, [])

  // 別タブで管理画面が依頼送信したあと、デザイン業者タブに戻ったときに最新の designRequests を表示するため
  useEffect(() => {
    const onFocus = () => {
      const loaded = loadDemoDbFromStorage()
      if (loaded) setData(loaded)
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  // 別タブで localStorage が更新されたら即時反映（事務管理課で発注→デザイン業者タブを開いたままでも表示される）
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DEMO_DB_STORAGE_KEY && e.newValue) {
        const loaded = loadDemoDbFromStorage()
        if (loaded) setData(loaded)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const persist = useCallback((next: DemoDbData) => {
    setData(next)
    saveDemoDbToStorage(next)
  }, [])

  const setProjects = useCallback<React.Dispatch<React.SetStateAction<Project[]>>>(
    (action) => {
      setData((prev) => {
        const nextProjects = typeof action === "function" ? action(prev.projects) : action
        const next = { ...prev, projects: nextProjects }
        saveDemoDbToStorage(next)
        return next
      })
    },
    []
  )

  const getProjectById = useCallback(
    (id: string): Project | null => {
      return data.projects.find((p) => p.id === id) ?? null
    },
    [data.projects]
  )

  const createProject = useCallback(
    (input: Omit<Project, "id">): Project => {
      const maxNum = data.projects.reduce((acc, p) => {
        const m = p.id.match(/^P(\d+)$/)
        return m ? Math.max(acc, parseInt(m[1], 10)) : acc
      }, 0)
      const id = `P${String(maxNum + 1).padStart(3, "0")}`
      const project: Project = { ...input, id, projectNumber: id }
      const next = { ...data, projects: [...data.projects, project] }
      setData(next)
      saveDemoDbToStorage(next)
      return project
    },
    [data]
  )

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>): Project | null => {
      setData((prev) => {
        const index = prev.projects.findIndex((p) => p.id === id)
        if (index === -1) return prev
        const updated = { ...prev.projects[index], ...updates }
        const nextProjects = [...prev.projects]
        nextProjects[index] = updated
        const next = { ...prev, projects: nextProjects }
        saveDemoDbToStorage(next)
        return next
      })
      const index = data.projects.findIndex((p) => p.id === id)
      if (index === -1) return null
      return { ...data.projects[index], ...updates }
    },
    [data]
  )

  const resetDemoData = useCallback(() => {
    clearDemoDbStorage()
    const initial = getInitialDemoDbData()
    setData(initial)
    saveDemoDbToStorage(initial)
    setCurrentGoudouRole(null)
  }, [])

  const refreshFromStorage = useCallback(() => {
    const loaded = loadDemoDbFromStorage()
    if (loaded) setData(loaded)
  }, [])

  const designRequests = data.designRequests ?? []

  const addDesignRequest = useCallback(
    (params: {
      requestType: DesignRequestType
      projectId: string
      projectName?: string
      companyName: string
      hallNames: string[]
      eventStartDate?: string
      eventEndDate?: string
      requestedBy: string
      requestedByName?: string
      vendorId: string
      vendorName?: string
    }) => {
      const requestId = `DR${String(
        (data.designRequests ?? []).reduce((acc, r) => {
          const m = r.id.match(/^(?:PR|DR|DM|WL)(\d+)$/i)
          return m ? Math.max(acc, parseInt(m[1], 10)) : acc
        }, 0) + 1
      ).padStart(3, "0")}`
      const request: DesignRequest = {
        ...params,
        id: requestId,
        requestedAt: new Date().toISOString(),
        status: "requested",
        comments: [],
      }
      setData((prev) => {
        const prevList = prev.designRequests ?? []
        const next = { ...prev, designRequests: [...prevList, request] }
        saveDemoDbToStorage(next)
        return next
      })
      return request
    },
    [data.designRequests]
  )

  const getDesignRequestsByProject = useCallback(
    (projectId: string) => designRequests.filter((r) => r.projectId === projectId),
    [designRequests]
  )

  const getDesignRequestsByProjectAndType = useCallback(
    (projectId: string, type: DesignRequestType) =>
      designRequests.filter((r) => r.projectId === projectId && r.requestType === type),
    [designRequests]
  )

  const getDesignRequestById = useCallback(
    (id: string) => designRequests.find((r) => r.id === id) ?? null,
    [designRequests]
  )

  const updateDesignRequest = useCallback(
    (id: string, updates: Partial<Pick<DesignRequest, "status" | "uploadedFileName" | "uploadedAt">>) => {
      const index = designRequests.findIndex((r) => r.id === id)
      if (index === -1) return null
      const updated = { ...designRequests[index], ...updates }
      const nextList = [...designRequests]
      nextList[index] = updated
      const next = { ...data, designRequests: nextList }
      setData(next)
      saveDemoDbToStorage(next)
      return updated
    },
    [data, designRequests]
  )

  const addDesignRequestComment = useCallback(
    (id: string, comment: Omit<DesignRequestComment, "id" | "createdAt">) => {
      const index = designRequests.findIndex((r) => r.id === id)
      if (index === -1) return null
      const req = designRequests[index]
      const commentId = `${id}-C${req.comments.length + 1}`
      const newComment: DesignRequestComment = {
        ...comment,
        id: commentId,
        createdAt: new Date().toISOString(),
      }
      const updated = { ...req, comments: [...req.comments, newComment] }
      const nextList = [...designRequests]
      nextList[index] = updated
      const next = { ...data, designRequests: nextList }
      setData(next)
      saveDemoDbToStorage(next)
      return updated
    },
    [data, designRequests]
  )

  const posterRequests = designRequests.filter((r) => r.requestType === "poster")

  const addPosterRequest = useCallback(
    (params: {
      projectId: string
      projectName?: string
      companyName: string
      hallNames: string[]
      eventStartDate?: string
      eventEndDate?: string
      requestedBy: string
      requestedByName?: string
      vendorId: string
      vendorName?: string
    }) => addDesignRequest({ ...params, requestType: "poster" }),
    [addDesignRequest]
  )

  const getPosterRequestsByProject = useCallback(
    (projectId: string) => getDesignRequestsByProjectAndType(projectId, "poster"),
    [getDesignRequestsByProjectAndType]
  )

  const getPosterRequestById = getDesignRequestById
  const updatePosterRequest = updateDesignRequest
  const addPosterRequestComment = addDesignRequestComment

  const value: ProjectContextType = {
    currentGoudouRole,
    setCurrentGoudouRole,
    projects: data.projects,
    setProjects,
    companies: data.companies,
    halls: data.halls,
    employees: data.employees,
    prizeVendors: data.prizeVendors ?? [],
    prizes: data.prizes ?? [],
    tradingPartners: data.tradingPartners ?? [],
    getProjectById,
    createProject,
    updateProject,
    designRequests,
    addDesignRequest,
    getDesignRequestsByProject,
    getDesignRequestsByProjectAndType,
    getDesignRequestById,
    updateDesignRequest,
    addDesignRequestComment,
    posterRequests,
    addPosterRequest,
    getPosterRequestsByProject,
    getPosterRequestById,
    updatePosterRequest,
    addPosterRequestComment,
    resetDemoData,
    refreshFromStorage,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextType {
  const ctx = useContext(ProjectContext)
  if (ctx === undefined) throw new Error("useProject must be used within ProjectProvider")
  return ctx
}
