"use client";

import type { InputProps } from "@heroui/react";

import React from "react";
import {
  Button,
  Input,
  Checkbox,
  Link,
  Divider,
  Form,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { login } = useAuth();
  const t = useTranslations("login");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const inputClasses: InputProps["classNames"] = {
    inputWrapper:
      "border-transparent bg-default-50/40 dark:bg-default-50/20 group-data-[focus=true]:border-primary data-[hover=true]:border-foreground/20",
  };

  const buttonClasses = "w-full bg-foreground/10 dark:bg-foreground/20";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      // Redirect happens in the login function
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-black p-4 md:px-10 md:py-[34px]">
      <main className="relative flex flex-1 items-center justify-center rounded-2xl bg-gradient-1 px-3 md:rounded-3xl md:px-0">
        {/* Back button */}
        <Button
          as={Link}
          href="/"
          className="absolute left-4 top-4 bg-background/60 text-foreground backdrop-blur-md md:left-6 md:top-6"
          radius="full"
          size="sm"
          startContent={
            <Icon
              className="pointer-events-none"
              icon="solar:arrow-left-linear"
              width={18}
            />
          }
          variant="flat"
        >
          {t("back")}
        </Button>

        <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-background/60 px-8 pb-10 pt-6 shadow-small backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50">
          <p className="pb-2 text-xl font-medium">{t("title")}</p>
          <Form
            className="flex flex-col gap-3"
            validationBehavior="native"
            onSubmit={handleSubmit}
          >
            <Input
              isRequired
              classNames={inputClasses}
              label={t("emailLabel")}
              name="email"
              placeholder={t("emailPlaceholder")}
              type="email"
              variant="bordered"
            />
            <Input
              isRequired
              classNames={inputClasses}
              endContent={
                <button type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Icon
                      className="pointer-events-none text-2xl text-foreground/50"
                      icon="solar:eye-closed-linear"
                    />
                  ) : (
                    <Icon
                      className="pointer-events-none text-2xl text-foreground/50"
                      icon="solar:eye-bold"
                    />
                  )}
                </button>
              }
              label={t("passwordLabel")}
              name="password"
              placeholder={t("passwordPlaceholder")}
              type={isVisible ? "text" : "password"}
              variant="bordered"
            />
            {error && (
              <div className="rounded-medium bg-danger-50 px-3 py-2 text-small text-danger">
                {error}
              </div>
            )}
            <div className="flex w-full items-center justify-between px-1 py-2">
              <Checkbox
                classNames={{
                  wrapper: "before:border-foreground/50",
                }}
                name="remember"
                size="sm"
              >
                {t("rememberMe")}
              </Checkbox>
              <Link className="text-foreground/50" href="#" size="sm">
                {t("forgotPassword")}
              </Link>
            </div>
            <Button
              className={buttonClasses}
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : t("loginButton")}
            </Button>
          </Form>
          <div className="flex items-center gap-4 py-2">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">{t("or")}</p>
            <Divider className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className={buttonClasses}
              startContent={<Icon icon="fe:google" width={24} />}
            >
              {t("continueWithGoogle")}
            </Button>
            <Button
              className={buttonClasses}
              startContent={<Icon icon="fe:github" width={24} />}
            >
              {t("continueWithGithub")}
            </Button>
          </div>
          <p className="text-center text-small text-foreground/50">
            {t("noAccount")}&nbsp;
            <Link color="foreground" href="/signup" size="sm">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
