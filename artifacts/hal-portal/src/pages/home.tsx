import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, UserPlus, Search, Shield, Fingerprint, Lock, Server } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544626154-1a3b37012bc0?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-medium mb-6">
              <ShieldAlert className="w-4 h-4 text-accent" />
              <span>Restricted Access Zone</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Visitor & Device<br/>Access Management
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl">
              Secure portal for managing facility entry authorizations, material carriage, and electronic device clearance protocols.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Entry Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-32 relative z-20">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-all border-t-4 border-t-accent hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Visitor Registration</CardTitle>
                  <CardDescription className="text-sm">Submit a new request for facility access and device clearance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/register" className="w-full">
                    <Button className="w-full group">
                      Start Registration
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="h-full hover:shadow-lg transition-all border-t-4 border-t-secondary hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">Track Request</CardTitle>
                  <CardDescription className="text-sm">Check the current approval status of an existing visitor request.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/track" className="w-full">
                    <Button variant="outline" className="w-full">
                      Check Status
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="h-full hover:shadow-lg transition-all border-t-4 border-t-primary hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Admin Portal</CardTitle>
                  <CardDescription className="text-sm">Authorized personnel access for request review and approval workflows.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/login" className="w-full">
                    <Button variant="secondary" className="w-full">
                      Authorized Login
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Security Workflow Highlights */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Multi-Tier Security Protocol</h2>
            <p className="text-muted-foreground">Our comprehensive vetting process ensures compliance with enterprise security standards for all visitors and electronic devices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Fingerprint className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
              <p className="text-sm text-muted-foreground">Rigorous cross-checking of government-issued credentials and professional affiliations.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Device Clearance</h3>
              <p className="text-sm text-muted-foreground">Detailed logging and authorization for all electronic devices, cameras, and storage media.</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Server className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hierarchical Approval</h3>
              <p className="text-sm text-muted-foreground">Mandatory departmental, senior officer, and general manager authorizations based on clearance level.</p>
            </div>
          </div>
        </div>
      </section>

    </AppLayout>
  );
}
