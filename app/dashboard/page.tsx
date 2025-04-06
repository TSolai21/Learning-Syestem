// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"
// import { ArrowRight, BookOpen, Users, Award, ChevronRight } from "lucide-react"
// import { api } from "@/lib/api"
// import { CourseCard } from "@/components/course-card"

// interface Course {
//   course_id: number
//   course_name: string
//   course_short_description: string
//   course_profile_image: string
//   course_type: string
//   course_duration_hours: number
//   course_duration_minutes: number
//   course_progress: number
//   enrolled_students: number
//   lessons_count: number
//   rating: number
// }

// export default function DashboardPage() {
//   const [courses, setCourses] = useState<Course[]>([])
//   const [loading, setLoading] = useState(true)
//   const [user, setUser] = useState<any>(null)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)
//         const userData = JSON.parse(localStorage.getItem("user") || "{}")
//         setUser(userData)

//         // Fetch courses
//         const response = await api.get("/course-master")
//         setCourses(response.data.courses || [])
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-b from-primary/10 to-transparent py-12">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl">
//             <h1 className="text-4xl font-bold mb-4">Welcome, {user?.username || "Student"}!</h1>
//             <p className="text-xl text-gray-600 mb-6">Continue your learning journey and explore new courses.</p>
//             <div className="flex flex-wrap gap-4">
//               <Button asChild>
//                 <Link href="/dashboard/courses">
//                   Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
//                 </Link>
//               </Button>
//               <Button variant="outline" asChild>
//                 <Link href="/dashboard/ebooks">Explore E-Books</Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-12">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <Card>
//               <CardContent className="flex items-center p-6">
//                 <div className="rounded-full bg-blue-100 p-3 mr-4">
//                   <BookOpen className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Enrolled Courses</p>
//                   <h3 className="text-2xl font-bold">{loading ? "..." : "3"}</h3>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="flex items-center p-6">
//                 <div className="rounded-full bg-green-100 p-3 mr-4">
//                   <Award className="h-6 w-6 text-green-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Certificates Earned</p>
//                   <h3 className="text-2xl font-bold">{loading ? "..." : "1"}</h3>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="flex items-center p-6">
//                 <div className="rounded-full bg-purple-100 p-3 mr-4">
//                   <Users className="h-6 w-6 text-purple-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Learning Hours</p>
//                   <h3 className="text-2xl font-bold">{loading ? "..." : "12"}</h3>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Recent Courses Section */}
//       <section className="py-12">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-2xl font-bold">Your Recent Courses</h2>
//             <Button variant="ghost" asChild>
//               <Link href="/dashboard/courses" className="flex items-center">
//                 View all <ChevronRight className="ml-1 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="h-[320px] bg-gray-100 animate-pulse rounded-lg"></div>
//               ))}
//             </div>
//           ) : courses.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {courses.slice(0, 3).map((course) => (
//                 <CourseCard key={course.course_id} course={course} />
//               ))}
//             </div>
//           ) : (
//             <Card>
//               <CardContent className="p-8 text-center">
//                 <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                 <h3 className="text-xl font-medium mb-2">No courses yet</h3>
//                 <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
//                 <Button asChild>
//                   <Link href="/dashboard/courses">Browse Courses</Link>
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </section>
//     </div>
//   )
// }

"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import partner1 from "@/assets/images/partner1.png"
import partner2 from "@/assets/images/partner2.png"
import partner3 from "@/assets/images/partner3.png"
import partner4 from "@/assets/images/partner4.png"
import heroImage from "@/assets/images/hero.png"
import visionImage from "@/assets/images/vision.png"
import { ClipboardCheck, Award, Briefcase, BrainCircuit, Rocket, Laptop2 } from "lucide-react"

const Home = () => {
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-yellow-300 to-yellow-100 py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">Welcome To TATTI</h1>
            <p className="text-lg text-gray-700 max-w-xl mx-auto md:mx-0">
              We are redefining the way people learn and grow in their careers with innovation, technology, and
              education.
            </p>
            <Link href="/dashboard/courses">
              <Button className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded-lg text-white text-lg font-semibold shadow-md transition-all">
                Get Started
              </Button>
            </Link>
          </div>
          <div className="flex justify-center w-full md:w-1/2">
            <Image src={heroImage} alt="Students learning" width={500} height={500} className="drop-shadow-lg" />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 md:px-16 text-center">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Our Vision</h2>
          <div className="flex flex-col md:flex-row items-center gap-16">
            {/* Image Section */}
            <div className="md:w-1/2 flex justify-center">
              <Image
                src={visionImage}
                alt="Vision Illustration"
                width={500}
                height={500}
                className="rounded-xl shadow-lg"
              />
            </div>

            {/* Text Content Section */}
            <div className="md:w-1/2 text-left space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                We empower futures by bridging students and colleges through innovation, technology, and education.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔗</span>
                  <p className="text-lg text-gray-700">
                    <strong>Empowering Connections:</strong> Connecting learners with their ideal institutions
                    seamlessly.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🚀</span>
                  <p className="text-lg text-gray-700">
                    <strong>Innovation at Its Core:</strong> Redefining education with cutting-edge technology.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🌍</span>
                  <p className="text-lg text-gray-700">
                    <strong>Community Development:</strong> Fostering a thriving educational ecosystem.
                  </p>
                </li>
              </ul>
              <p className="text-gray-900 font-semibold text-xl">
                Together, we innovate, inspire, and impact lives—one connection at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Features We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ClipboardCheck size={40} className="text-blue-500" />}
              title="Interactive Assessments"
              description="Measure your skills and track your progress in real-time."
            />
            <FeatureCard
              icon={<Award size={40} className="text-yellow-500" />}
              title="Online Certifications"
              description="Earn recognized certifications upon completing courses and internships."
            />
            <FeatureCard
              icon={<Briefcase size={40} className="text-green-500" />}
              title="Employability Skills"
              description="Equipping individuals with the essential skills to thrive in the modern job market."
            />
            <FeatureCard
              icon={<BrainCircuit size={40} className="text-purple-500" />}
              title="AI-Driven Interactions"
              description="Chat with books, upload notes, and ask questions with advanced AI capabilities."
            />
            <FeatureCard
              icon={<Rocket size={40} className="text-red-500" />}
              title="Entrepreneurship Skills"
              description="Empowering aspiring entrepreneurs with the tools and mindset to launch and grow successful ventures."
            />
            <FeatureCard
              icon={<Laptop2 size={40} className="text-indigo-500" />}
              title="Virtual Internships"
              description="Experience real-world challenges and gain certificates for successful completions."
            />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Partners</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <Image src={partner1} alt="" width={150} height={60} className="object-contain" />
            <Image src={partner2} alt="" width={150} height={60} className="object-contain" />
            <Image src={partner3} alt="" width={150} height={60} className="object-contain" />
            <Image src={partner4} alt="" width={150} height={60} className="object-contain" />
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About TATTI</h3>
            <p className="text-gray-400 text-sm">Redefining education through technology and innovation.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Certifications
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white text-sm">
                  Virtual Internships
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex flex-col space-y-2">
              <Link href="https://x.com/TattiSkills" className="text-gray-400 hover:text-white text-sm">
                Twitter
              </Link>
              <Link
                href="https://www.linkedin.com/company/tamilnadu-advanced-technical-training-institute/"
                className="text-gray-400 hover:text-white text-sm"
              >
                LinkedIn
              </Link>
              <Link href="https://www.facebook.com/TattiChennai" className="text-gray-400 hover:text-white text-sm">
                Facebook
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-gray-400">
                <strong>Email:</strong> admin@tatti.in
              </p>
              <p className="text-gray-400">
                <strong>Phone:</strong> 9884170589
              </p>
              <p className="text-gray-400">
                <strong>Address:</strong> 42/25, Gee Gee Complex, Anna Salai, Mount Road, Triplicane, Chennai, Tamil
                Nadu 600002
              </p>
            </div>
          </div>

          {/* Newsletter
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Stay updated with our latest offerings.</p>
            <div className="flex flex-col space-y-2">
              <input type="email" placeholder="Enter your email" className="bg-gray-800 border border-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-500" />
              <Button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded">Subscribe</Button>
            </div>
          </div> */}
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © 2025 TATTI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }) => (
  <Card className="transition-transform hover:scale-105">
    <CardContent className="flex items-center gap-4 p-6">
      <div className="text-primary">{icon}</div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </CardContent>
  </Card>
)

export default Home

