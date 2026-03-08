"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function RotatingGradientRight() {
  return (
    <section className="dark w-full bg-black text-white rounded-2xl md:rounded-3xl px-8 py-24 md:px-16 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* LEFT: Text */}
        <div className="relative mx-auto flex h-[40rem] w-full max-w-[60rem] items-center justify-center overflow-hidden rounded-3xl">
          {/* Rotating conic gradient glow */}
          <div className="absolute -inset-10 flex items-center justify-center">
            <div
              className="
                h-[120%] w-[120%] rounded-[36px] blur-3xl opacity-70
                bg-[conic-gradient(from_0deg,#FF6B9D,#C084FC,#38BDF8,#34D399,#FACC15,#FF6B9D)]
                animate-[spin_20s_linear_infinite]
              "
            />
          </div>

          {/* Black card inside the glow */}
          <Card className="w-[340px] z-10 rounded-2xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Ruixen UI</span>
                <span className="text-xs text-zinc-400">99 / 99</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full
                                bg-[linear-gradient(90deg,#38BDF8,#C084FC,#FF6B9D)]" />
              </div>

              <p className="text-xs text-zinc-400">
                Building components… please keep the project open until the process is complete.
              </p>

              <Button
                variant="secondary"
                className="mt-4 w-full rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Rotating gradient with black card */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-3xl font-normal text-gray-900 dark:text-white leading-relaxed">
            Ruixen UI {" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-3xl">Build beautiful, modern interfaces with our comprehensive component library. No setup, no configuration needed.</span>
          </h2>
          <Button variant="link" className="px-0 text-black dark:text-white">
            Try Ruixen UI <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
