/* global requestAnimationFrame, cancelAnimationFrame */
import { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import PlayIcon from "@mui/icons-material/PlayCircle";
import PauseIcon from "@mui/icons-material/PauseCircle";

export default function RangeInput({
  min,
  max,
  value,
  animationSpeed,
  onChange,
  formatLabel,
}: {
  min: number;
  max: number;
  value: [start: number, end: number];
  animationSpeed: number;
  onChange: (value: [start: number, end: number]) => void;
  formatLabel: (value: number) => string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationId) cancelAnimationFrame(animationId);
      setAnimationId(null);
      return;
    }

    const animate = () => {
      setAnimationId(
        requestAnimationFrame(() => {
          setAnimationId(null);

          const span = value[1] - value[0];
          let nextValueMin = value[0] + animationSpeed;
          if (nextValueMin + span >= max) {
            nextValueMin = min;
          }

          onChange([nextValueMin, nextValueMin + span]);
        })
      );
    };

    const id = requestAnimationFrame(animate);
    setAnimationId(id);

    return () => cancelAnimationFrame(id);
    // animationId is not included on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, value, animationSpeed, min, max, onChange]);

  const isButtonEnabled = value[0] > min || value[1] < max;

  return (
    <>
      <Slider
        min={min}
        max={max}
        value={value}
        onChange={(_e, newValue: [start: number, end: number]) => {
          onChange(newValue);
        }}
        valueLabelDisplay="auto"
        valueLabelFormat={formatLabel}
      />
      <Button
        color="primary"
        disabled={!isButtonEnabled}
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? "Stop" : "Animate"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </>
  );
}
