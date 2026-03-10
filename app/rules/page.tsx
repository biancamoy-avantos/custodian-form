"use client";

import { Badge } from "@/components/ui/badge";
import { Braces, Construction } from "lucide-react";

const FEATURE_ENABLED = true;

export default function RulesManagementPage() {
  if (!FEATURE_ENABLED) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Construction className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            This feature is not available in your environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="shrink-0">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-2.5">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-semibold tracking-tight">
              Rules Management
            </h3>
            <Badge variant="outline" className="text-sm">
              Internal
            </Badge>
          </div>
          <p className="text-base text-muted-foreground mt-2">
            Configure dynamic task node rules that determine which forms to render based on account configuration.
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 pt-10 flex flex-col">
        <div className="flex-1 flex items-center justify-center border border-dashed rounded-xl bg-muted/20">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto">
              <Braces className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Rules Engine</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This page will house the dynamic rule evaluation engine for task nodes.
                Unlike manually picking a specific form, dynamic task nodes will evaluate
                rules against the configuration task to auto-select the correct form.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending database schema
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending API routes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending design
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
