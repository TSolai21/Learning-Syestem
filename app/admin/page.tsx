"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { api } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

  const handleGenerateKeys = async () => {
    try {
      setIsLoading(true)
      const response = await api.post('/generate-keys', { num_users: numUsers })
      
      const keys = response.data.split('\n').filter((key: string) => key.trim() !== '')
      setGeneratedKeys(keys)
    } catch (error) {
      console.error('Error generating keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCourseCreation = async () => {
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
      }
    } catch (error) {
      console.error('Error in course creation:', error)
    } finally {
      setIsLoading(false)
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Users Management</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Users</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate User Keys</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="num-users">Number of Users</Label>
                      <Input
                        id="num-users"
                        type="number"
                        min="1"
                        value={numUsers}
                        onChange={(e) => setNumUsers(parseInt(e.target.value))}
                      />
                    </div>
                    <Button 
                      onClick={handleGenerateKeys}
                      disabled={isLoading || numUsers <= 0}
                      className="w-full"
                    >
                      {isLoading ? "Generating..." : "Generate Keys"}
                    </Button>
                    {generatedKeys.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Generated Keys:</h4>
                        <div className="bg-gray-100 p-4 rounded-md max-h-40 overflow-y-auto">
                          {generatedKeys.map((key, index) => (
                            <div key={index} className="text-sm font-mono mb-1">{key}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">Active users in the system</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+123</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">789</div>
                    <p className="text-xs text-muted-foreground">Users active in last 7 days</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Courses Management</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Course</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Course - Step {currentStep} of 3</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {currentStep === 1 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="course-name">Course Name</Label>
                          <Input
                            id="course-name"
                            value={courseData.course_name}
                            onChange={(e) => setCourseData({...courseData, course_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="course-description">Short Description</Label>
                          <Textarea
                            id="course-description"
                            value={courseData.course_short_description}
                            onChange={(e) => setCourseData({...courseData, course_short_description: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="course-type">Course Type</Label>
                            <Input
                              id="course-type"
                              value={courseData.course_type}
                              onChange={(e) => setCourseData({...courseData, course_type: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Input
                              id="language"
                              value={courseData.language}
                              onChange={(e) => setCourseData({...courseData, language: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration-hours">Duration (Hours)</Label>
                            <Input
                              id="duration-hours"
                              type="number"
                              value={courseData.course_duration_hours}
                              onChange={(e) => setCourseData({...courseData, course_duration_hours: parseInt(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration-minutes">Duration (Minutes)</Label>
                            <Input
                              id="duration-minutes"
                              type="number"
                              value={courseData.course_duration_minutes}
                              onChange={(e) => setCourseData({...courseData, course_duration_minutes: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {currentStep === 2 && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="detailed-description">Detailed Description</Label>
                          <Textarea
                            id="detailed-description"
                            value={courseData.course_description}
                            onChange={(e) => setCourseData({...courseData, course_description: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="objectives">Course Objectives</Label>
                          <Textarea
                            id="objectives"
                            value={courseData.course_objective}
                            onChange={(e) => setCourseData({...courseData, course_objective: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prerequisites">Prerequisites</Label>
                          <Textarea
                            id="prerequisites"
                            value={courseData.pre_requirments}
                            onChange={(e) => setCourseData({...courseData, pre_requirments: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="course-level">Course Level</Label>
                            <Select
                              value={courseData.course_level}
                              onValueChange={(value) => setCourseData({...courseData, course_level: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="enrollment-type">Enrollment Type</Label>
                            <Select
                              value={courseData.enrollment_type}
                              onValueChange={(value) => setCourseData({...courseData, enrollment_type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-2">
                        <Label htmlFor="course-content">Course Content (Excel File)</Label>
                        <Input
                          id="course-content"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      {currentStep > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(currentStep - 1)}
                        >
                          Previous
                        </Button>
                      )}
                      <Button
                        onClick={handleCourseCreation}
                        disabled={isLoading}
                        className={currentStep === 1 ? "ml-auto" : ""}
                      >
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
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">Active courses in the system</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Free Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Available free courses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Premium Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Available premium courses</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Course List</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Sample course cards - replace with actual data */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">Python Programming</h4>
                        <Badge variant="secondary">Free</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Learn Python basics to advanced</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>10h 30m</span>
                        <span>⭐ 4.5</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">Web Development</h4>
                        <Badge>Premium</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Master modern web development</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>15h 45m</span>
                        <span>⭐ 4.8</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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