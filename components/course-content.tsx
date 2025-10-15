"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { debounce } from "lodash"
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Book, Lightbulb, AlertTriangle, Info, Star } from "lucide-react";
import { useRouter } from 'next/navigation';
import ReactMarkdown from "react-markdown";
import React from "react";

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

  // Preprocess markdown for better readability: add blank lines before and after bold headers
  function preprocessMarkdown(md: string) {
    let processed = md.replace(/([^\n])\n?(\*\*[\w\d .#:-]+\*\*:?)/g, '$1\n\n$2');
    processed = processed.replace(/(\*\*[\w\d .#:-]+\*\*:?)(?!\n\n)/g, '$1\n\n');
    return processed;
  }

  // Custom heading renderer with enhanced styling and content type detection
  const HeadingRenderer = ({ level, children }) => {
    // Validate level parameter and default to h2 if invalid
    const validLevel = (typeof level === 'number' && level >= 1 && level <= 6) ? level : 2;
    
    // Convert children to string for matching
    const text = Array.isArray(children) ? children.map(c => (typeof c === 'string' ? c : '')).join(' ') : String(children);
    
    let color = "text-primary";
    let icon = null;
    let bgColor = "";
    let borderColor = "";
    let padding = "";
    let borderRadius = "";
    
    // Enhanced styling based on content type and level
    if (validLevel === 1) {
      // Main course title
      color = "text-orange-600";
      icon = <Book className="inline mr-3 text-orange-500" size={28} />;
      bgColor = "bg-gradient-to-r from-orange-50 to-orange-100";
      padding = "p-4";
      borderRadius = "rounded-lg";
    } else if (validLevel === 2) {
      // Module/section titles
      color = "text-orange-700";
      icon = <Book className="inline mr-2 text-orange-500" size={24} />;
      bgColor = "bg-orange-50";
      padding = "p-3";
      borderRadius = "rounded-md";
      borderColor = "border-l-4 border-orange-400";
    } else if (validLevel === 3) {
      // Subsection titles with content type detection
      if (/introduction|overview|getting started/i.test(text)) {
        color = "text-blue-700";
        icon = <Info className="inline mr-2 text-blue-500" size={20} />;
        bgColor = "bg-blue-50";
        borderColor = "border-l-4 border-blue-400";
      } else if (/key points?|important|main|core/i.test(text)) {
        color = "text-purple-700";
        icon = <Star className="inline mr-2 text-purple-500" size={20} />;
        bgColor = "bg-purple-50";
        borderColor = "border-l-4 border-purple-400";
      } else if (/example|demo|sample/i.test(text)) {
        color = "text-yellow-700";
        icon = <Lightbulb className="inline mr-2 text-yellow-500" size={20} />;
        bgColor = "bg-yellow-50";
        borderColor = "border-l-4 border-yellow-400";
      } else if (/note|tip|hint/i.test(text)) {
        color = "text-blue-700";
        icon = <Info className="inline mr-2 text-blue-500" size={20} />;
        bgColor = "bg-blue-50";
        borderColor = "border-l-4 border-blue-400";
      } else if (/warning|caution|important/i.test(text)) {
        color = "text-red-700";
        icon = <AlertTriangle className="inline mr-2 text-red-500" size={20} />;
        bgColor = "bg-red-50";
        borderColor = "border-l-4 border-red-400";
      } else if (/best practice|recommendation|guideline/i.test(text)) {
        color = "text-green-700";
        icon = <Star className="inline mr-2 text-green-500" size={20} />;
        bgColor = "bg-green-50";
        borderColor = "border-l-4 border-green-400";
      } else if (/exercise|practice|activity/i.test(text)) {
        color = "text-indigo-700";
        icon = <Book className="inline mr-2 text-indigo-500" size={20} />;
        bgColor = "bg-indigo-50";
        borderColor = "border-l-4 border-indigo-400";
      } else {
        // Default styling for h3
        color = "text-gray-700";
        icon = <Book className="inline mr-2 text-gray-500" size={20} />;
        bgColor = "bg-gray-50";
        borderColor = "border-l-4 border-gray-400";
      }
      padding = "p-3";
      borderRadius = "rounded-md";
    } else if (validLevel === 4) {
      // Sub-subsection titles
      color = "text-gray-600";
      icon = <Book className="inline mr-2 text-gray-500" size={18} />;
      bgColor = "bg-gray-50";
      padding = "p-2";
      borderRadius = "rounded";
      borderColor = "border-l-2 border-gray-300";
    } else {
      // Default for other levels
      color = "text-gray-600";
      icon = <Book className="inline mr-2 text-gray-500" size={16} />;
    }
    
    return React.createElement(
      `h${validLevel}`,
      { 
        className: `font-bold mb-4 mt-6 ${color} ${bgColor} ${padding} ${borderRadius} ${borderColor} shadow-sm` 
      },
      <>{icon}{children}</>
    );
  };

  // Enhanced callout block for different content types
  const ParagraphRenderer = ({ children }) => {
    const text = children[0];
    if (typeof text === "string") {
      // Introduction/Overview callouts
      if (text.startsWith("Introduction:") || text.startsWith("Overview:")) {
        return (
          <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6 shadow-sm">
            <Info className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-blue-800 font-semibold block mb-1">Introduction</span>
              <span className="text-blue-900">{text.replace(/^(Introduction:|Overview:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
      // Key Points callouts
      if (text.startsWith("Key Point:") || text.startsWith("Important:")) {
        return (
          <div className="flex items-start bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg mb-6 shadow-sm">
            <Star className="text-purple-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-purple-800 font-semibold block mb-1">Key Point</span>
              <span className="text-purple-900">{text.replace(/^(Key Point:|Important:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
      // Example callouts
      if (text.startsWith("Example:") || text.startsWith("Demo:")) {
        return (
          <div className="flex items-start bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6 shadow-sm">
            <Lightbulb className="text-yellow-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-yellow-800 font-semibold block mb-1">Example</span>
              <span className="text-yellow-900">{text.replace(/^(Example:|Demo:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
      // Note callouts
      if (text.startsWith("Note:")) {
        return (
          <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6 shadow-sm">
            <Info className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-blue-800 font-semibold block mb-1">Note</span>
              <span className="text-blue-900">{text.replace("Note:", "").trim()}</span>
            </div>
          </div>
        );
      }
      // Warning callouts
      if (text.startsWith("Warning:") || text.startsWith("Caution:")) {
        return (
          <div className="flex items-start bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6 shadow-sm">
            <AlertTriangle className="text-red-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-red-800 font-semibold block mb-1">Warning</span>
              <span className="text-red-900">{text.replace(/^(Warning:|Caution:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
      // Tip callouts
      if (text.startsWith("Tip:") || text.startsWith("Hint:")) {
        return (
          <div className="flex items-start bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6 shadow-sm">
            <Lightbulb className="text-green-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-green-800 font-semibold block mb-1">Tip</span>
              <span className="text-green-900">{text.replace(/^(Tip:|Hint:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
      // Best Practice callouts
      if (text.startsWith("Best Practice:") || text.startsWith("Recommendation:")) {
        return (
          <div className="flex items-start bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6 shadow-sm">
            <Star className="text-green-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-green-800 font-semibold block mb-1">Best Practice</span>
              <span className="text-green-900">{text.replace(/^(Best Practice:|Recommendation:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
      // Exercise/Practice callouts
      if (text.startsWith("Exercise:") || text.startsWith("Practice:") || text.startsWith("Activity:")) {
        return (
          <div className="flex items-start bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg mb-6 shadow-sm">
            <Book className="text-indigo-500 mr-3 mt-1" size={20} />
            <div>
              <span className="text-indigo-800 font-semibold block mb-1">Exercise</span>
              <span className="text-indigo-900">{text.replace(/^(Exercise:|Practice:|Activity:)/, "").trim()}</span>
            </div>
          </div>
        );
      }
    }
    return <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>;
  };

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
          <h2 className="text-2xl font-bold text-primary mb-2">{currentContent.course_subtitle}</h2>
          <hr className="my-4 border-orange-300" />
          {/* Enhanced Markdown Content */}
          <div className="prose prose-lg max-w-none mb-8 prose-headings:text-primary prose-h2:mb-2 prose-h3:mb-2 prose-h4:mb-2 prose-p:mb-4 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-orange-300 prose-blockquote:bg-orange-50 prose-blockquote:p-4 prose-blockquote:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto">
            <ReactMarkdown
              components={{
                h2: HeadingRenderer,
                h3: HeadingRenderer,
                p: ParagraphRenderer,
              }}
            >
              {preprocessMarkdown(currentContent.subtitle_content)}
            </ReactMarkdown>
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

