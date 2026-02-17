
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Shield, Key, FileText, Activity } from "lucide-react";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { Role } = user;
    const permissions = Role?.RolePermission || [];
    const canReadCount = permissions.filter((p: any) => p.canRead).length;
    const canWriteCount = permissions.filter((p: any) => p.canCreate || p.canUpdate).length;

    const isAdmin = Role?.name === 'admin';

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back, <span className="font-semibold text-foreground">{user.name}</span>!
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-secondary/20 p-2 rounded-lg border border-secondary">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-medium text-sm text-primary capitalize">Role: {Role?.name}</span>
                    </div>
                </div>
            </div>

            {isAdmin ? (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-primary/10 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Modules
                                </CardTitle>
                                <FileText className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{canReadCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Accessible to you
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-primary/10 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Write Access
                                </CardTitle>
                                <Key className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">{canWriteCount}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Edit permissions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Your recent actions in the dashboard.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                                    <Activity className="mr-2 h-4 w-4" />
                                    No recent activity found.
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Your Permissions</CardTitle>
                                <CardDescription>
                                    Detailed view of your access rights.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {permissions.slice(0, 5).map((perm: any) => (
                                        <div key={perm.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{perm.Module.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {perm.canCreate ? "Create, " : ""}{perm.canRead ? "Read, " : ""}{perm.canUpdate ? "Update, " : ""}{perm.canDelete ? "Delete" : ""}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Active</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="grid gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Dashboard</CardTitle>
                            <CardDescription>
                                You have limited access to the system. Please use the sidebar to navigate to your allowed modules.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="h-4 w-4" />
                                <span>No metrics available for your role.</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
