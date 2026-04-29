import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  ListTodo,
  Sparkles,
  Timer,
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    eyebrow: 'Plan your study day',
    title: 'Everything you need to stay organized.',
    description:
      'EduNize brings your subjects, timetable, tasks, grades, and focus sessions into one calm workspace.',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    preview: 'Dashboard',
    highlights: ['Today view', 'Study streaks', 'Quick progress'],
  },
  {
    eyebrow: 'Focus with Pomodoro',
    title: 'Turn study time into focused sprints.',
    description:
      'Use Pomodoro sessions to protect deep work, track minutes, and build momentum one session at a time.',
    icon: Timer,
    color: 'from-rose-500 to-orange-400',
    preview: '25:00',
    highlights: ['Focus timer', 'Break rhythm', 'Session stats'],
  },
  {
    eyebrow: 'Meet EduAI',
    title: 'Get help when a topic feels stuck.',
    description:
      'Ask EduAI to explain concepts, simplify notes, brainstorm study plans, and keep past conversations handy.',
    icon: Bot,
    color: 'from-violet-500 to-blue-500',
    preview: 'Ask EduAI',
    highlights: ['Smart chat', 'Study prompts', 'Saved history'],
  },
  {
    eyebrow: 'Tasks, classes, grades',
    title: 'Keep every deadline and result in sight.',
    description:
      'Manage assignments, map your timetable, record marks, and understand how your performance is moving.',
    icon: ListTodo,
    color: 'from-emerald-500 to-teal-500',
    preview: '3 due',
    highlights: ['Task manager', 'Timetable', 'Grade tracker'],
  },
];

const featureCards = [
  { icon: ListTodo, label: 'Tasks', value: 'Prioritize work' },
  { icon: CalendarDays, label: 'Timetable', value: 'Plan classes' },
  { icon: BarChart3, label: 'Results', value: 'Track growth' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];
  const Icon = step.icon;
  const progress = useMemo(() => ((activeStep + 1) / steps.length) * 100, [activeStep]);

  const goNext = () => {
    if (activeStep === steps.length - 1) {
      onComplete();
      return;
    }

    setActiveStep((current) => current + 1);
  };

  const goBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  return (
    <div className="fixed inset-0 z-[10000] blue-background overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="floating-dot dot-white w-3 h-3 top-[8%] left-[7%] animate-float-slow" />
      <div className="floating-dot dot-outline w-5 h-5 top-[12%] right-[10%] animate-pulse-slow" />
      <div className="floating-dot dot-filled-light w-4 h-4 bottom-[12%] left-[12%] animate-float-medium" />
      <div className="floating-dot dot-white w-2 h-2 bottom-[18%] right-[7%] animate-float-slow" />

      <div className="mx-auto flex min-h-full w-full max-w-6xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="white-card grid w-full overflow-hidden rounded-2xl lg:grid-cols-[1.05fr_0.95fr]"
        >
          <section className="relative flex min-h-[420px] flex-col justify-between bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 sm:p-8 lg:p-10">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-600">EduNize</p>
                  <h1 className="text-xl font-bold text-gray-900">Your study command center</h1>
                </div>
              </div>

              <div className="mb-8 h-2 overflow-hidden rounded-full bg-blue-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.28 }}
                className="space-y-7"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  {step.eyebrow}
                </div>

                <div>
                  <h2 className="max-w-xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                    {step.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {step.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-teal-500" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-4">
              <div className="flex gap-2" aria-label="Onboarding progress">
                {steps.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeStep ? 'w-9 bg-blue-500' : 'w-2.5 bg-blue-200 hover:bg-blue-300'
                    }`}
                    aria-label={`Go to onboarding step ${index + 1}`}
                    aria-current={index === activeStep ? 'step' : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
              >
                Skip tour
              </button>
            </div>
          </section>

          <section className="flex flex-col justify-between gap-8 bg-white p-6 sm:p-8 lg:p-10">
            <div className="relative mx-auto w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.preview}
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -12 }}
                  transition={{ duration: 0.28 }}
                  className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-xl shadow-blue-100/70"
                >
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current tool</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">{step.preview}</p>
                    </div>
                    <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-600">
                      Step {activeStep + 1}/{steps.length}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {featureCards.map((feature, index) => {
                      const FeatureIcon = feature.icon;

                      return (
                        <motion.div
                          key={feature.label}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * index }}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                              <FeatureIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{feature.label}</p>
                              <p className="text-sm text-gray-500">{feature.value}</p>
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-teal-500" />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={activeStep === 0}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={goNext}
                className="blue-button teal-button inline-flex items-center justify-center gap-2 px-6 py-3"
              >
                {activeStep === steps.length - 1 ? 'Start learning' : 'Next feature'}
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};
