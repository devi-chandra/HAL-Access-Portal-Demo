import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuth } from "@/lib/auth";
import { 
  useGetAnalyticsSummary, 
  useListVisitorRequests, 
  useProcessVisitorRequest,
  useGetDepartmentStats
} from "@workspace/api-client-react";
import { getGetAnalyticsSummaryQueryKey, getListVisitorRequestsQueryKey, getGetDepartmentStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Users, UserCheck, UserX, Clock, Search, Filter, ShieldCheck, MoreHorizontal, Smartphone, ArrowRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_BADGES: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" | "active" }> = {
  submitted: { label: "Submitted", variant: "outline" },
  under_verification: { label: "Verifying", variant: "secondary" },
  pending_department: { label: "Pending Dept", variant: "secondary" },
  pending_senior: { label: "Pending Sr.", variant: "secondary" },
  pending_gm: { label: "Pending GM", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" }
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const auth = getAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean, id: string, reason: string }>({ open: false, id: "", reason: "" });

  useEffect(() => {
    if (!auth) {
      setLocation("/admin/login");
    }
  }, [auth, setLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: summary } = useGetAnalyticsSummary({
    query: {
      enabled: !!auth,
      queryKey: getGetAnalyticsSummaryQueryKey()
    }
  });

  const { data: deptStats } = useGetDepartmentStats({
    query: {
      enabled: !!auth,
      queryKey: getGetDepartmentStatsQueryKey()
    }
  });

  const listParams = {
    ...(statusFilter !== "all" && { status: statusFilter as any }),
    ...(departmentFilter !== "all" && { department: departmentFilter }),
    ...(debouncedSearch && { search: debouncedSearch }),
    limit: 50
  };

  const { data: requestsList, isLoading } = useListVisitorRequests(listParams, {
    query: {
      enabled: !!auth,
      queryKey: getListVisitorRequestsQueryKey(listParams)
    }
  });

  const processMutation = useProcessVisitorRequest();

  const handleAction = (requestId: string, action: "approve" | "forward" | "reject", comment?: string, rejectionReason?: string) => {
    if (!auth) return;
    
    processMutation.mutate(
      { requestId, data: { action, reviewerRole: auth.role, comment, rejectionReason } },
      {
        onSuccess: () => {
          toast({ title: "Success", description: `Request ${action}d successfully` });
          queryClient.invalidateQueries({ queryKey: getListVisitorRequestsQueryKey(listParams) });
          queryClient.invalidateQueries({ queryKey: getGetAnalyticsSummaryQueryKey() });
          setRejectDialog({ open: false, id: "", reason: "" });
        },
        onError: (err) => {
          toast({ title: "Action Failed", description: err.message || "An error occurred", variant: "destructive" });
        }
      }
    );
  };

  if (!auth) return null;

  return (
    <AppLayout>
      <div className="flex-1 bg-muted/20">
        <div className="bg-primary text-primary-foreground py-6 border-b border-primary-foreground/10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Security Command Center</h1>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Active User: <span className="font-mono text-accent">{auth.name}</span> | 
                  Clearance: <span className="uppercase text-xs font-bold tracking-wider ml-1 bg-primary-foreground/20 px-2 py-0.5 rounded">{auth.role.replace("_", " ")}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Active</p>
                      <h3 className="text-3xl font-bold">{summary.totalRequests}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Pending</p>
                      <h3 className="text-3xl font-bold">{summary.pendingRequests}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Cleared</p>
                      <h3 className="text-3xl font-bold">{summary.approvedRequests}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-destructive shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Rejected</p>
                      <h3 className="text-3xl font-bold">{summary.rejectedRequests}</h3>
                    </div>
                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
                      <UserX className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search ID, Name, or Company..." 
                    className="pl-9 w-full bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-background">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="pending_department">Pending Dept</SelectItem>
                      <SelectItem value="pending_senior">Pending Sr.</SelectItem>
                      <SelectItem value="pending_gm">Pending GM</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[160px] bg-background">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Depts</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="R&D">R&D</SelectItem>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="shadow-sm overflow-hidden border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px] font-semibold text-primary">Req ID</TableHead>
                        <TableHead className="font-semibold text-primary">Visitor Details</TableHead>
                        <TableHead className="font-semibold text-primary">Visit Info</TableHead>
                        <TableHead className="font-semibold text-primary">Status</TableHead>
                        <TableHead className="text-right font-semibold text-primary">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Loading records...</TableCell>
                        </TableRow>
                      ) : !requestsList?.requests?.length ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No records found matching criteria.</TableCell>
                        </TableRow>
                      ) : (
                        requestsList.requests.map((req) => (
                          <TableRow key={req.id} className="group hover:bg-muted/30">
                            <TableCell className="font-mono text-xs font-medium">{req.requestId}</TableCell>
                            <TableCell>
                              <div className="font-medium">{req.fullName}</div>
                              <div className="text-xs text-muted-foreground">{req.companyName || 'Individual'}</div>
                              {req.carryingDevices && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] bg-secondary/10 text-secondary-foreground px-1.5 py-0.5 rounded w-fit">
                                  <Smartphone className="w-3 h-3" />
                                  {req.devices?.length || 0} Devices
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{req.department}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(req.visitDate), "dd MMM")} @ {req.visitTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={STATUS_BADGES[req.status]?.variant as any || "default"} className="whitespace-nowrap font-medium uppercase text-[10px] tracking-wider">
                                {STATUS_BADGES[req.status]?.label || req.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Clearance Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {req.status !== 'approved' && req.status !== 'rejected' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleAction(req.requestId, "approve")} className="text-green-600 focus:text-green-600 font-medium">
                                        <ShieldCheck className="mr-2 h-4 w-4" /> Approve Clearance
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleAction(req.requestId, "forward")}>
                                        <ArrowRight className="mr-2 h-4 w-4" /> Forward to Next Lvl
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setRejectDialog({ open: true, id: req.requestId, reason: "" })} className="text-destructive focus:text-destructive font-medium">
                                        <UserX className="mr-2 h-4 w-4" /> Reject Request
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Department Load</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[250px] w-full">
                    {deptStats && deptStats.departments.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptStats.departments} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                          <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))'}} />
                          <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                          <Bar dataKey="approved" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 4, 4]} name="Approved" />
                          <Bar dataKey="pending" stackId="a" fill="hsl(var(--chart-2))" name="Pending" />
                          <Bar dataKey="rejected" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Rejected" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No department data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, id: "", reason: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <UserX className="w-5 h-5" /> Deny Clearance
            </DialogTitle>
            <DialogDescription>
              Provide an official reason for rejecting request {rejectDialog.id}. This will be logged in the permanent security audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="State reason for rejection..."
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: "", reason: "" })}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction(rejectDialog.id, "reject", undefined, rejectDialog.reason)} disabled={!rejectDialog.reason.trim() || processMutation.isPending}>
              {processMutation.isPending ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
// Note: ArrowRight import from lucide-react used but not declared. Let's fix that next.