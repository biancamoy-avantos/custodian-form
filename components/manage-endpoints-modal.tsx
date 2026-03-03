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
import { Globe, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
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

  const totalPages = Math.ceil(endpoints.length / PAGE_SIZE);
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
    const newTotalPages = Math.ceil(updated.length / PAGE_SIZE);
    if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
  };

  const canSave = !!label && !!serviceId && !!endpointId;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Manage Endpoints
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure globally available endpoints that can be assigned to individual form rules.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto">
          {endpoints.length === 0 && !adding ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No endpoints configured</p>
              <p className="text-xs text-muted-foreground mb-4">Add your first endpoint to get started.</p>
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add endpoint
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Label</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="w-[80px]">Type</TableHead>
                      <TableHead className="w-[70px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEndpoints.map((ep) => (
                      <TableRow key={ep.id}>
                        <TableCell className="font-medium">{ep.label}</TableCell>
                        <TableCell className="text-muted-foreground">{ep.serviceName}</TableCell>
                        <TableCell className="align-middle">
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, endpoints.length)} of {endpoints.length}
                  </p>
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
                </div>
              )}

              {!adding && (
                <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add endpoint
                </Button>
              )}
            </div>
          )}

          {adding && (
            <div className="border rounded-lg p-4 mt-4 space-y-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{editingId ? "Edit" : "Add"} endpoint</p>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Quik PDF"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Usage type</Label>
                  <Select value={usage} onValueChange={(v) => setUsage(v as EndpointUsage)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Service</Label>
                  <Select value={serviceId} onValueChange={(v) => { setServiceId(v); setEndpointId(""); }}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select service..." /></SelectTrigger>
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
                    <SelectTrigger className="h-9"><SelectValue placeholder={serviceId ? "Select endpoint..." : "Select a service first"} /></SelectTrigger>
                    <SelectContent>
                      {selectedService?.endpoints.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          <div>
                            <span>{e.name}</span>
                            {e.url && <span className="text-[10px] text-muted-foreground ml-2 font-mono">{e.url}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={!canSave}>
                  {editingId ? "Save changes" : "Add"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
