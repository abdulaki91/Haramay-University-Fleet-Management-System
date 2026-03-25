import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/api/services/notification.service";
import { useAuthStore } from "@/store/authStore";
import {
  Mail,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminNotificationTest() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [testEmail, setTestEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await notificationService.testEmailConfig(testEmail);
      toast({
        title: "Test Email Sent",
        description: `Check the inbox for ${testEmail}`,
      });
    } catch (error: any) {
      toast({
        title: "Email Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailStatus = async () => {
    setLoading(true);
    try {
      const status = await notificationService.getEmailStatus();
      setEmailStatus(status);
      toast({
        title: "Email Status Retrieved",
        description: `Configured: ${status.configured}, Connected: ${status.connected}`,
      });
    } catch (error: any) {
      toast({
        title: "Status Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestNotification = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await notificationService.createNotification({
        type: "system_alert",
        title: "Test Notification",
        message:
          "This is a test notification to verify both web and email notifications are working correctly.",
        priority: "medium",
        targetUsers: [Number(user.id)],
      });
      toast({
        title: "Test Notification Created",
        description: "Check both the notification bell and your email",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Create Test Notification",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerPeriodicChecks = async () => {
    setLoading(true);
    try {
      await notificationService.triggerPeriodicChecks();
      toast({
        title: "Periodic Checks Triggered",
        description:
          "System will check for maintenance due and low fuel alerts",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Trigger Checks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "system_admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                This page is only accessible to system administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Notification System Testing</h1>
          <p className="text-muted-foreground">
            Test and monitor the notification system functionality
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Testing
            </CardTitle>
            <CardDescription>
              Test email configuration and send test emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="Enter email to test"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTestEmail}
                disabled={loading}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckEmailStatus}
                disabled={loading}
              >
                Check Status
              </Button>
            </div>

            {emailStatus && (
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-semibold">Email Service Status</h4>
                <div className="flex items-center gap-2">
                  <span>Configured:</span>
                  {emailStatus.configured ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Connected:</span>
                  {emailStatus.connected ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Host: {emailStatus.host}</p>
                  <p>Port: {emailStatus.port}</p>
                  <p>User: {emailStatus.user}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Testing
            </CardTitle>
            <CardDescription>
              Create test notifications and trigger system checks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCreateTestNotification}
              disabled={loading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Create Test Notification
            </Button>

            <Button
              variant="outline"
              onClick={handleTriggerPeriodicChecks}
              disabled={loading}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Trigger Periodic Checks
            </Button>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Test Instructions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Test notification will appear in the notification bell
                </li>
                <li>• If email is configured, you'll also receive an email</li>
                <li>
                  • Periodic checks will scan for maintenance and fuel alerts
                </li>
                <li>• Check server logs for detailed error information</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Email Setup Instructions</CardTitle>
          <CardDescription>
            Quick guide to configure email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Gmail Configuration</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Update your <code>.env</code> file with Gmail SMTP settings:
              </p>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                EMAIL_HOST=smtp.gmail.com
                <br />
                EMAIL_PORT=587
                <br />
                EMAIL_SECURE=false
                <br />
                EMAIL_USER=your-email@gmail.com
                <br />
                EMAIL_PASS=your-app-password
                <br />
                EMAIL_FROM_NAME=Haramaya Fleet Management
                <br />
                EMAIL_FROM_ADDRESS=your-email@gmail.com
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Generate App Password</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enable 2-Factor Authentication on your Gmail account</li>
                <li>
                  • Go to Google Account Settings → Security → App passwords
                </li>
                <li>• Create password for "Mail" application</li>
                <li>• Use the 16-character password in EMAIL_PASS</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Test Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Use the "Check Status" button above to verify your email
                configuration, then send a test email to confirm everything is
                working.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
