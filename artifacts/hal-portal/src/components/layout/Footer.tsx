export function Footer() {
  return (
    <footer className="border-t bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col max-w-2xl">
            <span className="font-bold text-lg text-primary tracking-tight">HAL Security Portal</span>
            <span className="text-sm text-muted-foreground mt-1">Visitor & Device Access Management System</span>
          </div>
          <div className="text-xs text-muted-foreground max-w-xl md:text-right">
            <p className="font-semibold mb-1 uppercase tracking-wider text-primary/70">Disclaimer</p>
            <p>
              This is an independent demo prototype created for learning and portfolio purposes. 
              This is NOT an official HAL internal system. Internal technologies, infrastructure, 
              and confidential code are not included. This demo uses a separate public tech stack 
              only to recreate the workflow concept.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Demo Portal. No rights reserved.</span>
          <span>Security Protocol Level: DEMO</span>
        </div>
      </div>
    </footer>
  );
}
