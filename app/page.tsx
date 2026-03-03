"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Globe } from "lucide-react";
import { CustodianFormsTab } from "@/components/custodian-forms-tab";
import { ClientFormsTab } from "@/components/client-forms-tab";
import { ManageEndpointsModal } from "@/components/manage-endpoints-modal";
import type { GlobalEndpoint } from "@/lib/types";
import { DEFAULT_GLOBAL_ENDPOINTS } from "@/lib/sample-data";

export default function FormsManagementPage() {
  const [globalEndpoints, setGlobalEndpoints] = useState<GlobalEndpoint[]>(DEFAULT_GLOBAL_ENDPOINTS);
  const [endpointsModalOpen, setEndpointsModalOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Page Header */}
      <header className="shrink-0">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold tracking-tight">
                Forms Management
              </h3>
              <Badge variant="outline" className="text-sm">
                Internal
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setEndpointsModalOpen(true)}
            >
              <Globe className="h-4 w-4" />
              Manage Endpoints
            </Button>
          </div>
          <p className="text-base text-muted-foreground mt-2">
            Manage custodian and client form rules for account opening and envelope generation.
          </p>
        </div>
      </header>

      <ManageEndpointsModal
        open={endpointsModalOpen}
        onOpenChange={setEndpointsModalOpen}
        endpoints={globalEndpoints}
        onEndpointsChange={setGlobalEndpoints}
      />

      {/* Main Content */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 pt-[28px] pb-3 flex flex-col">
        <Tabs defaultValue="custodian" className="flex flex-col flex-1 min-h-0 gap-[28px]">
          <TabsList className="h-9 shrink-0">
            <TabsTrigger value="custodian" className="gap-2">
              <Building2 className="h-4 w-4" />
              Custodian forms
            </TabsTrigger>
            <TabsTrigger value="client" className="gap-2">
              <Users className="h-4 w-4" />
              Client forms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="custodian" className="mt-0 flex-1 min-h-0 flex flex-col">
            <CustodianFormsTab globalEndpoints={globalEndpoints} />
          </TabsContent>

          <TabsContent value="client" className="mt-0 flex-1 min-h-0 flex flex-col">
            <ClientFormsTab globalEndpoints={globalEndpoints} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
