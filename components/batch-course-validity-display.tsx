import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

interface CourseValidityDisplayProps {
  validity: number;
  updatedDate: string;
}

export function BatchCourseValidityDisplay({ validity, updatedDate }: CourseValidityDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (updatedDate && validity !== undefined) {
      const updateTimeLeft = () => {
        const parsedUpdatedDate = dayjs(updatedDate);
        const expiryDate = parsedUpdatedDate.add(validity, 'days');
        const now = dayjs();
        const remaining = expiryDate.diff(now);

        if (remaining <= 0) {
          setTimeLeft("Expired");
          setIsExpired(true);
        } else {
          setIsExpired(false);
          const dur = dayjs.duration(remaining);
          const days = Math.max(0, dur.days());
          const hours = Math.max(0, dur.hours() % 24);
          const minutes = Math.max(0, dur.minutes() % 60);
          const seconds = Math.max(0, dur.seconds() % 60);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      };

      // Update immediately and then every second
      updateTimeLeft();
      const timerId = setInterval(updateTimeLeft, 1000);

      return () => clearInterval(timerId);
    }
  }, [updatedDate, validity]);

  if (timeLeft === null) {
    return null; // Or a loading indicator
  }

  return (
    <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
      Validity: {timeLeft}
    </div>
  );
} 