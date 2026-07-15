"use client";

import { useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { getCategoryById, getServiceBySlug, type CategoryId } from "@/data/booking";
import {
  INITIAL_STATE,
  bookingReducer,
  stepsForService,
  type BookingState,
} from "./booking-reducer";
import { StepIndicator } from "./step-indicator";
import { ServiceStep } from "./service-step";
import { LocationStep } from "./location-step";
import { AddOnsStep } from "./addons-step";
import { ScheduleStep } from "./schedule-step";
import { DetailsStep } from "./details-step";
import { ReviewStep } from "./review-step";
import { ConfirmationScreen } from "./confirmation-screen";
import { BookingSummary } from "./booking-summary";

/** Builds the initial state from ?service= / ?category= deep links.
 *  Invalid slugs fall back to the Step 1 welcome. */
export function initStateFromParams(
  serviceParam: string | null,
  categoryParam: string | null,
): BookingState {
  if (serviceParam) {
    const service = getServiceBySlug(serviceParam);
    if (service) {
      return bookingReducer(INITIAL_STATE, {
        type: "SELECT_SERVICE",
        slug: service.slug,
      });
    }
  }
  if (categoryParam) {
    const category = getCategoryById(categoryParam);
    if (category) {
      return { ...INITIAL_STATE, categoryId: category.id as CategoryId };
    }
  }
  return INITIAL_STATE;
}

export function BookingFlow() {
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(
    bookingReducer,
    INITIAL_STATE,
    () => initStateFromParams(searchParams.get("service"), searchParams.get("category")),
  );
  // Availability depends on the visitor's clock. The initializer returns null
  // during server rendering and a real date on the client; the schedule step
  // is never part of the initial server-rendered view, so markup cannot
  // disagree between server and client.
  const [now] = useState<Date | null>(() =>
    typeof window === "undefined" ? null : new Date(),
  );
  const reduceMotion = useReducedMotion();

  const steps = stepsForService(state.serviceSlug);
  const stepIndex = steps.indexOf(state.step);
  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const isConfirmed = state.step === "confirmed";

  const motionProps = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  if (isConfirmed) {
    return (
      <motion.div {...motionProps} transition={{ duration: 0.4 }}>
        <ConfirmationScreen state={state} />
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
      <div className="min-w-0 max-w-[720px] flex-1">
        <StepIndicator
          steps={steps}
          currentStep={state.step}
          onNavigate={(step) => dispatch({ type: "GO_TO_STEP", step })}
        />

        {prevStep && state.step !== "review" && (
          <button
            type="button"
            onClick={() => dispatch({ type: "GO_TO_STEP", step: prevStep })}
            className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm text-muted transition-colors duration-200 hover:text-ink"
          >
            <CaretLeft size={14} aria-hidden="true" />
            Back
          </button>
        )}

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div key={state.step} {...motionProps} transition={{ duration: 0.3 }}>
              {state.step === "service" && <ServiceStep state={state} dispatch={dispatch} />}
              {state.step === "location" && <LocationStep state={state} dispatch={dispatch} />}
              {state.step === "addons" && <AddOnsStep state={state} dispatch={dispatch} />}
              {state.step === "schedule" && (
                <ScheduleStep state={state} dispatch={dispatch} now={now} />
              )}
              {state.step === "details" && <DetailsStep state={state} dispatch={dispatch} />}
              {state.step === "review" && <ReviewStep state={state} dispatch={dispatch} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BookingSummary state={state} />
    </div>
  );
}
