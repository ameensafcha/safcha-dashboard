
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default async function AdminDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.Role?.name !== 'admin') {
        redirect("/dashboard");
    }

    return (
        <div className="p-8 space-y-8 bg-destructive/5 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Secure area for administrative tasks.
                    </p>
                </div>
                <a
                    href="/dashboard"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Exit Admin Mode
                </a>
            </div>

            <div className="grid gap-4">
                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="text-destructive">System Overview</CardTitle>
                        <CardDescription>
                            Waiting for sidebar configuration...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Use the sidebar to navigate admin modules (to be configured).
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
