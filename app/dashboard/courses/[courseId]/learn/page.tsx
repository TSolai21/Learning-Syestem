// "use client"

// import { useEffect, useState, useRef } from "react"
// import { useParams } from "next/navigation"
// import { api } from "@/lib/api"
// import { useToast } from "@/hooks/use-toast"
// import { Loader } from "@/components/loader"
// import { CourseNavigation } from "@/components/course-navigation"
// import { CourseContent } from "@/components/course-content"

// interface CourseContentItem {
//   course_mastertitle_breakdown_id: number
//   course_mastertitle_breakdown: string
//   course_subtitle_id: number
//   course_subtitle: string
//   subtitle_content: string
//   subtitle_code?: string
//   helpfull_links?: string
// }

// interface CourseProgress {
//   course_subtitle_id: number
//   course_subtitle_progress: number
// }

// export default function CourseLearnPage() {
//   const params = useParams()
//   const { toast } = useToast()
//   const [courseContent, setCourseContent] = useState<CourseContentItem[]>([])
//   const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedContentId, setSelectedContentId] = useState("")
//   const [courseStatus, setCourseStatus] = useState<any>(null)

//   const courseId = params.courseId as string
//   const contentRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const isUpdatingRef = useRef(false)

//     const fetchCourseContent = async () => {
//       try {
//         setLoading(true)
//         const user = JSON.parse(localStorage.getItem("user") || "{}")

//         const response = await api.post("/course-content", {
//           user_id: user.user_id,
//           course_id: courseId,
//         })

//         const content = response.data.data[0]?.get_course_data?.course_content || []
//         const progress = response.data.data[0]?.get_course_data?.user_progress || []

//         setCourseContent(content)
//         setCourseProgress(progress)

//         // Set initial selected content
//         if (content.length > 0) {
//           const firstItem = content[0]
//           setSelectedContentId(`${firstItem.course_mastertitle_breakdown_id}-${firstItem.course_subtitle_id}`)
//         }

//         // Fetch course status
//         const statusResponse = await api.post("/userCourseStatus", {
//           user_id: user.user_id,
//           course_id: courseId,
//         })

//         setCourseStatus(statusResponse.data)
//       } catch (error) {
//         console.error("Error fetching course content:", error)
//         toast({
//           title: "Error",
//           description: "Failed to load course content",
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (courseId) {
//       fetchCourseContent()
//     }
//   }, [courseId, toast])

//   // Update progress
//   const updateProgress = async (subtitleId: number, masterId: number, progress: number) => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user") || "{}")

//       await api.post("/course-progress", {
//         user_id: user.user_id,
//         course_id: courseId,
//         course_subtitle_id: subtitleId,
//         course_mastertitle_breakdown_id: masterId,
//         course_subtitle_progress: Math.round(progress),
//       })

//       // Update local progress state
//       setCourseProgress((prev) => {
//         const existing = prev.find((p) => p.course_subtitle_id === subtitleId)
//         if (existing) {
//           return prev.map((p) =>
//             p.course_subtitle_id === subtitleId ? { ...p, course_subtitle_progress: Math.round(progress) } : p,
//           )
//         } else {
//           return [...prev, { course_subtitle_id: subtitleId, course_subtitle_progress: Math.round(progress) }]
//         }
//       })

//       // Refresh course status
//       const statusResponse = await api.post("/userCourseStatus", {
//         user_id: user.user_id,
//         course_id: courseId,
//       })

//       setCourseStatus(statusResponse.data)
//     } catch (error) {
//       console.error("Error updating progress:", error)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader />
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-[calc(100vh-64px)] bg-background">
//       <aside className="w-80 bg-white overflow-auto shadow-lg">
//         <CourseNavigation
//           courseContent={courseContent}
//           courseProgress={courseProgress}
//           courseStatus={courseStatus}
//           onContentSelect={setSelectedContentId}
//           activeContentId={selectedContentId}
//         />
//       </aside>
//       <main className="flex-1 p-6 overflow-hidden" ref={contentRef}>
//         <CourseContent data={courseContent} selectedContentId={selectedContentId} updateProgress={updateProgress} />
//       </main>
//     </div>
//   )
// }

"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader } from "@/components/loader"
import { CourseNavigation } from "@/components/course-navigation"
import { CourseContent } from "@/components/course-content"
import { ChevronRight } from "lucide-react"

interface CourseContentItem {
  course_mastertitle_breakdown_id: number
  course_mastertitle_breakdown: string
  course_subtitle_id: number
  course_subtitle: string
  subtitle_content: string
  subtitle_code?: string
  helpfull_links?: string
}

interface CourseProgress {
  course_subtitle_id: number
  course_subtitle_progress: number
}

export default function CourseLearnPage() {
  const params = useParams()
  const { toast } = useToast()
  const [courseContent, setCourseContent] = useState<CourseContentItem[]>([])
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContentId, setSelectedContentId] = useState("")
  const [courseStatus, setCourseStatus] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const courseId = params.courseId as string
  const contentRef = useRef<HTMLDivElement>(null)
  const updateInProgress = useRef(false)
  const statusUpdateTimeout = useRef<NodeJS.Timeout>()

  const fetchCourseStatus = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const statusResponse = await api.post("/userCourseStatus", {
        user_id: user.user_id,
        course_id: courseId,
      })
      setCourseStatus(statusResponse.data)
    } catch (error) {
      console.error("Error fetching course status:", error)
    }
  }, [courseId])

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")

        const response = await api.post("/course-content", {
          user_id: user.user_id,
          course_id: courseId,
        })

        const content = response.data.data[0]?.get_course_data?.course_content || []
        const progress = response.data.data[0]?.get_course_data?.user_progress || []

        setCourseContent(content)
        setCourseProgress(progress)

        if (content.length > 0) {
          const firstItem = content[0]
          setSelectedContentId(`${firstItem.course_mastertitle_breakdown_id}-${firstItem.course_subtitle_id}`)
        }

        await fetchCourseStatus()
      } catch (error) {
        console.error("Error fetching course content:", error)
        toast({
          title: "Error",
          description: "Failed to load course content",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseContent()
    }

    return () => {
      if (statusUpdateTimeout.current) {
        clearTimeout(statusUpdateTimeout.current)
      }
    }
  }, [courseId, toast, fetchCourseStatus])

  const updateProgress = useCallback(
    async (subtitleId: number, masterId: number, progress: number) => {
      if (updateInProgress.current) return
      updateInProgress.current = true

      try {
        // Optimistic UI update
        setCourseProgress((prev) => {
          const existingIndex = prev.findIndex((p) => p.course_subtitle_id === subtitleId)
          if (existingIndex >= 0) {
            const newProgress = [...prev]
            newProgress[existingIndex] = {
              ...newProgress[existingIndex],
              course_subtitle_progress: Math.round(progress),
            }
            return newProgress
          }
          return [...prev, { course_subtitle_id: subtitleId, course_subtitle_progress: Math.round(progress) }]
        })

        // API call to update progress
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        await api.post("/course-progress", {
          user_id: user.user_id,
          course_id: courseId,
          course_subtitle_id: subtitleId,
          course_mastertitle_breakdown_id: masterId,
          course_subtitle_progress: Math.round(progress),
        })

        // Schedule status update with debounce
        if (statusUpdateTimeout.current) {
          clearTimeout(statusUpdateTimeout.current)
        }
        statusUpdateTimeout.current = setTimeout(() => {
          fetchCourseStatus()
        }, 1000) // 1 second debounce
      } catch (error) {
        console.error("Error updating progress:", error)
      } finally {
        updateInProgress.current = false
      }
    },
    [courseId, fetchCourseStatus],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    // <div className="flex h-[calc(100vh-64px)] bg-background">
    //   <aside className="w-80 bg-white overflow-auto shadow-lg">
    //     <CourseNavigation
    //       courseContent={courseContent}
    //       courseProgress={courseProgress}
    //       courseStatus={courseStatus}
    //       onContentSelect={setSelectedContentId}
    //       activeContentId={selectedContentId}
    //     />
    //   </aside>
    //   <main className="flex-1 p-6 overflow-hidden" ref={contentRef}>
    //     <CourseContent
    //       data={courseContent}
    //       selectedContentId={selectedContentId}
    //       updateProgress={updateProgress}
    //     />
    //   </main>
    // </div>

    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Mobile Sidebar Toggle */}
      <button className="md:hidden p-4" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {/* <Menu size={24} /> */}
        <ChevronRight size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-80  bg-white shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out md:flex md:w-80 overflow-auto`}
      >
        <CourseNavigation
          courseContent={courseContent}
          courseProgress={courseProgress}
          courseStatus={courseStatus}
          onContentSelect={setSelectedContentId}
          setIsSidebarOpen={setIsSidebarOpen}
          activeContentId={selectedContentId}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden" ref={contentRef}>
        <CourseContent data={courseContent} selectedContentId={selectedContentId} updateProgress={updateProgress} />
      </main>
    </div>
  )
}

