import { FC, useState } from 'react'
import { Check, Smartphone, Sparkles } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui'
import { Preferences } from '@/containers/Dashboard/Preferences'
import { HikerProfileFields } from '@/containers/HikerProfileForm/HikerProfileFields'
import { OnboardingScaffold } from '@/containers/Onboarding/OnboardingScaffold'

type Feature = {
  label: string
  pro?: boolean
}

const FEATURES: Feature[] = [
  { label: 'Gear closet with weight tracking' },
  { label: 'Packing lists with full weight breakdowns' },
  { label: 'Gear research across thousands of products' },
  { label: 'Hiker profiles and shareable lists' },
  { label: 'Your first reusable gear kit' },
  { label: 'Unlimited packing lists & kits, plus calorie planning', pro: true },
]

export const Onboarding: FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const next = () => setStep(s => s + 1)
  const finish = () => navigate({ to: '/' })

  if (step === 0) {
    return (
      <OnboardingScaffold
        step={0}
        title="Create your hiker profile"
        description="This powers calorie estimates and personalized recommendations for your trips."
      >
        <HikerProfileFields
          isFirstProfile
          showUnitToggle
          hideDefaultToggle
          submitLabel="Continue"
          fullWidthSubmit
          onSuccess={next}
        />
      </OnboardingScaffold>
    )
  }

  if (step === 1) {
    return (
      <OnboardingScaffold
        step={1}
        title="Set your preferences"
        description="Choose the units and currency you'd like to use across Packstack."
      >
        <Preferences bare submitLabel="Continue" fullWidthSubmit onSaved={next} />
      </OnboardingScaffold>
    )
  }

  return (
    <OnboardingScaffold
      step={2}
      title="You're all set"
      description="Here's what you can do with Packstack:"
    >
      <div className="flex flex-col gap-3">
        {FEATURES.map(feature => (
          <div key={feature.label} className="flex items-center gap-3">
            <div className="shrink-0 rounded-full bg-primary/10 p-1.5">
              <Check size={14} className="text-primary" />
            </div>
            <span className="flex-1 text-sm text-foreground">
              {feature.label}
            </span>
            {feature.pro && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Pro
              </span>
            )}
          </div>
        ))}

        <Button className="mt-4 w-full gap-1.5" onClick={finish}>
          <Sparkles size={16} /> Get Started
        </Button>

        <p className="mt-1 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Smartphone size={13} />
          Packstack is also available on iOS and Android
        </p>
      </div>
    </OnboardingScaffold>
  )
}
