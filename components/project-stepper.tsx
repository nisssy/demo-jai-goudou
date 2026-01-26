import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectStepperProps {
  steps: { id: string; label: string }[]
  currentStep: string
  onStepClick: (stepId: string) => void
}

export function ProjectStepper({ steps, currentStep, onStepClick }: ProjectStepperProps) {
  return (
    <div className="w-full py-4 px-6 bg-card border-b border-border mb-6">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-0 transform -translate-y-1/2" />
        
        {steps.map((step, index) => {
          const isCompleted = steps.findIndex(s => s.id === currentStep) > index
          const isCurrent = step.id === currentStep
          
          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center bg-card px-2 cursor-pointer"
              onClick={() => onStepClick(step.id)}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                  isCurrent ? "bg-background border-primary text-primary" : 
                  "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "mt-2 text-sm font-medium transition-colors duration-200",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
