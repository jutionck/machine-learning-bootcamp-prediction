"use client"

import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  steps: {
    title: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex w-full items-center justify-center space-x-4", className)}>
      {steps.map((step, index) => {
        const stepIndex = index + 1;
        const isCompleted = stepIndex < currentStep;
        const isCurrent = stepIndex === currentStep;

        return (
          <div key={index} className="flex items-center">
             <div className="flex flex-col items-center gap-2 relative">
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                        isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                >
                    {isCompleted ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <span className="text-sm font-medium">{stepIndex}</span>
                    )}
                </div>
                <div className="absolute top-12 w-32 text-center">
                    <p className={cn(
                        "text-sm font-semibold whitespace-nowrap",
                         isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>
                        {step.title}
                    </p>
                </div>
             </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-12 sm:w-24 mx-4",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  )
}
