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
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const response = await api.get(`/jobs/${user.user_id}`)
        setRecommendedJobs(response.data.recommended_jobs || [])
        setJobs(response.data.all_jobs || [])
        setFilteredJobs(response.data.all_jobs || [])
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

      <div className="container mx-auto px-4 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Disclaimer:</strong> This Learning Management System (LMS) is built for educational purposes only. 
            The job listings section references publicly available job portals and is intended for learning and demonstration purposes.
          </p>
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
        ) : (
          <>
            {recommendedJobs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Recommended Jobs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedJobs.map((job) => (
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
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-4">All Jobs</h2>
              {filteredJobs.length > 0 ? (
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
          </>
        )}
      </div>
    </div>
  )
}