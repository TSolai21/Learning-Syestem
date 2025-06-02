"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { debounce } from "lodash"
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

interface CourseContentItem {
  course_mastertitle_breakdown_id: number
  course_mastertitle_breakdown: string
  course_subtitle_id: number
  course_subtitle: string
  subtitle_content: string
  subtitle_code?: string
  helpfull_links?: string
}

interface AssessmentQuestion {
  question_id: number;
  question: string;
  question_sequenceid: number;
  course_id: number;
}

interface AssessmentOption {
  option_sequence: number;
  option_text: string;
  question_id: number;
  course_id: number;
  option_id?: number;
}

interface CourseContentProps {
  data: CourseContentItem[]
  selectedContentId: string
  updateProgress: (subtitleId: number, masterId: number, progress: number) => void
  overallProgress: number
  showAssessmentContent: boolean
  assessmentData: {
    questions: AssessmentQuestion[];
    options: AssessmentOption[];
  } | null;
  courseId: string;
}

export function CourseContent({ data, selectedContentId, updateProgress, overallProgress, showAssessmentContent, assessmentData, courseId }: CourseContentProps) {
  const [currentContent, setCurrentContent] = useState<CourseContentItem | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answerStatus, setAnswerStatus] = useState<Record<number, boolean | null>>({});
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" })
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
    handleScroll()

    return () => {
      contentDiv.removeEventListener("scroll", handleScroll)
      handleScroll.cancel()
    }
  }, [currentContent, updateProgress])

  // Handle option click
  const handleOptionClick = async (questionId: number, optionSequence: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionSequence }));
    setAnswerStatus(prev => ({ ...prev, [questionId]: null }));

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const selectedOption = assessmentData?.options.find(opt => opt.question_id === questionId && opt.option_sequence === optionSequence);

      if (!selectedOption) {
        console.error("Selected option not found.");
        setAnswerStatus(prev => ({ ...prev, [questionId]: false }));
        return;
      }

      const response = await api.post("/check_answer", {
        question_id: questionId,
        option_text: selectedOption.option_text,
        option_id: selectedOption.option_id
      });

      if (response.data.status === "success") {
        setAnswerStatus(prev => ({ ...prev, [questionId]: response.data.is_correct }));
        if (!response.data.is_correct) {
           toast({
             title: "Incorrect Answer",
             description: "That's not the correct answer. Please try again.",
             variant: "destructive",
             duration: 3000
           });
        }
      } else {
        console.error("API Error checking answer:", response.data);
        setAnswerStatus(prev => ({ ...prev, [questionId]: false }));
        toast({
          title: "Error",
          description: "Failed to check answer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking answer:", error);
      setAnswerStatus(prev => ({ ...prev, [questionId]: false }));
      toast({
        title: "Error",
        description: "Failed to check answer.",
        variant: "destructive",
      });
    }
  };

  // Handle assessment submission
  const handleSubmitAssessment = async () => {
    setIsSubmittingAssessment(true); // Disable button immediately
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const answers = Object.keys(selectedAnswers).map(questionId => ({
      question_id: parseInt(questionId),
      selected_option_sequence: selectedAnswers[parseInt(questionId)],
    }));

    try {
      const response = await api.post("/submit-assessment", {
        user_id: user.user_id,
        course_id: courseId,
        answers: answers,
      });

      if (response.data.success) {
        toast({
          title: "Assessment Submitted",
          description: response.data.message,
        });
        // Redirect to home page after successful submission
        router.push('/dashboard');
      } else {
        toast({
          title: "Submission Failed",
          description: response.data.message || "An error occurred during submission.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAssessment(false); // Re-enable button (though redirection will happen on success)
    }
  };

  // Check if all questions have been answered correctly
  const allQuestionsAnsweredCorrectly = Array.isArray(assessmentData?.questions) && assessmentData.questions.length > 0 &&
    assessmentData.questions.every(question => answerStatus[question.question_id] === true);

  if (!currentContent && !showAssessmentContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Select a lesson to start learning</p>
      </div>
    )
  }

  // Conditional rendering for assessment or course content
  if (showAssessmentContent) {
    if (overallProgress >= 90) {
      if (!assessmentData || !Array.isArray(assessmentData.questions) || assessmentData.questions.length === 0) {
        return (
          <div className="flex items-center justify-center h-full px-4 text-center">
            <p className="text-xl text-gray-700">Loading assessment data or no questions available...</p>
          </div>
        );
      }

      // Render the actual assessment questions and options here
      return (
        <div className="mt-6 px-4">
          <h2 className="text-2xl font-bold mb-6 text-primary">Practice Assessment</h2>
          <div className="space-y-6">
            {assessmentData.questions.map((question) => (
              <Card key={question.question_id}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{question.question_sequenceid}. {question.question}</h3>
                  <div className="space-y-3">
                    {assessmentData.options
                      .filter(option => option.question_id === question.question_id)
                      .map(option => {
                        const isSelected = selectedAnswers[question.question_id] === option.option_sequence;
                        const status = answerStatus[question.question_id];
                        const isCorrect = status === true;
                        const isIncorrect = status === false && isSelected;

                        return (
                          <Button
                            key={option.option_sequence}
                            variant={isSelected ? (isCorrect ? "default" : "destructive") : "outline"}
                            className={`w-full justify-start text-left ${isCorrect && isSelected ? "bg-green-500 hover:bg-green-600 text-white" : isIncorrect ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                            onClick={() => handleOptionClick(question.question_id, option.option_sequence)}
                            disabled={status === true}
                          >
                            {option.option_text}
                            {isSelected && isCorrect && <CheckCircle2 className="ml-2 h-4 w-4" />}
                            {isSelected && isIncorrect && <XCircle className="ml-2 h-4 w-4" />}
                          </Button>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button
              onClick={handleSubmitAssessment}
              disabled={!allQuestionsAnsweredCorrectly || isSubmittingAssessment}
            >
              End Assessment
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full px-4 text-center">
          <p className="text-xl text-gray-700">
            You must complete at least 90% of the course lessons to access the assessment.
            <br />
            Your current progress is {overallProgress.toFixed(0)}%.
          </p>
        </div>
      );
    }
  }

  // Render normal course content if not showing assessment
  return (
    <div ref={contentRef} className="mt-6 overflow-auto h-[calc(100vh-120px)] pb-5 pr-4">
      {currentContent && (
        <>
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
        </>
      )}
    </div>
  )
}

