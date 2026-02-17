"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICON_MAP, iconNames } from "@/lib/icons";

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
    triggerClassName?: string;
}

export function IconPicker({ value, onChange, triggerClassName }: IconPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // Filter icons
    const filteredIcons = React.useMemo(() => {
        if (!search) return iconNames;
        return iconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    const SelectedIcon = ICON_MAP[value] || null;

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-start h-12 px-3", triggerClassName)}
                    >
                        {value && ICON_MAP[value] ? (
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-2 rounded-md text-primary">
                                    <SelectedIcon className="h-5 w-5" />
                                </div>
                            </div>
                        ) : value && !ICON_MAP[value] ? (
                            <div className="flex items-center gap-3">
                                <div className="text-xl">{value}</div>
                                <span className="font-medium">Custom: {value}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Search className="h-4 w-4" />
                                <span>Add Icon</span>
                            </div>
                        )}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0" align="start">
                    <div className="h-[400px]">
                        <Tabs defaultValue="icons" className="w-full h-full flex flex-col">
                            <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-11 bg-muted/30 p-1 shrink-0">
                                <TabsTrigger value="icons">Icons</TabsTrigger>
                                <TabsTrigger value="emoji">Emoji</TabsTrigger>
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                            </TabsList>

                            <TabsContent value="icons" className="mt-0 flex-1 flex flex-col min-h-0">
                                <div className="p-2 border-b shrink-0">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search icons..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9 h-9 border-none bg-muted/30 focus-visible:ring-0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 gap-2 p-2 overflow-y-auto flex-1 content-start">
                                    {filteredIcons.map((iconName) => {
                                        const Icon = ICON_MAP[iconName];
                                        const isSelected = value === iconName;
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => {
                                                    onChange(iconName);
                                                    setOpen(false);
                                                }}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors aspect-square",
                                                    isSelected && "bg-primary/20 text-primary border border-primary/30"
                                                )}
                                                title={iconName}
                                            >
                                                <Icon className="h-5 w-5 mb-1" />
                                            </button>
                                        );
                                    })}
                                    {filteredIcons.length === 0 && (
                                        <div className="col-span-6 text-center py-8 text-sm text-muted-foreground">
                                            No icons found.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="emoji" className="mt-0 p-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Custom Emoji</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Enter any emoji or text character.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={!ICON_MAP[value] ? value : ""}
                                            onChange={(e) => onChange(e.target.value)}
                                            className="text-lg"
                                            placeholder="e.g. 🚀, 🏠, A"
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Tip: Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Win + .</kbd> to open emoji picker.
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="upload" className="mt-0 p-8">
                                <div className="flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
                                    <div className="bg-muted p-4 rounded-full">
                                        <UploadCloud className="h-8 w-8 opacity-50" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-foreground">Coming Soon</p>
                                        <p className="text-sm">Custom upload support will be available in a future update.</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </PopoverContent>
            </Popover>
            <p className="text-[0.8rem] text-muted-foreground">
                Choose an icon, emoji, or upload a custom image.
            </p>
        </div>
    );
}
