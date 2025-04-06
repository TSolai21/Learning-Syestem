// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { ExternalLink } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { debounce } from "lodash"

// interface CourseContentItem {
//   course_mastertitle_breakdown_id: number
//   course_mastertitle_breakdown: string
//   course_subtitle_id: number
//   course_subtitle: string
//   subtitle_content: string
//   subtitle_code?: string
//   helpfull_links?: string
// }

// interface CourseContentProps {
//   data: CourseContentItem[]
//   selectedContentId: string
//   updateProgress: (subtitleId: number, masterId: number, progress: number) => void
// }

// export function CourseContent({ data, selectedContentId, updateProgress }: CourseContentProps) {
//   const [currentContent, setCurrentContent] = useState<CourseContentItem | null>(null)
//   const contentRef = useRef<HTMLDivElement>(null)

//   // Transform data for easier access
//   const transformedData = data.reduce(
//     (acc, item) => {
//       const id = `${item.course_mastertitle_breakdown_id}-${item.course_subtitle_id}`
//       acc[id] = item
//       return acc
//     },
//     {} as Record<string, CourseContentItem>,
//   )

//   // Update current content when selectedContentId changes
//   useEffect(() => {
//     setCurrentContent(transformedData[selectedContentId] || null)
//     if (contentRef.current) {
//       contentRef.current.scrollTo(0, 0)
//     }
//   }, [selectedContentId, transformedData])

//   // Track scroll progress
//   useEffect(() => {
//     if (!currentContent) return

//     const handleScroll = debounce(() => {
//       if (contentRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } = contentRef.current

//         let newProgress
//         if (scrollHeight <= clientHeight) {
//           newProgress = 100 // Auto-complete progress for short content
//         } else {
//           newProgress = Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100)
//         }

//         console.log(newProgress, "newProgress");

//         if (newProgress > 0) {

//           updateProgress(currentContent.course_subtitle_id, currentContent.course_mastertitle_breakdown_id, newProgress)
//         }
//       }
//     }, 500)

//     const contentDiv = contentRef.current
//     if (contentDiv) {
//       contentDiv.addEventListener("scroll", handleScroll)

//       // Check progress on mount
//       handleScroll()
//     }

//     return () => {
//       if (contentDiv) {
//         contentDiv.removeEventListener("scroll", handleScroll)
//       }
//       handleScroll.cancel()
//     }
//   }, [currentContent, updateProgress])

//   if (!currentContent) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <p>Select a lesson to start learning</p>
//       </div>
//     )
//   }

//   return (
//     <div ref={contentRef} className="mt-6 overflow-auto h-[calc(100vh-120px)] pb-5 pr-4">
//       <h2 className="text-2xl font-bold mb-6 text-primary">{currentContent.course_subtitle}</h2>

//       <div className="prose max-w-none">
//         {currentContent.subtitle_content.split("\n\n").map((paragraph, index) => (
//           <p key={index} className="mb-4 text-gray-700 leading-relaxed">
//             {paragraph}
//           </p>
//         ))}
//       </div>

//       {currentContent.subtitle_code && (
//         <Card className="my-6">
//           <CardContent className="p-4 overflow-x-auto">
//             <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
//               {currentContent.subtitle_code}
//             </pre>
//           </CardContent>
//         </Card>
//       )}

//       {currentContent.helpfull_links && (
//         <div className="mt-8">
//           <h3 className="text-lg font-semibold mb-4">Helpful Resources</h3>
//           <Card>
//             <CardContent className="p-4">
//               <ul className="space-y-2">
//                 {currentContent.helpfull_links.split(",").map((link, index) => (
//                   <li key={index}>
//                     <Button variant="link" className="p-0 h-auto flex items-center gap-2 text-blue-600" asChild>
//                       <a href={link.trim()} target="_blank" rel="noopener noreferrer">
//                         <ExternalLink size={16} />
//                         {link.trim()}
//                       </a>
//                     </Button>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   )
// }

"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { debounce } from "lodash"

interface CourseContentItem {
  course_mastertitle_breakdown_id: number
  course_mastertitle_breakdown: string
  course_subtitle_id: number
  course_subtitle: string
  subtitle_content: string
  subtitle_code?: string
  helpfull_links?: string
}

interface CourseContentProps {
  data: CourseContentItem[]
  selectedContentId: string
  updateProgress: (subtitleId: number, masterId: number, progress: number) => void
}

export function CourseContent({ data, selectedContentId, updateProgress }: CourseContentProps) {
  const [currentContent, setCurrentContent] = useState<CourseContentItem | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Memoized transformation of data
  const transformedData = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          const id = `${item.course_mastertitle_breakdown_id}-${item.course_subtitle_id}`
          acc[id] = item
          return acc
        },
        {} as Record<string, CourseContentItem>,
      ),
    [data],
  )

  // Update current content when selectedContentId changes
  useEffect(() => {
    setCurrentContent(transformedData[selectedContentId] || null)

    // Scroll to top when lesson changes
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" }) // Smooth scroll to top
    }
  }, [selectedContentId, transformedData])

  // Track scroll progress
  useEffect(() => {
    if (!currentContent || !contentRef.current) return

    const handleScroll = debounce(() => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current

        const newProgress =
          scrollHeight <= clientHeight ? 100 : Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100)

        if (newProgress > 0) {
          updateProgress(currentContent.course_subtitle_id, currentContent.course_mastertitle_breakdown_id, newProgress)
        }
      }
    }, 500)

    const contentDiv = contentRef.current
    contentDiv.addEventListener("scroll", handleScroll)
    handleScroll() // Check progress on mount

    return () => {
      contentDiv.removeEventListener("scroll", handleScroll)
      handleScroll.cancel()
    }
  }, [currentContent, updateProgress])

  if (!currentContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Select a lesson to start learning</p>
      </div>
    )
  }

  return (
    <div ref={contentRef} className="mt-6 overflow-auto h-[calc(100vh-120px)] pb-5 pr-4">
      <h2 className="text-2xl font-bold mb-6 text-primary">{currentContent.course_subtitle}</h2>

      <div className="prose max-w-none">
        {currentContent.subtitle_content.split("\n\n").map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {currentContent.subtitle_code && (
        <Card className="my-6">
          <CardContent className="p-4 overflow-x-auto">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
              {currentContent.subtitle_code}
            </pre>
          </CardContent>
        </Card>
      )}

      {currentContent.helpfull_links && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Helpful Resources</h3>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {currentContent.helpfull_links.split(",").map((link, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto flex items-center gap-2 text-blue-600" asChild>
                      <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} />
                        {link.trim()}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

