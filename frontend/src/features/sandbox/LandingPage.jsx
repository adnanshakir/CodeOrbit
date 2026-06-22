import { Box, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSandbox } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { createSandbox, isCreating, createError, startupStage, startupStages } =
    useSandbox();

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <Card className="w-full max-w-sm border-border bg-card shadow-2xl">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
              <Box className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              Sandbox Builder
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Start building
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            Spin up an isolated environment and use AI to generate UI components
            in real time.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Idle: feature list */}
          {!isCreating && !createError && startupStage === 0 && (
            <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>Isolated React environment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>AI-powered code generation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>Live preview &amp; terminal access</span>
              </div>
            </div>
          )}

          {/* Creating: staged progress */}
          {isCreating && (
            <div className="space-y-1.5 rounded-md border border-border bg-muted/30 p-3">
              {startupStages.slice(0, -1).map((stage, i) => {
                const isDone = startupStage > i;
                const isCurrent = startupStage === i;
                return (
                  <div
                    key={stage}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors",
                      isDone && "text-green-400",
                      isCurrent && "text-foreground",
                      !isDone && !isCurrent && "text-muted-foreground/40"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                    ) : (
                      <span className="h-3 w-3 shrink-0" />
                    )}
                    <span>{stage}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {createError && (
            <div className="flex w-full items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{createError}</span>
            </div>
          )}
          <Button
            className="w-full"
            onClick={createSandbox}
            disabled={isCreating}
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {startupStages[startupStage] || "Starting…"}
              </>
            ) : createError ? (
              "Retry"
            ) : (
              "Start Sandbox"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
