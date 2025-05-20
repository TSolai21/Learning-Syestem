"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Course {
  course_id: number
  course_name: string
  course_short_description: string
  course_type: string
  course_duration_hours: number
  course_duration_minutes: number
  language: string
  rating: number
  course_profile_image: string
}

export default function AdminPage() {
  const [numUsers, setNumUsers] = useState<number>(0)
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [batchName, setBatchName] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [validityDays, setValidityDays] = useState<number>(30)

  // Course creation states
  const [currentStep, setCurrentStep] = useState(1)
  const [courseData, setCourseData] = useState({
    course_name: "",
    course_short_description: "",
    course_type: "",
    course_duration_hours: 0,
    course_duration_minutes: 0,
    language: "",
    rating: 0,
    course_profile_image: "",
    course_description: "",
    course_objective: "",
    pre_requirments: "",
    course_level: "",
    roles: "",
    enrollment_type: "free"
  })
  const [courseId, setCourseId] = useState<number | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Add state for courses and loading
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState<string | null>(null)

  // Validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Validation logic for each step
  const validateStep = (step: number) => {
    const errors: { [key: string]: string } = {}
    if (step === 1) {
      if (!courseData.course_name.trim()) errors.course_name = "Course name is required"
      if (!courseData.course_short_description.trim()) errors.course_short_description = "Short description is required"
      if (!courseData.course_type.trim()) errors.course_type = "Course type is required"
      if (!courseData.language.trim()) errors.language = "Language is required"
      if (!courseData.course_duration_hours || courseData.course_duration_hours < 0) errors.course_duration_hours = "Duration (hours) must be 0 or more"
      if (courseData.course_duration_minutes < 0) errors.course_duration_minutes = "Duration (minutes) must be 0 or more"
    } else if (step === 2) {
      if (!courseData.course_description.trim()) errors.course_description = "Detailed description is required"
      else if (courseData.course_description.trim().length < 100) errors.course_description = "Description must be at least 100 characters"
      if (!courseData.course_objective.trim()) errors.course_objective = "Course objectives are required"
      if (!courseData.pre_requirments.trim()) errors.pre_requirments = "Prerequisites are required"
      if (!courseData.course_level.trim()) errors.course_level = "Course level is required"
      if (!courseData.enrollment_type.trim()) errors.enrollment_type = "Enrollment type is required"
    } else if (step === 3) {
      if (!selectedFile) errors.selectedFile = "Course content file is required"
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGenerateKeys = async () => {
    try {
      setIsLoading(true)
      const response = await api.post('/generate-keys', { 
        num_users: numUsers,
        batch_name: batchName,
        course_ids: selectedCourses,
        validity_days: validityDays
      })

      const keys = response.data.split('\n').filter((key: string) => key.trim() !== '')
      setGeneratedKeys(keys)
    } catch (error) {
      console.error('Error generating keys:', error)
      toast({ 
        title: "Error", 
        description: "Failed to generate keys. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCourseCreation = async () => {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) return
    try {
      setIsLoading(true)

      // Step 1: Create course master
      if (currentStep === 1) {
        const response = await api.post('/courseMaster', {
          course_name: courseData.course_name,
          course_short_description: courseData.course_short_description,
          course_type: courseData.course_type,
          course_duration_hours: courseData.course_duration_hours,
          course_duration_minutes: courseData.course_duration_minutes,
          language: courseData.language,
          rating: courseData.rating,
          course_profile_image: courseData.course_profile_image
        })

        setCourseId(response.data.course_id)
        setCurrentStep(2)
      }

      // Step 2: Create course enrollment
      else if (currentStep === 2) {
        const response = await api.post('/courseEnrollment', {
          course_id: courseId,
          course_description: courseData.course_description,
          course_objective: courseData.course_objective,
          pre_requirments: courseData.pre_requirments,
          course_level: courseData.course_level,
          roles: courseData.roles,
          course_type: courseData.enrollment_type
        })

        setEnrollmentId(response.data.enrollment_id)
        setCurrentStep(3)
      }

      // Step 3: Upload course content
      else if (currentStep === 3 && selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        await api.post('/courseContent/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // Reset form and close dialog
        setCurrentStep(1)
        setCourseData({
          course_name: "",
          course_short_description: "",
          course_type: "",
          course_duration_hours: 0,
          course_duration_minutes: 0,
          language: "",
          rating: 0,
          course_profile_image: "",
          course_description: "",
          course_objective: "",
          pre_requirments: "",
          course_level: "",
          roles: "",
          enrollment_type: "free"
        })
        setCourseId(null)
        setEnrollmentId(null)
        setSelectedFile(null)
        setIsDialogOpen(false)
        toast({ title: "Course Created", description: "The course was created successfully.", variant: "default" })
        reloadCourses()
        return
      }
    } catch (error) {
      console.error('Error in course creation:', error)
      toast({ title: "Error", description: "Failed to create course.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch courses on mount and after creation
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true)
        setCoursesError(null)
        const response = await api.get("/course-master")
        setCourses(response.data.courses || [])
      } catch (error: any) {
        setCoursesError("Failed to fetch courses")
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Helper to reload courses
  const reloadCourses = async () => {
    try {
      setCoursesLoading(true)
      setCoursesError(null)
      const response = await api.get("/course-master")
      setCourses(response.data.courses || [])
    } catch (error: any) {
      setCoursesError("Failed to fetch courses")
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="global-analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global-analysis">Global Analysis</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="global-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Global Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,350</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Course Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78.2%</div>
                    <p className="text-xs text-muted-foreground">+4.1% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create New Users</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Users</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="batchName" className="text-right">
                        Batch Name
                      </Label>
                      <Input
                        id="batchName"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter batch name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="numUsers" className="text-right">
                        Number of Users
                      </Label>
                      <Input
                        id="numUsers"
                        type="number"
                        value={numUsers}
                        onChange={(e) => setNumUsers(parseInt(e.target.value))}
                        className="col-span-3"
                        min="1"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="validityDays" className="text-right">
                        Validity (Days)
                      </Label>
                      <Input
                        id="validityDays"
                        type="number"
                        value={validityDays}
                        onChange={(e) => setValidityDays(parseInt(e.target.value))}
                        className="col-span-3"
                        min="1"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">
                        Select Courses
                      </Label>
                      <div className="col-span-3 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {courses.map((course) => (
                          <div key={course.course_id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`course-${course.course_id}`}
                              checked={selectedCourses.includes(course.course_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourses([...selectedCourses, course.course_id])
                                } else {
                                  setSelectedCourses(selectedCourses.filter(id => id !== course.course_id))
                                }
                              }}
                            />
                            <label htmlFor={`course-${course.course_id}`}>
                              {course.course_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleGenerateKeys} disabled={isLoading}>
                      {isLoading ? "Generating..." : "Generate Keys"}
                    </Button>
                  </div>
                  {generatedKeys.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Generated Keys:</h3>
                      <div className="max-h-40 overflow-y-auto border rounded p-2">
                        {generatedKeys.map((key, index) => (
                          <div key={index} className="text-sm font-mono">{key}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Courses Management</CardTitle>
              <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>Create Course</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl px-4 py-2">
                  <DialogHeader>
                    <DialogTitle>Create New Course - Step {currentStep} of 3</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 py-2">
                    {currentStep === 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="course-name">Course Name</Label>
                          <Input id="course-name" value={courseData.course_name} onChange={(e) => setCourseData({ ...courseData, course_name: e.target.value })} aria-invalid={!!formErrors.course_name} />
                          <div className="min-h-[18px]">{formErrors.course_name && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_name}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="course-description">Short Description</Label>
                          <Textarea id="course-description" value={courseData.course_short_description} onChange={(e) => setCourseData({ ...courseData, course_short_description: e.target.value })} aria-invalid={!!formErrors.course_short_description} className="min-h-[38px]" />
                          <div className="min-h-[18px]">{formErrors.course_short_description && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_short_description}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="course-type">Course Type</Label>
                          <Select value={courseData.course_type} onValueChange={(value) => setCourseData({ ...courseData, course_type: value })}>
                            <SelectTrigger aria-invalid={!!formErrors.course_type} className="h-9 text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="min-h-[18px]">{formErrors.course_type && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_type}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="language">Language</Label>
                          <Input id="language" value={courseData.language} onChange={(e) => setCourseData({ ...courseData, language: e.target.value })} aria-invalid={!!formErrors.language} />
                          <div className="min-h-[18px]">{formErrors.language && <p className="text-red-500 text-xs mt-0.5">{formErrors.language}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="duration-hours">Duration (Hours)</Label>
                          <Input id="duration-hours" type="number" value={String(courseData.course_duration_hours)} onChange={(e) => setCourseData({ ...courseData, course_duration_hours: parseInt(e.target.value) })} aria-invalid={!!formErrors.course_duration_hours} />
                          <div className="min-h-[18px]">{formErrors.course_duration_hours && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_duration_hours}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="duration-minutes">Duration (Minutes)</Label>
                          <Input id="duration-minutes" type="number" value={String(courseData.course_duration_minutes)} onChange={(e) => setCourseData({ ...courseData, course_duration_minutes: parseInt(e.target.value) })} aria-invalid={!!formErrors.course_duration_minutes} />
                          <div className="min-h-[18px]">{formErrors.course_duration_minutes && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_duration_minutes}</p>}</div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="detailed-description">Detailed Description</Label>
                          <Textarea id="detailed-description" value={courseData.course_description} onChange={(e) => setCourseData({ ...courseData, course_description: e.target.value })} aria-invalid={!!formErrors.course_description} className="min-h-[38px]" />
                          <div className="text-xs text-gray-600">Description must be at least 100 characters.</div>
                          <div className="min-h-[18px]">{formErrors.course_description && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_description}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="objectives">Course Objectives</Label>
                          <Textarea id="objectives" value={courseData.course_objective} onChange={(e) => setCourseData({ ...courseData, course_objective: e.target.value })} aria-invalid={!!formErrors.course_objective} className="min-h-[38px]" />
                          <div className="min-h-[18px]">{formErrors.course_objective && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_objective}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="prerequisites">Prerequisites</Label>
                          <Textarea id="prerequisites" value={courseData.pre_requirments} onChange={(e) => setCourseData({ ...courseData, pre_requirments: e.target.value })} aria-invalid={!!formErrors.pre_requirments} className="min-h-[38px]" />
                          <div className="min-h-[18px]">{formErrors.pre_requirments && <p className="text-red-500 text-xs mt-0.5">{formErrors.pre_requirments}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="course-level">Course Level</Label>
                          <Select value={courseData.course_level} onValueChange={(value) => setCourseData({ ...courseData, course_level: value })}>
                            <SelectTrigger aria-invalid={!!formErrors.course_level} className="h-9 text-sm">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="min-h-[18px]">{formErrors.course_level && <p className="text-red-500 text-xs mt-0.5">{formErrors.course_level}</p>}</div>
                        </div>
                        <div className="space-y-1 flex flex-col">
                          <Label htmlFor="enrollment-type">Enrollment Type</Label>
                          <Select value={courseData.enrollment_type} onValueChange={(value) => setCourseData({ ...courseData, enrollment_type: value })}>
                            <SelectTrigger aria-invalid={!!formErrors.enrollment_type} className="h-9 text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="min-h-[18px]">{formErrors.enrollment_type && <p className="text-red-500 text-xs mt-0.5">{formErrors.enrollment_type}</p>}</div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1 flex flex-col md:col-span-2">
                          <Label htmlFor="course-content">Course Content (Excel File)</Label>
                          <Input id="course-content" type="file" accept=".xlsx,.xls" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} aria-invalid={!!formErrors.selectedFile} />
                          <div className="min-h-[18px]">{formErrors.selectedFile && <p className="text-red-500 text-xs mt-0.5">{formErrors.selectedFile}</p>}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            <strong>Note:</strong> Your Excel file must include the columns: <code>course_id</code>, <code>course_mastertitle_breakdown_id</code>, <code>course_subtitle_id</code> in the first row.<br />
                            <button
                              type="button"
                              className="mt-1 underline text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                const header = ["course_id", "course_mastertitle_breakdown_id", "course_subtitle_id"];
                                const csvContent = header.join(",") + "\n";
                                const blob = new Blob([csvContent], { type: "text/csv" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "course_content_template.csv";
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Download Template
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-2">
                      {currentStep > 1 && (
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                          Previous
                        </Button>
                      )}
                      <Button onClick={handleCourseCreation} disabled={isLoading} size="sm" className={currentStep === 1 ? "ml-auto" : ""}>
                        {isLoading ? "Processing..." : currentStep === 3 ? "Create Course" : "Next"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{coursesLoading ? "..." : courses.length}</div>
                    <p className="text-xs text-muted-foreground">Active courses in the system</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Free Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{coursesLoading ? "..." : courses.filter(c => c.course_type.toLowerCase() === "free").length}</div>
                    <p className="text-xs text-muted-foreground">Available free courses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Premium Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{coursesLoading ? "..." : courses.filter(c => c.course_type.toLowerCase() === "premium").length}</div>
                    <p className="text-xs text-muted-foreground">Available premium courses</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course List</h3>
                {coursesLoading ? (
                  <div>Loading courses...</div>
                ) : coursesError ? (
                  <div className="text-red-500">{coursesError}</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.length === 0 ? (
                      <div className="col-span-full text-center text-gray-500">No courses found.</div>
                    ) : (
                      courses.map((course) => (
                        <Card key={course.course_id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold line-clamp-1">{course.course_name}</h4>
                              <Badge variant={course.course_type.toLowerCase() === "free" ? "secondary" : undefined}>
                                {course.course_type.charAt(0).toUpperCase() + course.course_type.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-3">{course.course_short_description}</p>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{course.course_duration_hours}h {course.course_duration_minutes}m</span>
                              <span>⭐ {course.rating}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 