import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateVisitorRequest } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, Plus, Trash2, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const deviceSchema = z.object({
  deviceType: z.enum(["Phone", "Laptop", "Camera", "Tablet", "Pendrive", "Other"]),
  brand: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  serialNumber: z.string().min(1, "Required"),
  ownershipProofNumber: z.string().optional(),
  reason: z.string().min(1, "Required")
});

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  mobileNumber: z.string().min(10, "Valid mobile number required"),
  email: z.string().email("Valid email required"),
  address: z.string().optional(),
  nationality: z.string().optional(),
  idProofType: z.string().optional(),
  idProofNumber: z.string().optional(),
  
  companyName: z.string().optional(),
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  
  purposeOfVisit: z.string().min(1, "Purpose of visit is required"),
  department: z.string().min(1, "Department is required"),
  division: z.string().optional(),
  building: z.string().optional(),
  visitDate: z.string().min(1, "Visit date is required"),
  visitTime: z.string().min(1, "Visit time is required"),
  expectedDuration: z.string().optional(),
  personToMeet: z.string().min(1, "Person to meet is required"),
  
  carryingDevices: z.boolean().default(false),
  devices: z.array(deviceSchema).optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateVisitorRequest();
  
  const [successData, setSuccessData] = useState<{ requestId: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carryingDevices: false,
      devices: []
    }
  });

  const { fields: deviceFields, append: appendDevice, remove: removeDevice } = useFieldArray({
    control: form.control,
    name: "devices"
  });

  const carryingDevices = form.watch("carryingDevices");

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(
      { data: data as any },
      {
        onSuccess: (res) => {
          setSuccessData({ requestId: res.requestId });
        },
        onError: (err) => {
          toast({ title: "Registration Failed", description: err.message || "An error occurred", variant: "destructive" });
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Request ID copied to clipboard" });
  };

  if (successData) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 py-12">
          <Card className="max-w-lg w-full border-t-4 border-t-green-600 shadow-xl text-center">
            <CardHeader className="pt-8 pb-2">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registration Successful</CardTitle>
              <CardDescription>Your visitor request has been submitted for security clearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="bg-muted p-6 rounded-lg border border-border mt-4">
                <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wider">Your Request ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-bold text-primary tracking-tight">{successData.requestId}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(successData.requestId)} className="text-muted-foreground hover:text-primary">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Please save this ID. You will need it to track your request status and for entry at the security gate.</p>
              </div>
              
              <div className="pt-4 flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setLocation("/track")}>Track Status</Button>
                <Button onClick={() => setLocation("/")}>Return Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-primary text-primary-foreground py-10 border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight">Visitor Entry Registration</h1>
          </div>
          <p className="text-primary-foreground/70">Complete all required sections accurately for security clearance processing.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Section A: Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="As per ID proof" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl><Input placeholder="+91..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl><Input type="email" placeholder="official email preferred" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl><Input placeholder="e.g. Indian" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="md:col-span-2">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residential Address</FormLabel>
                      <FormControl><Textarea placeholder="Full address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="idProofType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Proof Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="PAN">PAN</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="idProofNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Proof Number</FormLabel>
                    <FormControl><Input placeholder="ID number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Section B: Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Company / Organization Name</FormLabel>
                    <FormControl><Input placeholder="Representing organization" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="employeeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="designation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl><Input placeholder="Job title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Section C: Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="purposeOfVisit" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Purpose of Visit *</FormLabel>
                    <FormControl><Input placeholder="Brief reason for entry" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="personToMeet" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person to Meet *</FormLabel>
                    <FormControl><Input placeholder="Host name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host Department *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="R&D">R&D</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="division" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="building" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building / Block</FormLabel>
                    <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="visitDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Visit *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="visitTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="expectedDuration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl><Input placeholder="e.g. 2 hours" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Section D: Electronic Devices</span>
                  <FormField control={form.control} name="carryingDevices" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 bg-background px-4 py-2 rounded-md border">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer m-0">Carrying devices?</FormLabel>
                    </FormItem>
                  )} />
                </CardTitle>
              </CardHeader>
              {carryingDevices && (
                <CardContent className="pt-6 space-y-6">
                  {deviceFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-muted/20 relative group">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeDevice(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name={`devices.${index}.deviceType`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Phone">Phone</SelectItem>
                                <SelectItem value="Laptop">Laptop</SelectItem>
                                <SelectItem value="Tablet">Tablet</SelectItem>
                                <SelectItem value="Camera">Camera</SelectItem>
                                <SelectItem value="Pendrive">Pendrive</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`devices.${index}.brand`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Brand</FormLabel>
                            <FormControl><Input placeholder="e.g. Apple" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`devices.${index}.model`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Model</FormLabel>
                            <FormControl><Input placeholder="e.g. iPhone 13" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`devices.${index}.serialNumber`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Serial/IMEI</FormLabel>
                            <FormControl><Input placeholder="Serial number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`devices.${index}.ownershipProofNumber`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Gate Pass Ref (Opt)</FormLabel>
                            <FormControl><Input placeholder="Returnable gate pass" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`devices.${index}.reason`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Reason</FormLabel>
                            <FormControl><Input placeholder="Why is it needed?" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-dashed" 
                    onClick={() => appendDevice({ deviceType: "Phone", brand: "", model: "", serialNumber: "", reason: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Device Entry
                  </Button>
                </CardContent>
              )}
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Section E: Document Uploads</CardTitle>
                <CardDescription>Attach required scans (UI only demo)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>ID Proof Scan</Label>
                  <Input type="file" className="file:bg-muted file:text-foreground file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-muted/80 cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <Label>Official Letter</Label>
                  <Input type="file" className="file:bg-muted file:text-foreground file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-muted/80 cursor-pointer" />
                </div>
                {carryingDevices && (
                  <div className="space-y-2">
                    <Label>Device Gate Pass</Label>
                    <Input type="file" className="file:bg-muted file:text-foreground file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-muted/80 cursor-pointer" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="w-full md:w-auto px-12" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Submitting..." : "Submit Registration"}
                {!createMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
