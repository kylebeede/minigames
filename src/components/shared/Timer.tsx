import { useState, useEffect, useRef } from "react";
import { Progress } from "antd";

interface TimerProps {
  duration: number;
  onTimerEnd: () => void;
  isCompleted?: boolean;
}
const Timer = ({ duration, onTimerEnd, isCompleted }: TimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number>();

  useEffect(() => {
    const handleTimer = () => {
      if (isCompleted) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      setElapsed((prevElapsed) => {
        const newElapsed = prevElapsed + 0.1;
        if (newElapsed >= duration) {
          clearInterval(timerRef.current);
          if (timerRef.current) onTimerEnd();
          timerRef.current = undefined;
          return duration;
        }
        return newElapsed;
      });
    };

    timerRef.current = setInterval(handleTimer, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duration, isCompleted, onTimerEnd]);

  const percentRemaining = 100 - (elapsed / duration) * 100;
  return (
    <Progress percent={percentRemaining} showInfo={false} status={"normal"} />
  );
};

export default Timer;
