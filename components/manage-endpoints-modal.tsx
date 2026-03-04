"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, Plus, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { GlobalEndpoint, EndpointUsage } from "@/lib/types";
import { ENDPOINT_SERVICES } from "@/lib/sample-data";

const PAGE_SIZE = 6;

interface ManageEndpointsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoints: GlobalEndpoint[];
  onEndpointsChange: (endpoints: GlobalEndpoint[]) => void;
}

export function ManageEndpointsModal({
  open,
  onOpenChange,
  endpoints,
  onEndpointsChange,
}: ManageEndpointsModalProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [label, setLabel] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [endpointId, setEndpointId] = useState("");
  const [usage, setUsage] = useState<EndpointUsage>("action");

  const totalPages = Math.max(1, Math.ceil(endpoints.length / PAGE_SIZE));
  const paginatedEndpoints = endpoints.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedService = ENDPOINT_SERVICES.find((s) => s.id === serviceId);
  const selectedEndpoint = selectedService?.endpoints.find((e) => e.id === endpointId);

  const resetForm = () => {
    setLabel("");
    setServiceId("");
    setEndpointId("");
    setUsage("action");
    setAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!label || !serviceId || !endpointId || !selectedService || !selectedEndpoint) return;

    const entry: GlobalEndpoint = {
      id: editingId ?? `gep-${Date.now()}`,
      label,
      serviceId,
      serviceName: selectedService.name,
      endpointId,
      endpointName: selectedEndpoint.name,
      endpointUsage: usage,
      url: selectedEndpoint.url,
    };

    if (editingId) {
      onEndpointsChange(endpoints.map((ep) => (ep.id === editingId ? entry : ep)));
    } else {
      onEndpointsChange([...endpoints, entry]);
    }
    resetForm();
  };

  const handleEdit = (ep: GlobalEndpoint) => {
    setEditingId(ep.id);
    setLabel(ep.label);
    setServiceId(ep.serviceId);
    setEndpointId(ep.endpointId);
    setUsage(ep.endpointUsage);
    setAdding(true);
  };

  const handleDelete = (id: string) => {
    const updated = endpoints.filter((ep) => ep.id !== id);
    onEndpointsChange(updated);
    const newTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
  };

  const canSave = !!label && !!serviceId && !!endpointId;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className={`flex flex-col overflow-hidden p-0 transition-none ${adding ? "h-auto sm:max-w-lg" : "h-[540px] sm:max-w-4xl"}`}>
        {adding ? (
          /* ── Add / Edit endpoint view ── */
          <div className="flex flex-col">
            <div className="px-6 pt-6 pb-8 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 -ml-2 mb-7 text-muted-foreground"
                onClick={resetForm}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to endpoints
              </Button>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {editingId ? "Edit" : "Add"} endpoint
              </DialogTitle>
              <DialogDescription className="text-sm mt-1.5">
                {editingId
                  ? "Update the endpoint configuration below."
                  : "Configure a new endpoint to make it available for form rules."}
              </DialogDescription>
            </div>

            <div className="flex-1 px-6 pb-6 space-y-5">
              {/* Row 1: Label */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Quik PDF"
                  className="h-9 bg-[rgba(105,105,105,0.051)] border-none shadow-none"
                />
              </div>

              {/* Row 2: Usage type + Service + Endpoint */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Usage type</Label>
                  <Select value={usage} onValueChange={(v) => setUsage(v as EndpointUsage)}>
                    <SelectTrigger className="h-9 w-full bg-[rgba(105,105,105,0.051)] border-none shadow-none truncate"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Service</Label>
                  <Select value={serviceId} onValueChange={(v) => { setServiceId(v); setEndpointId(""); }}>
                    <SelectTrigger className="h-9 w-full bg-[rgba(105,105,105,0.051)] border-none shadow-none truncate"><SelectValue placeholder="Select service..." /></SelectTrigger>
                    <SelectContent>
                      {ENDPOINT_SERVICES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Endpoint</Label>
                  <Select value={endpointId} onValueChange={setEndpointId} disabled={!serviceId}>
                    <SelectTrigger className="h-9 w-full bg-[rgba(105,105,105,0.051)] border-none shadow-none truncate"><SelectValue placeholder={serviceId ? "Select endpoint..." : "Select a service first"} /></SelectTrigger>
                    <SelectContent>
                      {selectedService?.endpoints.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!canSave}>
                {editingId ? "Save changes" : "Add endpoint"}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Table list view ── */
          <div className="flex flex-col h-full">
            <div className="px-6 pt-[52px] pb-6 shrink-0 flex items-end justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Manage Endpoints
                </DialogTitle>
                <DialogDescription className="text-sm mt-1.5">
                  Configure globally available endpoints that can be assigned to individual form rules.
                </DialogDescription>
              </div>
              {endpoints.length > 0 && (
                <Button size="sm" className="shrink-0" onClick={() => setAdding(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add endpoint
                </Button>
              )}
            </div>

            {endpoints.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Globe className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No endpoints configured</p>
                <p className="text-xs text-muted-foreground mb-4">Add your first endpoint to get started.</p>
                <Button size="sm" onClick={() => setAdding(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add endpoint
                </Button>
              </div>
            ) : (
              <>

                {/* Table */}
                <div className="flex-1 min-h-0 px-6 overflow-hidden">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[140px]">Label</TableHead>
                          <TableHead className="w-[180px]">Service</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead className="w-[80px]">Type</TableHead>
                          <TableHead className="w-[70px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedEndpoints.map((ep) => (
                          <TableRow key={ep.id}>
                            <TableCell className="font-medium truncate max-w-[140px]">{ep.label}</TableCell>
                            <TableCell className="text-muted-foreground truncate max-w-[180px]">{ep.serviceName}</TableCell>
                            <TableCell className="align-middle truncate max-w-[250px]">
                              <span className="text-sm">{ep.endpointName}</span>
                              {ep.url && (
                                <span className="text-[10px] text-muted-foreground font-mono ml-2">{ep.url}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  ep.endpointUsage === "pdf"
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-amber-50 text-amber-600 border-amber-200"
                                }`}
                              >
                                {ep.endpointUsage === "pdf" ? "PDF" : "Action"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(ep)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ep.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Sticky pagination */}
                <div className="flex items-center justify-between px-6 py-3 shrink-0 mt-auto">
                  <p className="text-xs text-muted-foreground">
                    Showing {endpoints.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, endpoints.length)} of {endpoints.length}
                  </p>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="icon"
                          className="h-7 w-7 text-xs"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
