// 'use client';

// import { useEffect, useState } from 'react';
// import { Card, CardContent, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { api } from '@/lib/api';
// import { useToast } from '@/hooks/use-toast';
// import { Briefcase, ExternalLink, Search } from 'lucide-react';

// interface Job {
//     job_id: number;
//     job_title: string;
//     company: string;
//     location: string;
//     salary: string;
//     apply_link: string;
//     updated_date: string;
//     description: string;
// }

// export default function JobsPage() {
//     const [jobs, setJobs] = useState<Job[]>([]);
//     const [loading, setLoading] = useState(true);
//     const { toast } = useToast();

//     useEffect(() => {
//         const fetchJobs = async () => {
//             try {
//                 setLoading(true);
//                 const response = await api.get('/jobs');
//                 setJobs(response.data.jobs || []);
//             } catch (error) {
//                 console.error('Error fetching jobs:', error);
//                 toast({
//                     title: 'Error',
//                     description: 'Failed to load jobs',
//                     variant: 'destructive',
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchJobs();
//     }, [toast]);

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <div className="bg-white shadow-sm border-b">
//                 <div className="container mx-auto py-6 px-4">
//                     <h1 className="text-3xl font-bold">Job Listings</h1>
//                     <p className="text-gray-500 mt-1">Find the latest job opportunities</p>
//                 </div>
//             </div>

//             <div className="container mx-auto px-4 py-8">
//                 {loading ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         {Array(8)
//                             .fill(0)
//                             .map((_, index) => (
//                                 <div key={index} className="h-[320px] bg-gray-100 animate-pulse rounded-lg"></div>
//                             ))}
//                     </div>
//                 ) : jobs.length > 0 ? (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         {jobs.map((job) => (
//                             <Card key={job.job_id} className="overflow-hidden flex flex-col">
//                                 <div className="relative h-52 bg-gray-100 flex items-center justify-center">
//                                     <Briefcase className="h-16 w-16 text-gray-400" />
//                                 </div>
//                                 <CardContent className="flex-grow p-4">
//                                     <h3 title={job.job_title} className="text-lg font-semibold mb-2 line-clamp-1">
//                                         {job.job_title}
//                                     </h3>
//                                     <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
//                                         {job.company}
//                                     </span>
//                                     <p className="text-sm text-gray-500 mt-2">📍 {job.location}</p>
//                                     <p className="text-sm text-gray-500">💰 {job.salary}</p>
//                                     <p className="text-xs text-gray-500 mt-2">
//                                         Updated: {new Date(job.updated_date).toLocaleDateString()}
//                                     </p>
//                                 </CardContent>
//                                 <CardFooter className="p-4 pt-0">
//                                     <Button className="w-full" variant="outline" asChild>
//                                         <a
//                                             href={job.apply_link}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="flex items-center justify-center gap-2"
//                                         >
//                                             Apply Now <ExternalLink size={16} />
//                                         </a>
//                                     </Button>
//                                 </CardFooter>
//                             </Card>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-16">
//                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
//                             <Search size={24} className="text-gray-400" />
//                         </div>
//                         <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
//                         <p className="text-gray-500">Check back later for new opportunities</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { api } from "@/lib/api"
// import { useToast } from "@/hooks/use-toast"
// import { ExternalLink, Search } from "lucide-react"

// interface Job {
//   job_id: number
//   job_title: string
//   company: string
//   location: string
//   salary: string
//   apply_link: string
//   updated_date: string
//   description: string
// }

// export default function JobsPage() {
//   const [jobs, setJobs] = useState<Job[]>([])
//   const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [loading, setLoading] = useState(true)
//   const { toast } = useToast()

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         setLoading(true)
//         const response = await api.get("/jobs")
//         setJobs(response.data.jobs || [])
//         setFilteredJobs(response.data.jobs || [])
//       } catch (error) {
//         console.error("Error fetching jobs:", error)
//         toast({
//           title: "Error",
//           description: "Failed to load jobs",
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchJobs()
//   }, [toast])

//   useEffect(() => {
//     const results = jobs.filter(
//       (job) =>
//         job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         job.location.toLowerCase().includes(searchQuery.toLowerCase()),
//     )
//     setFilteredJobs(results)
//   }, [searchQuery, jobs])

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-100">
//       <div className="bg-primary shadow-md border-b text-white py-6 px-4">
//         <div className="container mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
//           <div className="flex-1">
//             <h1 className="text-3xl font-bold">Job Listings</h1>
//             <p className="text-primary-200 mt-1">Find the latest job opportunities</p>
//           </div>
//           <Input
//             type="text"
//             placeholder="Search jobs..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full md:w-80 p-2 rounded-lg border border-gray-300 focus:ring-2 text-black focus:ring-primary"
//           />
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {Array(6)
//               .fill(0)
//               .map((_, index) => (
//                 <div key={index} className="h-[320px] bg-gray-300 animate-pulse rounded-lg"></div>
//               ))}
//           </div>
//         ) : filteredJobs.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {filteredJobs.map((job) => (
//               <Card
//                 key={job.job_id}
//                 className="overflow-hidden flex flex-col shadow-lg rounded-lg border border-gray-200 bg-white"
//               >
//                 <CardContent className="flex-grow p-6">
//                   <h3 title={job.job_title} className="text-lg font-semibold mb-2 text-black">
//                     {job.job_title}
//                   </h3>
//                   <span className="inline-block bg-primary-100 text-primary text-xs font-semibold px-3 py-1 rounded-lg">
//                     {job.company}
//                   </span>
//                   <p className="text-sm text-gray-600 mt-2">📍 {job.location}</p>
//                   <p className="text-sm text-green-600 font-medium">💰 {job.salary}</p>
//                   <p className="text-xs text-gray-500 mt-2">
//                     Updated: {new Date(job.updated_date).toLocaleDateString()}
//                   </p>
//                   <p className="text-sm text-gray-700 mt-4 line-clamp-3">{job.description}</p>
//                 </CardContent>
//                 <CardFooter className="p-4 pt-0 flex justify-end">
//                   <Button className="w-full bg-primary text-white hover:bg-primary-dark" asChild>
//                     <a
//                       href={job.apply_link}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex items-center justify-center gap-2"
//                     >
//                       Apply Now <ExternalLink size={16} />
//                     </a>
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-16">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
//               <Search size={24} className="text-primary" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
//             <p className="text-gray-500">Check back later for new opportunities</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }



"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ExternalLink, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Job {
  job_id: number
  job_title: string
  company: string
  location: string
  salary: string
  apply_link: string
  updated_date: string
  description: string
  job_type: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await api.get("/jobs")
        setJobs(response.data.jobs || [])
        setFilteredJobs(response.data.jobs || [])
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    // Replace your fetchJobs function with this mock version for testing
    // const fetchJobs = async () => {
    //   try {
    //     setLoading(true)
    //     // Mock data with different job types
    //     const mockJobs: Job[] = [
    //       {
    //         job_id: 1,
    //         job_title: "Frontend Developer",
    //         company: "Tech Corp",
    //         location: "San Francisco, CA",
    //         salary: "$100,000 - $130,000",
    //         apply_link: "https://example.com/job/1",
    //         updated_date: "2023-05-01",
    //         description: "We're looking for a skilled frontend developer with React experience.",
    //         job_type: "Full-time"
    //       },
    //       {
    //         job_id: 2,
    //         job_title: "UX Designer",
    //         company: "Design Hub",
    //         location: "Remote",
    //         salary: "$90,000 - $110,000",
    //         apply_link: "https://example.com/job/2",
    //         updated_date: "2023-05-02",
    //         description: "Join our design team to create beautiful user experiences.",
    //         job_type: "Contract"
    //       },
    //       {
    //         job_id: 3,
    //         job_title: "Backend Engineer",
    //         company: "Data Systems",
    //         location: "New York, NY",
    //         salary: "$120,000 - $150,000",
    //         apply_link: "https://example.com/job/3",
    //         updated_date: "2023-05-03",
    //         description: "Looking for backend developers with Node.js and database experience.",
    //         job_type: "Full-time"
    //       },
    //       {
    //         job_id: 4,
    //         job_title: "Product Manager",
    //         company: "Innovate Inc",
    //         location: "Chicago, IL",
    //         salary: "$110,000 - $140,000",
    //         apply_link: "https://example.com/job/4",
    //         updated_date: "2023-05-04",
    //         description: "Lead product development for our flagship software.",
    //         job_type: "Part-time"
    //       },
    //       {
    //         job_id: 5,
    //         job_title: "DevOps Specialist",
    //         company: "Cloud Solutions",
    //         location: "Austin, TX",
    //         salary: "$130,000 - $160,000",
    //         apply_link: "https://example.com/job/5",
    //         updated_date: "2023-05-05",
    //         description: "Implement and maintain our cloud infrastructure.",
    //         job_type: "Full-time"
    //       },
    //       {
    //         job_id: 6,
    //         job_title: "Data Scientist",
    //         company: "Analytics Pro",
    //         location: "Boston, MA",
    //         salary: "$115,000 - $145,000",
    //         apply_link: "https://example.com/job/6",
    //         updated_date: "2023-05-06",
    //         description: "Use machine learning to extract insights from big data.",
    //         job_type: "Contract"
    //       }
    //     ]

    //     setJobs(mockJobs)
    //     setFilteredJobs(mockJobs)
    //   } catch (error) {
    //     console.error("Error fetching jobs:", error)
    //     toast({
    //       title: "Error",
    //       description: "Failed to load jobs",
    //       variant: "destructive",
    //     })
    //   } finally {
    //     setLoading(false)
    //   }
    // }

    fetchJobs()
  }, [toast])

  useEffect(() => {
    let results = jobs.filter(
      (job) =>
        job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (jobTypeFilter !== "all") {
      results = results.filter(job =>
        job.job_type.toLowerCase() === jobTypeFilter.toLowerCase()
      )
    }

    setFilteredJobs(results)
  }, [searchQuery, jobTypeFilter, jobs])

  // Get unique job types for the dropdown
  const jobTypes = ["all", ...new Set(jobs.map(job => job?.job_type?.toLowerCase()))]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-100">
      <div className="bg-primary shadow-md border-b text-white py-6 px-4">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Job Listings</h1>
            <p className="text-primary-200 mt-1">Find the latest job opportunities</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 text-black focus:ring-primary"
            />
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white text-black">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type?.charAt(0)?.toUpperCase() + type?.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="h-[320px] bg-gray-300 animate-pulse rounded-lg"></div>
              ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card
                key={job.job_id}
                className="overflow-hidden flex flex-col shadow-lg rounded-lg border border-gray-200 bg-white"
              >
                <CardContent className="flex-grow p-6">
                  <h3 title={job.job_title} className="text-lg font-semibold mb-2 text-black">
                    {job.job_title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block bg-primary-100 text-primary text-xs font-semibold px-3 py-1 rounded-lg">
                      {job.company}
                    </span>
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-lg">
                      {job.job_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">📍 {job.location}</p>
                  <p className="text-sm text-green-600 font-medium">💰 {job.salary}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Updated: {new Date(job.updated_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-4 line-clamp-3">{job.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                  <Button className="w-full bg-primary text-white hover:bg-primary-dark" asChild>
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Apply Now <ExternalLink size={16} />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <Search size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}