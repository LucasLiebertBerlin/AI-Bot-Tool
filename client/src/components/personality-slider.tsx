import { Slider } from "@/components/ui/slider";

interface PersonalitySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: string;
  max: string;
}

export default function PersonalitySlider({ label, value, onChange, min, max }: PersonalitySliderProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-3">{label}</label>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={10}
        min={1}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
