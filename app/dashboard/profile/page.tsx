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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Download,
  Eye,
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
  age: number
  job_title: string
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

interface ValidationError {
  field: string
  message: string
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")

        const response = await api.post("/userdetails", {
          user_id: user.user_id,
        })

        const userDetailsFromApi = response.data?.user_details?.user_details

        if (userDetailsFromApi) {
          // Existing user
          setUserDetails(userDetailsFromApi)
          setEditData(null)
          setIsEditing(false)
        } else {
          // New user - initialize with empty details
          const emptyUserDetails = {
            user_id: user.user_id,
            user_name: "",
            designation: "",
            current_organization: "",
            city: "",
            highest_qualification: "",
            year_of_passedout: "",
            mail_id: "",
            mobile_number: "",
            portfolio_website: "",
            linkedin_profile: "",
            github_profile: "",
            ambition: "",
            work_experience: 0,
            area_of_interest: "",
            age: 0,
            job_title: ""
          }
          setUserDetails(null)
          setEditData(emptyUserDetails)
          setIsEditing(true) // New users should start in edit mode
        }

        setUserCourses(response.data?.user_details?.enrolled_courses || [])
        setUserBadges(response.data?.user_details?.user_badges || [])
        setUserCertificates(response.data?.user_details?.user_certifications || [])
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

  const validateUserDetails = (data: Partial<UserDetails>): ValidationError[] => {
    const errors: ValidationError[] = []

    // Required fields validation
    const requiredFields = [
      { field: 'user_name', label: 'Full Name' },
      { field: 'designation', label: 'Designation' },
      { field: 'highest_qualification', label: 'Qualification' },
      { field: 'mail_id', label: 'Email' },
      { field: 'mobile_number', label: 'Mobile Number' },
      { field: 'age', label: 'Age' },
      { field: 'job_title', label: 'Job Title' }
    ]

    requiredFields.forEach(({ field, label }) => {
      const value = data[field as keyof UserDetails]
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors.push({
          field,
          message: `${label} is required`
        })
      }
    })

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (data.mail_id && !emailRegex.test(data.mail_id)) {
      errors.push({
        field: 'mail_id',
        message: 'Please enter a valid email address'
      })
    }

    // Mobile number validation
    const mobileRegex = /^\d{10}$/
    if (data.mobile_number && !mobileRegex.test(data.mobile_number)) {
      errors.push({
        field: 'mobile_number',
        message: 'Please enter a valid 10-digit mobile number'
      })
    }

    // URL validations
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    if (data.portfolio_website && !urlRegex.test(data.portfolio_website)) {
      errors.push({
        field: 'portfolio_website',
        message: 'Please enter a valid website URL'
      })
    }
    if (data.linkedin_profile && !urlRegex.test(data.linkedin_profile)) {
      errors.push({
        field: 'linkedin_profile',
        message: 'Please enter a valid LinkedIn URL'
      })
    }
    if (data.github_profile && !urlRegex.test(data.github_profile)) {
      errors.push({
        field: 'github_profile',
        message: 'Please enter a valid GitHub URL'
      })
    }

    // Work experience validation
    if (data.work_experience && (isNaN(Number(data.work_experience)) || Number(data.work_experience) < 0)) {
      errors.push({
        field: 'work_experience',
        message: 'Work experience must be a valid number of years'
      })
    }

    // Age validation
    if (data.age !== undefined) {
      const age = Number(data.age)
      if (isNaN(age) || age < 18 || age > 100) {
        errors.push({
          field: 'age',
          message: 'Age must be between 18 and 100'
        })
      }
    }

    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return

    const value = e.target.type === 'number' ?
      e.target.value === '' ? 0 : parseInt(e.target.value, 10) :
      e.target.value

    // Clear error for the field being changed
    setFieldErrors(prev => ({
      ...prev,
      [e.target.name]: ''
    }))

    setEditData({
      ...editData,
      [e.target.name]: value,
    })
  }

  const handleSave = async () => {
    if (!editData) return

    // Validate the data before sending
    const validationErrors = validateUserDetails(editData)

    if (validationErrors.length > 0) {
      const newFieldErrors: Record<string, string> = {}
      validationErrors.forEach(error => {
        newFieldErrors[error.field] = error.message
      })
      setFieldErrors(newFieldErrors)

      toast({
        title: "Validation Error",
        description: validationErrors[0].message,
        variant: "destructive",
      })
      return
    }

    setFieldErrors({})
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const dataToSend = {
        ...editData,
        user_id: user.user_id,
        work_experience: typeof editData.work_experience === 'string' ?
          parseInt(editData.work_experience, 10) || 0 :
          editData.work_experience || 0,
        age: typeof editData.age === 'string' ?
          parseInt(editData.age, 10) || 0 :
          editData.age || 0
      }

      const response = await api.put("/userdetails/update", dataToSend)

      // Check if response contains success message or user details
      if (response.data?.message?.toLowerCase().includes('success') ||
        response.data?.status === "success" ||
        response.data?.user_details) {

        // Use the returned user details or the sent data
        const updatedUserDetails = response.data?.user_details || dataToSend

        // Update all states synchronously
        setUserDetails(updatedUserDetails)
        setEditData(null)
        setFieldErrors({})
        setIsEditing(false)

        // Show success message
        toast({
          title: "Success",
          description: response.data?.message || "Profile updated successfully",
        })

        // Refresh data in the background
        try {
          const refreshResponse = await api.post("/userdetails", {
            user_id: user.user_id,
          })

          if (refreshResponse.data?.user_details?.user_details) {
            const refreshedData = refreshResponse.data.user_details
            setUserDetails(refreshedData.user_details)
            setUserCourses(refreshedData.enrolled_courses || [])
            setUserBadges(refreshedData.user_badges || [])
            setUserCertificates(refreshedData.user_certifications || [])
          }
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError)
        }
      } else if (response.data?.error) {
        // Handle explicit error from the server
        throw new Error(response.data.error)
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      // Only show error toast and keep edit mode if it's a real error
      if (!error.message?.toLowerCase().includes('success')) {
        setIsEditing(true)
        toast({
          title: "Error",
          description: error.response?.data?.message || error.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      } else {
        // If the error message contains 'success', treat it as a success
        setUserDetails(editData)
        setEditData(null)
        setFieldErrors({})
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (userDetails) {
      // Existing user - reset to current details
      setEditData(null)
      setIsEditing(false)
    } else {
      // New user - keep in edit mode with empty details
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const emptyUserDetails = {
        user_id: user.user_id,
        user_name: "",
        designation: "",
        current_organization: "",
        city: "",
        highest_qualification: "",
        year_of_passedout: "",
        mail_id: "",
        mobile_number: "",
        portfolio_website: "",
        linkedin_profile: "",
        github_profile: "",
        ambition: "",
        work_experience: 0,
        area_of_interest: "",
        age: 0,
        job_title: ""
      }
      setEditData(emptyUserDetails)
      setIsEditing(true)
    }
    setFieldErrors({})
  }

  const handleEditClick = () => {
    if (userDetails) {
      setEditData(userDetails)
    } else {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const emptyUserDetails = {
        user_id: user.user_id,
        user_name: "",
        designation: "",
        current_organization: "",
        city: "",
        highest_qualification: "",
        year_of_passedout: "",
        mail_id: "",
        mobile_number: "",
        portfolio_website: "",
        linkedin_profile: "",
        github_profile: "",
        ambition: "",
        work_experience: 0,
        area_of_interest: "",
        age: 0,
        job_title: ""
      }
      setEditData(emptyUserDetails)
    }
    setFieldErrors({})
    setIsEditing(true)
  }

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsCertificateModalOpen(true)
  }

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      // Create a canvas element to generate the certificate
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size (A4 size in pixels at 96 DPI, landscape orientation)
      canvas.width = 1123; // A4 width in pixels
      canvas.height = 794; // A4 height in pixels

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border (blue, matching the view modal)
      ctx.strokeStyle = '#3b82f6'; // Tailwind blue-500
      ctx.lineWidth = 30;
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

      // Content area padding
      const contentPadding = 60;
      const contentWidth = canvas.width - 2 * contentPadding;
      const contentHeight = canvas.height - 4 * contentPadding;
      const contentX = contentPadding;
      const contentY = contentPadding;

      // Center text function helper
      const centeredText = (text: string, y: number, color: string, font: string) => {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, y);
      };

      // Header (Companian powered by TATTI)
      centeredText('Companian', contentY + 100, '#2563eb', 'bold 60px Arial'); // Tailwind blue-600
      centeredText('Powered by TATTI', contentY + 150, '#4b5563', '28px Arial'); // Tailwind gray-600

      // Main certification text
      centeredText('This is to certify that', contentY + 250, '#1f2937', '28px Arial'); // Tailwind gray-800
      centeredText(userDetails?.user_name || '', contentY + 310, '#1f2937', 'bold 48px Arial');
      centeredText('has successfully completed the course', contentY + 370, '#1f2937', '28px Arial');

      // Course details
      centeredText(certificate.certificate_name, contentY + 450, '#2563eb', 'bold 44px Arial');
      centeredText(`Level: ${certificate.certification_level}`, contentY + 500, '#4b5563', '28px Arial');

      // Footer section (Signature and Date)
      const footerY = canvas.height - 150; // Y position for the footer content
      const signatureX = canvas.width / 4; // X position for signature
      const dateX = (canvas.width / 4) * 3; // X position for date
      const lineLength = 250; // Length of the signature line
      const footerTextColor = '#4b5563'; // Tailwind gray-600
      const footerTextSize = '20px Arial';
      const footerLineColor = '#4b5563';

      // Course Instructor Signature Line
      // ctx.strokeStyle = footerLineColor;
      // ctx.lineWidth = 2;
      // ctx.beginPath();
      // ctx.moveTo(signatureX - lineLength / 2, footerY);
      // ctx.lineTo(signatureX + lineLength / 2, footerY);
      // ctx.stroke();
     
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });

      if (!blob) throw new Error('Failed to generate certificate image');

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.certificate_name}-certificate.png`; // Download as PNG with certificate name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: `Failed to download certificate: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

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

                  <Button onClick={handleEditClick} className="w-full" variant="outline">
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
                      <div className="space-y-8">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold">Edit Profile</h2>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                            >
                              <X size={16} className="mr-2" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                              <Save size={16} className="mr-2" /> Save Changes
                            </Button>
                          </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            {[
                              { name: "user_name", label: "Full Name", icon: User },
                              { name: "age", label: "Age", icon: User, type: "number" },
                              { name: "mail_id", label: "Email", icon: Mail },
                              { name: "mobile_number", label: "Mobile", icon: Smartphone },
                              { name: "city", label: "City", icon: MapPin },
                            ].map((field) => (
                              <div key={field.name} className="space-y-1">
                                <Label htmlFor={field.name} className="text-sm font-medium">{field.label}</Label>
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
                                    className={`pl-10 ${fieldErrors[field.name] ? 'border-red-500' : ''}`}
                                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                                  />
                                </div>
                                {fieldErrors[field.name] && (
                                  <p className="text-sm text-red-500 mt-1">{fieldErrors[field.name]}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Professional Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            {[
                              { name: "designation", label: "Designation", icon: Briefcase },
                              { name: "job_title", label: "Job Title", icon: Briefcase },
                              { name: "current_organization", label: "Organization", icon: Briefcase },
                              { name: "work_experience", label: "Experience (years)", icon: Briefcase, type: "number" },
                              { name: "highest_qualification", label: "Qualification", icon: GraduationCap },
                              { name: "year_of_passedout", label: "Graduation Year", icon: Calendar },
                              { name: "area_of_interest", label: "Areas of Interest", icon: Star },
                              { name: "ambition", label: "Career Ambition", icon: Target },
                            ].map((field) => (
                              <div key={field.name} className="space-y-1">
                                <Label htmlFor={field.name} className="text-sm font-medium">{field.label}</Label>
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
                                    className={`pl-10 ${fieldErrors[field.name] ? 'border-red-500' : ''}`}
                                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                                  />
                                </div>
                                {fieldErrors[field.name] && (
                                  <p className="text-sm text-red-500 mt-1">{fieldErrors[field.name]}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Social Links Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Social & Portfolio Links</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            {[
                              { name: "portfolio_website", label: "Portfolio Website", icon: Globe },
                              { name: "linkedin_profile", label: "LinkedIn Profile", icon: Linkedin },
                              { name: "github_profile", label: "GitHub Profile", icon: Github },
                            ].map((field) => (
                              <div key={field.name} className="space-y-1">
                                <Label htmlFor={field.name} className="text-sm font-medium">{field.label}</Label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <field.icon size={16} />
                                  </div>
                                  <Input
                                    type="url"
                                    id={field.name}
                                    name={field.name}
                                    value={editData?.[field.name as keyof UserDetails] || ""}
                                    onChange={handleInputChange}
                                    className={`pl-10 ${fieldErrors[field.name] ? 'border-red-500' : ''}`}
                                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                                  />
                                </div>
                                {fieldErrors[field.name] && (
                                  <p className="text-sm text-red-500 mt-1">{fieldErrors[field.name]}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold">Profile Details</h2>
                          <Button onClick={handleEditClick} variant="outline" size="sm">
                            <Edit size={16} className="mr-2" /> Edit Profile
                          </Button>
                        </div>

                        {/* Personal Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { icon: User, label: "Full Name", value: userDetails?.user_name },
                              { icon: User, label: "Age", value: userDetails?.age },
                              { icon: Mail, label: "Email", value: userDetails?.mail_id },
                              { icon: Smartphone, label: "Mobile", value: userDetails?.mobile_number },
                              { icon: MapPin, label: "City", value: userDetails?.city },
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

                        {/* Professional Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Professional Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { icon: Briefcase, label: "Designation", value: userDetails?.designation },
                              { icon: Briefcase, label: "Job Title", value: userDetails?.job_title },
                              { icon: Briefcase, label: "Organization", value: userDetails?.current_organization },
                              { icon: Book, label: "Work Experience", value: `${userDetails?.work_experience || 0} years` },
                              { icon: GraduationCap, label: "Qualification", value: userDetails?.highest_qualification },
                              { icon: Calendar, label: "Graduation Year", value: userDetails?.year_of_passedout },
                              { icon: Star, label: "Areas of Interest", value: userDetails?.area_of_interest },
                              { icon: Target, label: "Career Ambition", value: userDetails?.ambition },
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

                        {/* Social Links Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-700">Social & Portfolio Links</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { icon: Globe, label: "Portfolio Website", value: userDetails?.portfolio_website },
                              { icon: Linkedin, label: "LinkedIn Profile", value: userDetails?.linkedin_profile },
                              { icon: Github, label: "GitHub Profile", value: userDetails?.github_profile },
                            ].map((item, index) => (
                              <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                                <div className="p-2 bg-white rounded-full">
                                  <item.icon size={18} className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">{item.label}</p>
                                  <p className="font-medium">
                                    {item.value ? (
                                      <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {item.value}
                                      </a>
                                    ) : (
                                      "Not specified"
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
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
                        {userCertificates.map((cert, index) => (
                          <Card key={`${cert.certificate_id}-${index}`} className="overflow-hidden">
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
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewCertificate(cert)}
                                  >
                                    <Eye size={16} className="mr-2" /> View
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleDownloadCertificate(cert)}
                                  >
                                    <Download size={16} className="mr-2" /> Download
                                  </Button>
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

      {/* Certificate Modal */}
      <Dialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate of Completion</DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="relative bg-white p-8 rounded-lg border-2 border-gray-200">
              {/* Certificate Border */}
              <div className="absolute inset-0 border-8 border-blue-500 rounded-lg opacity-20"></div>
              
              {/* Certificate Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-blue-600 mb-2">Companian</h1>
                  <p className="text-gray-600">Powered by TATTI</p>
                </div>

                {/* Main Content */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-4">This is to certify that</p>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{userDetails?.user_name}</h2>
                  <p className="text-gray-600 mb-4">has successfully completed the course</p>
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">{selectedCertificate.certificate_name}</h3>
                  <p className="text-gray-600">Level: {selectedCertificate.certification_level}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end mt-12">
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-48 pt-2">
                      <p className="text-sm text-gray-600">Course Instructor</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-48 pt-2">
                      <p className="text-sm text-gray-600">Date: {new Date(selectedCertificate.enrollment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate ID */}
                {/* <div className="text-center mt-8">
                  <p className="text-sm text-gray-500">Certificate ID: {selectedCertificate.certificate_id}</p>
                </div> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

