import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminAccess } from "@/lib/auth";
import { getRoles } from "@/app/actions/roles";
import { RolesPageClient } from "./RolesPageClient";

export default async function RolesPage() {
    const currentUser = await getCurrentUser();

    if (!currentUser || !hasAdminAccess(currentUser)) {
        redirect("/");
    }

    const rolesResult = await getRoles();
    const roles = rolesResult.success ? rolesResult.roles : [];

    return <RolesPageClient roles={roles} currentUserId={currentUser.id} />;
}
