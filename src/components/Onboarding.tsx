import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import mascotWavingImg from '@/assets/mascote_acenando_habitup.png';
import mascotSunglassesImg from '@/assets/mascote_oculos_escuro_habitup.png';
import { motion } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      img: mascotWavingImg,
      title: 'Bem-vindo(a) ao HabitUp',
      subtitle: 'Seu gerenciador de hábitos diários',
      button: 'Próximo',
    },
    {
      img: mascotSunglassesImg,
      title: 'Aqui você pode organizar sua rotina de hábitos e evoluir de nível na vida e na diversão',
      subtitle: '',
      button: 'Começar',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step === 1) {
      localStorage.setItem('onboardingSeen', 'true');
      onComplete();
    } else {
      setStep(1);
    }
  };

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center p-8 text-center bg-background">
      <motion.img
        src={currentStep.img}
        alt="Mascote"
        className="w-32 h-32 sm:w-48 sm:h-48 object-contain mx-auto mb-8 drop-shadow-md"
        animate={{ 
          scale: [1, 1.02, 1],
          y: [0, -2, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' 
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 max-w-sm"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
          {currentStep.title}
        </h1>
        {currentStep.subtitle && (
          <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
            {currentStep.subtitle}
          </p>
        )}
      </motion.div>

      <motion.div 
        className="flex flex-col sm:flex-row gap-3 mt-12 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          variant="outline"
          className="h-12 rounded-xl text-base font-medium border-border hover:border-foreground/50 transition-all flex-1"
          onClick={onComplete}
          type="button"
        >
          Pular
        </Button>
        <Button 
          className="h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all flex-1"
          onClick={handleNext}
          type="button"
        >
          {currentStep.button}
        </Button>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-3 mt-8">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              step === i ? 'bg-primary w-3 h-3 shadow-sm' : 'bg-muted'
            }`}
            animate={{ scale: step === i ? 1.1 : 1 }}
            transition={{ type: 'spring' }}
          />
        ))}
      </div>
    </div>
  );
}

