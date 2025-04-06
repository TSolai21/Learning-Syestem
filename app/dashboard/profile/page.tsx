"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Loader } from "@/components/loader"
import {
  User,
  Briefcase,
  MapPin,
  GraduationCap,
  Mail,
  Smartphone,
  Globe,
  Target,
  Award,
  Star,
  Book,
  Edit,
  X,
  Save,
  Calendar,
  Clock,
  BookOpen,
  Linkedin,
  Github,
} from "lucide-react"

interface UserDetails {
  user_id: number
  user_name: string
  designation: string
  current_organization: string
  city: string
  highest_qualification: string
  year_of_passedout: string
  mail_id: string
  mobile_number: string
  portfolio_website: string
  linkedin_profile: string
  github_profile: string
  ambition: string
  work_experience: number
  area_of_interest: string
}

interface Certificate {
  certificate_id: number
  certificate_name: string
  certification_level: string
  enrollment_date: string
}

interface Badge {
  badge_id: number
  badge_name: string
  badge_type: string
  badge_level: string
  earned_date: string
}

interface Course {
  course_id: number
  course_name: string
  course_short_description: string
  course_profile_image: string
  course_type: string
  course_duration_hours: number
  course_duration_minutes: number
  course_progress: number
  enrolled_students: number
  lessons_count: number
  rating: number
}

export default function ProfilePage() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [userCourses, setUserCourses] = useState<Course[]>([])
  const [userBadges, setUserBadges] = useState<Badge[]>([])
  const [userCertificates, setUserCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<UserDetails | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")

        const response = await api.post("/userdetails", {
          user_id: user.user_id,
        })

        setUserDetails(response.data?.user_details?.user_details || null)
        setUserCourses(response.data?.user_details?.enrolled_courses || [])
        setUserBadges(response.data?.user_details?.user_badges || [])
        setUserCertificates(response.data?.user_details?.user_certifications || [])

        setEditData(response.data?.user_details?.user_details || null)
      } catch (error) {
        console.error("Error fetching user details:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return

    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    if (!editData) return

    try {
      await api.put("/userdetails/update", editData)

      setUserDetails(editData)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-primary flex justify-center items-center rounded-full mb-4 text-white text-4xl font-medium">
                    {userDetails?.user_name?.charAt(0)}
                  </div>

                  <h2 className="text-xl font-bold text-center">{userDetails?.user_name}</h2>

                  <p className="text-gray-500 mb-2 text-center">{userDetails?.designation || "Student"}</p>

                  <p className="text-sm text-gray-500 mb-4 text-center">
                    {userDetails?.current_organization || "TATTI Learning"}
                  </p>

                  <div className="flex space-x-3 mb-6">
                    {userDetails?.linkedin_profile && (
                      <a
                        href={userDetails.linkedin_profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                        aria-label="LinkedIn Profile"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}

                    {userDetails?.github_profile && (
                      <a
                        href={userDetails.github_profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="GitHub Profile"
                      >
                        <Github size={18} />
                      </a>
                    )}

                    {userDetails?.portfolio_website && (
                      <a
                        href={userDetails.portfolio_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                        aria-label="Portfolio Website"
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>

                  <Button onClick={() => setIsEditing(true)} className="w-full" variant="outline">
                    <Edit size={16} className="mr-2" /> Edit Profile
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-primary" />
                        <span className="text-sm">Courses</span>
                      </div>
                      <span className="font-medium">{userCourses.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-primary" />
                        <span className="text-sm">Certificates</span>
                      </div>
                      <span className="font-medium">{userCertificates.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-primary" />
                        <span className="text-sm">Badges</span>
                      </div>
                      <span className="font-medium">{userBadges.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm">Experience</span>
                      </div>
                      <span className="font-medium">{userDetails?.work_experience || 0} years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User size={16} /> Profile
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen size={16} /> Courses
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex items-center gap-2">
                  <Award size={16} /> Certificates
                </TabsTrigger>
                <TabsTrigger value="badges" className="flex items-center gap-2">
                  <Star size={16} /> Badges
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold">Edit Profile</h2>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditing(false)
                                setEditData(userDetails)
                              }}
                            >
                              <X size={16} className="mr-2" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                              <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { name: "user_name", label: "Full Name", icon: User },
                            { name: "designation", label: "Designation", icon: Briefcase },
                            { name: "city", label: "City", icon: MapPin },
                            { name: "highest_qualification", label: "Qualification", icon: GraduationCap },
                            { name: "mail_id", label: "Email", icon: Mail },
                            { name: "mobile_number", label: "Mobile", icon: Smartphone },
                            { name: "portfolio_website", label: "Website", icon: Globe },
                            { name: "linkedin_profile", label: "LinkedIn", icon: Linkedin },
                            { name: "github_profile", label: "GitHub", icon: Github },
                            { name: "area_of_interest", label: "Interests", icon: Star },
                            { name: "ambition", label: "Ambition", icon: Target },
                            { name: "work_experience", label: "Experience (years)", icon: Briefcase, type: "number" },
                          ].map((field) => (
                            <div key={field.name} className="space-y-1">
                              <Label htmlFor={field.name}>{field.label}</Label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <field.icon size={16} />
                                </div>
                                <Input
                                  type={field.type || "text"}
                                  id={field.name}
                                  name={field.name}
                                  value={editData?.[field.name as keyof UserDetails] || ""}
                                  onChange={handleInputChange}
                                  className="pl-10"
                                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-bold mb-6">Profile Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { icon: User, label: "Full Name", value: userDetails?.user_name },
                            { icon: Briefcase, label: "Designation", value: userDetails?.designation },
                            { icon: MapPin, label: "City", value: userDetails?.city },
                            {
                              icon: GraduationCap,
                              label: "Highest Qualification",
                              value: userDetails?.highest_qualification,
                            },
                            { icon: Calendar, label: "Graduation Year", value: userDetails?.year_of_passedout },
                            { icon: Mail, label: "Email", value: userDetails?.mail_id },
                            { icon: Smartphone, label: "Mobile", value: userDetails?.mobile_number },
                            { icon: Target, label: "Ambition", value: userDetails?.ambition },
                            {
                              icon: Book,
                              label: "Work Experience",
                              value: `${userDetails?.work_experience || 0} years`,
                            },
                            { icon: Star, label: "Area of Interest", value: userDetails?.area_of_interest },
                          ].map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                              <div className="p-2 bg-white rounded-full">
                                <item.icon size={18} className="text-primary" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">{item.label}</p>
                                <p className="font-medium">{item.value || "Not specified"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Your Courses</h2>
                      <span className="text-sm text-gray-500">{userCourses.length} courses</span>
                    </div>

                    {userCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userCourses.map((course) => (
                          <Card key={course.course_id} className="overflow-hidden">
                            <div className="h-40 bg-gray-100">
                              <img
                                src={course.course_profile_image || "/placeholder.svg"}
                                alt={course.course_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-2 line-clamp-1">{course.course_name}</h3>
                              <div className="h-2 bg-gray-200 rounded-full mb-2">
                                <div
                                  className="h-2 bg-primary rounded-full"
                                  style={{ width: `${course.course_progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{course.course_progress}% complete</span>
                                <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                  <a href={`/dashboard/courses/${course.course_id}/learn`}>Continue</a>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No courses enrolled</h3>
                        <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
                        <Button asChild>
                          <a href="/dashboard/courses">Browse Courses</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificates">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Your Certificates</h2>
                      <span className="text-sm text-gray-500">{userCertificates.length} certificates</span>
                    </div>

                    {userCertificates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userCertificates.map((cert) => (
                          <Card key={cert.certificate_id} className="overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-bold mb-1">{cert.certificate_name}</h3>
                                  <p className="text-blue-100 text-sm">{cert.certification_level} Level</p>
                                </div>
                                <Award className="text-white w-8 h-8" />
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>Issued on {new Date(cert.enrollment_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-gray-500">ID: {cert.certificate_id}</span>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    View
                                  </Button>
                                  <Button size="sm">Download</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No certificates yet</h3>
                        <p className="text-gray-500 mb-4">Complete courses to earn certificates</p>
                        <Button asChild>
                          <a href="/dashboard/courses">Browse Courses</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="badges">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Your Badges</h2>
                      <span className="text-sm text-gray-500">{userBadges.length} badges</span>
                    </div>

                    {userBadges.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {userBadges.map((badge) => {
                          const badgeColors = {
                            Skill: {
                              bg: "bg-blue-50",
                              text: "text-blue-600",
                              icon: <Star className="h-6 w-6 text-blue-600" />,
                            },
                            Achievement: {
                              bg: "bg-yellow-50",
                              text: "text-yellow-600",
                              icon: <Award className="h-6 w-6 text-yellow-600" />,
                            },
                            Milestone: {
                              bg: "bg-green-50",
                              text: "text-green-600",
                              icon: <Target className="h-6 w-6 text-green-600" />,
                            },
                          }

                          const badgeStyle = badgeColors[badge.badge_type as keyof typeof badgeColors] || {
                            bg: "bg-gray-50",
                            text: "text-gray-600",
                            icon: <Star className="h-6 w-6 text-gray-600" />,
                          }

                          return (
                            <Card key={badge.badge_id} className={`${badgeStyle.bg} border-0`}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                  {badgeStyle.icon}
                                  <div>
                                    <h3 className={`font-semibold ${badgeStyle.text}`}>{badge.badge_name}</h3>
                                    <p className="text-sm text-gray-500">{badge.badge_level} Level</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm mt-3">
                                  <Calendar className="w-4 h-4" />
                                  <span>Earned on {new Date(badge.earned_date).toLocaleDateString()}</span>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No badges earned yet</h3>
                        <p className="text-gray-500 mb-4">Complete activities to earn badges</p>
                        <Button asChild>
                          <a href="/dashboard/courses">Browse Courses</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

