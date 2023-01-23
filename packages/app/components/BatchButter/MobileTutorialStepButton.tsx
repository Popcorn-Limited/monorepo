import { Dispatch, SetStateAction } from "react";

interface MobileTutorialStepButtonProps {
  stepState: [number, Dispatch<SetStateAction<number>>];
  activeState: number;
}

export default function MobileTutorialStepButton({
  stepState,
  activeState,
}: MobileTutorialStepButtonProps): JSX.Element {
  const [step, setStep] = stepState;
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center ${step === activeState ? "bg-blue-100" : ""}`}
      onClick={() => setStep(activeState)}
    >
      <div className={`w-3 h-3 rounded-full ${step === activeState ? "bg-blue-900" : "bg-gray-200"}`}></div>
    </div>
  );
}
