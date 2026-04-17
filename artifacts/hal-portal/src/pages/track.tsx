import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useGetVisitorRequest } from "@workspace/api-client-react";
import { getGetVisitorRequestQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const STATUS_FLOW = [
  "submitted",
  "under_verification",
  "pending_department",
  "pending_senior",
  "pending_gm",
  "approved"
];

const STATUS_LABELS: Record<string, string> = {
  submitted: "Request Submitted",
  under_verification: "Under Verification",
  pending_department: "Pending Dept Manager",
  pending_senior: "Pending Senior Officer",
  pending_gm: "Pending General Manager",
  approved: "Approved",
  rejected: "Rejected"
};

export default function Track() {
  const [searchInput, setSearchInput] = useState("");
  const [requestId, setRequestId] = useState("");

  const { data: request, isLoading, error } = useGetVisitorRequest(requestId, {
    query: {
      enabled: !!requestId,
      queryKey: getGetVisitorRequestQueryKey(requestId),
      retry: false
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setRequestId(searchInput.trim());
    }
  };

  const getStatusIndex = (status: string) => {
    if (status === "rejected") return -1;
    return STATUS_FLOW.indexOf(status);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2">Track Request Status</h1>
          <p className="text-muted-foreground">Enter your request ID (e.g., HAL-2026-XXXX) to check the current clearance status.</p>
        </div>

        <Card className="mb-12 border-primary/20 shadow-md">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Request ID..."
                  className="pl-10 h-12 text-lg uppercase"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-12 px-8 text-lg">
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching secure database...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg flex items-center gap-4">
            <AlertCircle className="h-8 w-8" />
            <div>
              <h3 className="font-bold text-lg">Request Not Found</h3>
              <p>No active record found for ID: {requestId}. Please verify the ID and try again.</p>
            </div>
          </div>
        )}

        {request && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Visitor Details</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{request.requestId}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="col-span-2 font-medium">{request.fullName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="col-span-2">{request.companyName || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Purpose:</span>
                    <span className="col-span-2">{request.purposeOfVisit}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Visit Date:</span>
                    <span className="col-span-2">{format(new Date(request.visitDate), "PPP")} at {request.visitTime}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Devices:</span>
                    <span className="col-span-2">{request.carryingDevices ? `${request.devices?.length || 0} items registered` : 'None'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg">Current Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col items-center justify-center h-[calc(100%-60px)]">
                  {request.status === 'rejected' ? (
                    <div className="text-center text-destructive">
                      <XCircle className="w-16 h-16 mx-auto mb-2" />
                      <h3 className="font-bold text-xl uppercase tracking-wider">Rejected</h3>
                      <p className="mt-2 text-sm max-w-[250px] mx-auto border-t border-destructive/20 pt-2">
                        Reason: {request.rejectionReason || 'Security clearance denied'}
                      </p>
                    </div>
                  ) : request.status === 'approved' ? (
                    <div className="text-center text-green-600">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-2" />
                      <h3 className="font-bold text-xl uppercase tracking-wider">Approved</h3>
                      <p className="mt-2 text-sm max-w-[250px] mx-auto border-t border-green-600/20 pt-2 text-foreground">
                        Clearance granted for specified date and duration.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-primary">
                      <Clock className="w-16 h-16 mx-auto mb-2" />
                      <h3 className="font-bold text-xl uppercase tracking-wider">In Progress</h3>
                      <p className="mt-2 text-sm font-medium border-t border-primary/20 pt-2 text-foreground">
                        {STATUS_LABELS[request.status]}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Clearance Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
                  {STATUS_FLOW.map((status, index) => {
                    const currentIndex = getStatusIndex(request.status);
                    const isRejected = request.status === 'rejected';
                    
                    let state: 'completed' | 'current' | 'upcoming' | 'rejected' = 'upcoming';
                    
                    if (isRejected) {
                      // Find where it was rejected from history
                      const rejectedHistory = request.statusHistory?.find(h => h.status === 'rejected');
                      // We approximate rejection point for UI simplicity
                      if (index < 2) state = 'completed';
                      else if (index === 2) state = 'rejected';
                      else state = 'upcoming';
                    } else {
                      if (index < currentIndex) state = 'completed';
                      else if (index === currentIndex) state = 'current';
                      else state = 'upcoming';
                    }

                    return (
                      <div key={status} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        {/* Marker */}
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-[-28px] md:left-1/2 md:-translate-x-1/2
                          ${state === 'completed' ? 'bg-primary border-primary text-primary-foreground' : 
                            state === 'current' ? 'bg-background border-primary text-primary ring-4 ring-primary/20' : 
                            state === 'rejected' ? 'bg-destructive border-destructive text-destructive-foreground' :
                            'bg-background border-muted text-muted-foreground'}`}
                        >
                          {state === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                          {state === 'current' && <div className="w-2 h-2 rounded-full bg-primary" />}
                          {state === 'rejected' && <XCircle className="w-4 h-4" />}
                        </div>
                        
                        {/* Content */}
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] bg-card border rounded-lg p-4 shadow-sm">
                          <h4 className={`font-semibold ${state === 'current' ? 'text-primary' : state === 'rejected' ? 'text-destructive' : 'text-foreground'}`}>
                            {STATUS_LABELS[status]}
                          </h4>
                          {state === 'completed' && <p className="text-xs text-muted-foreground mt-1">Cleared</p>}
                          {state === 'current' && <p className="text-xs text-primary mt-1">Awaiting Review</p>}
                          {state === 'rejected' && <p className="text-xs text-destructive mt-1">Failed Clearance</p>}
                          {state === 'upcoming' && <p className="text-xs text-muted-foreground/50 mt-1">Pending Pre-requisites</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
