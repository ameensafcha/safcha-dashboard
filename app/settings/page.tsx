import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/app/actions/profile";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        redirect("/login");
    }

    const profileResult = await getProfile();
    const user = profileResult.success ? profileResult.user : null;

    return <SettingsClient user={user} />;
}
