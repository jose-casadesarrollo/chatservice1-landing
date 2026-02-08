"use client";

import React from "react";
import {Button, Link} from "@heroui/react";
import {Icon} from "@iconify/react";
import {cn} from "@heroui/react";

import RowSteps from "./row-steps";
import MultistepNavigationButtons from "./multistep-navigation-buttons";
import SupportCard from "./support-card";
import VerticalSteps from "./vertical-steps";

export type MultiStepSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  currentPage: number;
  onBack: () => void;
  onNext: () => void;
  onChangePage: (page: number) => void;
};

const stepperClasses = cn(
  // light
  "[--step-color:hsl(var(--heroui-secondary-400))]",
  "[--active-color:hsl(var(--heroui-secondary-400))]",
  "[--inactive-border-color:hsl(var(--heroui-secondary-200))]",
  "[--inactive-bar-color:hsl(var(--heroui-secondary-200))]",
  "[--inactive-color:hsl(var(--heroui-secondary-300))]",
  // dark
  "dark:[--step-color:rgba(255,255,255,0.1)]",
  "dark:[--active-color:hsl(var(--heroui-foreground-600))]",
  "dark:[--active-border-color:rgba(255,255,255,0.5)]",
  "dark:[--inactive-border-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-bar-color:rgba(255,255,255,0.1)]",
  "dark:[--inactive-color:rgba(255,255,255,0.2)]",
);

const MultiStepSidebar = React.forwardRef<HTMLDivElement, MultiStepSidebarProps>(
  ({children, className, currentPage, onBack, onNext, onChangePage, ...props}, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-full w-full gap-x-2", className)}
        {...props}
      >
        {/* Sidebar - Light mode for readable text on gradient */}
        <div className="light hidden h-full w-[344px] shrink-0 lg:flex">
          <div className="rounded-large shadow-small flex h-full w-full flex-col items-start gap-y-8 bg-gradient-1 px-8 py-6">
            {currentPage === 0 ? (
              <Button
                as={Link}
                href="/"
                className="bg-default-50 text-small text-default-500 font-medium shadow-lg"
                radius="full"
                variant="flat"
              >
                <Icon icon="solar:arrow-left-outline" width={18} />
                Back
              </Button>
            ) : (
              <Button
                className="bg-default-50 text-small text-default-500 font-medium shadow-lg"
                radius="full"
                variant="flat"
                onPress={onBack}
              >
                <Icon icon="solar:arrow-left-outline" width={18} />
                Back
              </Button>
            )}
            <div>
              <div className="text-default-foreground text-xl leading-7 font-medium">
                Acme Mailroom
              </div>
              <div className="text-default-500 mt-1 text-base leading-6 font-medium">
                Get a unique, physical U.S address and virtual mailbox.
              </div>
            </div>
            {/* Desktop Steps */}
            <VerticalSteps
              className={stepperClasses}
              color="secondary"
              currentStep={currentPage}
              steps={[
                {
                  title: "Create an account",
                  description: "Setting up your foundation",
                },
                {
                  title: "Company Information",
                  description: "Tell us about your business",
                },
                {
                  title: "Choose Address",
                  description: "Select your official location",
                },
                {
                  title: "Payment",
                  description: "Finalize your registration",
                },
              ]}
              onStepChange={onChangePage}
            />
            <SupportCard className="w-full backdrop-blur-lg bg-white/40 shadow-none" />
          </div>
        </div>
        {/* Form content - Dark mode for dark background */}
        <div className="dark flex h-full w-full flex-col items-center gap-4 md:p-4">
          {/* Mobile stepper - Light mode */}
          <div className="light sticky top-0 z-10 w-full md:max-w-xl lg:hidden">
            <div className="rounded-large shadow-small w-full bg-gradient-1 py-4">
              <div className="flex justify-center">
                {/* Mobile Steps */}
                <RowSteps
                  className={cn("pl-6", stepperClasses)}
                  currentStep={currentPage}
                  steps={[
                    {
                      title: "Account",
                    },
                    {
                      title: "Information",
                    },
                    {
                      title: "Address",
                    },
                    {
                      title: "Payment",
                    },
                  ]}
                  onStepChange={onChangePage}
                />
              </div>
            </div>
          </div>
          <div className="h-full w-full p-4 sm:max-w-md md:max-w-lg">
            {children}
            <MultistepNavigationButtons
              className="lg:hidden"
              isFirstStep={currentPage === 0}
              nextButtonProps={{
                children:
                  currentPage === 0
                    ? "Sign Up for Free"
                    : currentPage === 3
                      ? "Go to Payment"
                      : "Continue",
              }}
              onBack={onBack}
              onNext={onNext}
            />
            <SupportCard className="mx-auto w-full max-w-[252px] lg:hidden" />
          </div>
        </div>
      </div>
    );
  },
);

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;
