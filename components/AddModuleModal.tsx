import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createModule } from "@/app/actions/module";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { IconPicker } from "@/components/IconPicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Folder, FileText } from "lucide-react";

interface AddModuleModalProps {
    existingModules?: any[];
    defaultParentId?: string | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddModuleModal({
    existingModules = [],
    defaultParentId = null,
    open,
    onOpenChange
}: AddModuleModalProps) {
    // ... (internal state if uncontrolled)
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const finalOpen = isControlled ? open : internalOpen;
    const finalSetOpen = isControlled ? onOpenChange : setInternalOpen;

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Form State
    const [icon, setIcon] = useState("FaFileAlt"); // Default icon
    const [type, setType] = useState("PAGE");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);

        // Ensure icon is in formData if not handled by hidden input (it is handled below)

        const result = await createModule(formData);

        setIsLoading(false);
        if (result.error) {
            let errorMessage = "Something went wrong";
            if (typeof result.error === "string") {
                errorMessage = result.error;
            } else if (typeof result.error === "object") {
                // Formatting Zod errors
                errorMessage = Object.values(result.error).flat().join(", ");
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Module created successfully",
            });
            if (finalSetOpen) finalSetOpen(false);
        }
    };

    return (
        <Dialog open={finalOpen} onOpenChange={finalSetOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>Add Module</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Module</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Hidden default fields */}
                    <input type="hidden" name="parentId" value={defaultParentId || "null"} />
                    <input type="hidden" name="icon" value={icon} />
                    <input type="hidden" name="type" value={type} />

                    {/* 1. Type Selection */}
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Module Type</Label>
                        <RadioGroup
                            defaultValue="PAGE"
                            className="grid grid-cols-2 gap-4"
                            onValueChange={setType}
                            value={type}
                        >
                            <div className="flex-1 flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:border-primary transition-all">
                                <RadioGroupItem value="PAGE" id="PAGE" />
                                <Label htmlFor="PAGE" className="flex items-center gap-2 cursor-pointer w-full">
                                    <FileText className="h-5 w-5 text-muted-foreground bg-primary/10 p-0.5 rounded-sm box-content" />
                                    <span>Page</span>
                                </Label>
                            </div>
                            <div className="flex-1 flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:border-primary transition-all">
                                <RadioGroupItem value="FOLDER" id="FOLDER" />
                                <Label htmlFor="FOLDER" className="flex items-center gap-2 cursor-pointer w-full">
                                    <Folder className="h-5 w-5 text-muted-foreground bg-primary/10 p-0.5 rounded-sm box-content" />
                                    <span>Folder</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* 2. Name Input */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Analytics" required />
                    </div>

                    {/* 3. Icon Selection */}
                    <div className="grid gap-2">
                        <Label>Icon</Label>
                        <div className="flex items-center gap-4">
                            <IconPicker
                                value={icon}
                                onChange={setIcon}
                                triggerClassName="w-auto min-w-[3rem] px-2 h-10 aspect-square justify-center"
                            />
                            <span className="text-sm text-muted-foreground">
                                {icon === "FaFileAlt" ? "Default Icon" : icon}
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground mt-2">
                        <p>Slug and Order will be auto-generated.</p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => finalSetOpen?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Module"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
