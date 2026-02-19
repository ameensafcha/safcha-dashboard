"use client";

import { Package, FileText, Plus, Trash2, AlertTriangle } from "lucide-react";
import { AddModuleModal } from "@/components/AddModuleModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteModule } from "@/app/actions/module";
import { useToast } from "@/hooks/use-toast";
import { ICON_MAP } from "@/lib/icons";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ModuleTreeProps {
    modules: any[];
}

export function ModuleTree({ modules }: ModuleTreeProps) {
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<{ id: string, name: string, count: number } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toast } = useToast();

    const openAddModal = (parentId: string | null = null) => {
        setSelectedParentId(parentId);
        setIsAddModalOpen(true);
    };

    const getDescendantCount = (parentId: string): number => {
        const children = modules.filter(m => m.parentId === parentId);
        let count = children.length;
        children.forEach(child => {
            count += getDescendantCount(child.id);
        });
        return count;
    };

    const openDeleteModal = (moduleId: string, moduleName: string) => {
        const count = getDescendantCount(moduleId);
        setModuleToDelete({ id: moduleId, name: moduleName, count });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!moduleToDelete) return;

        setIsDeleting(true);
        const result = await deleteModule(moduleToDelete.id);
        setIsDeleting(false);
        setIsDeleteModalOpen(false);

        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Module deleted successfully",
            });
        }
    };

    // Build tree
    const rootModules = modules.filter(m => !m.parentId).sort((a, b) => a.order - b.order);

    // Helper to get children
    const getChildren = (parentId: string) => {
        return modules.filter(m => m.parentId === parentId).sort((a, b) => a.order - b.order);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => openAddModal(null)} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Root Module
                </Button>
            </div>

            <div className="border rounded-lg p-2 bg-background/50">
                <ul className="space-y-1">
                    {rootModules.map(module => (
                        <ModuleItem
                            key={module.id}
                            module={module}
                            getChildren={getChildren}
                            level={0}
                            onAddChild={openAddModal}
                            onDelete={openDeleteModal}
                        />
                    ))}
                    {rootModules.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">No modules found. Create one to get started.</p>
                    )}
                </ul>
            </div>

            <AddModuleModal
                existingModules={modules}
                defaultParentId={selectedParentId}
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
            />

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Module
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{moduleToDelete?.name}"</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {moduleToDelete && moduleToDelete.count > 0 ? (
                            <div className="bg-destructive/10 p-4 rounded-md text-destructive text-sm">
                                <p className="font-semibold mb-1">Warning: Recursive Deletion</p>
                                <p>
                                    This module contains <span className="font-bold">{moduleToDelete.count}</span> submodules.
                                </p>
                                <p className="mt-2">
                                    If you proceed, <span className="font-bold underline">all submodules will be permanently deleted</span>.
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone. This will permanently remove the module and its permissions.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete Module"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function ModuleItem({ module, getChildren, level, onAddChild, onDelete }: {
    module: any,
    getChildren: (id: string) => any[],
    level: number,
    onAddChild: (id: string) => void,
    onDelete: (id: string, name: string) => void
}) {
    const children = getChildren(module.id);
    const hasChildren = children.length > 0;
    const isFolder = module.type === 'FOLDER';

    const systemModuleIds = [
        'mod-overview', 'mod-overview-ceo', 'mod-overview-company',
        'mod-sales', 'mod-sales-orders', 'mod-sales-clients', 'mod-sales-wholesale', 'mod-sales-export', 'mod-sales-invoices',
        'mod-inventory', 'mod-inventory-raw', 'mod-inventory-finished', 'mod-inventory-movements',
        'mod-production', 'mod-production-batches', 'mod-production-qc', 'mod-production-rnd',
        'mod-products', 'mod-products-catalog', 'mod-products-pricing', 'mod-products-formulations',
        'mod-finance', 'mod-finance-revenue', 'mod-finance-expenses', 'mod-finance-pnl', 'mod-finance-statements', 'mod-finance-subscriptions',
        'mod-crm', 'mod-crm-contacts', 'mod-crm-companies', 'mod-crm-deals', 'mod-crm-leads',
        'mod-marketing', 'mod-marketing-campaigns', 'mod-marketing-ads', 'mod-marketing-content',
        'mod-events', 'mod-events-calendar', 'mod-events-booth', 'mod-events-inventory',
        'mod-team', 'mod-team-tasks', 'mod-team-projects', 'mod-team-directory', 'mod-team-onboarding',
        'mod-documents', 'mod-docs-legal', 'mod-docs-contracts', 'mod-docs-sops', 'mod-docs-templates',
        'mod-strategy', 'mod-strategy-plan', 'mod-strategy-okrs', 'mod-strategy-goals', 'mod-strategy-roadmap'
    ];
    const isSystemModule = systemModuleIds.includes(module.id);

    const renderIcon = () => {
        if (module.icon) {
            const IconComponent = ICON_MAP[module.icon];
            if (IconComponent) {
                return <IconComponent className="h-4 w-4" />;
            }
            // Render emoji if short string
            if (module.icon.length <= 4) {
                return <span className="flex items-center justify-center not-italic leading-none text-lg select-none">{module.icon}</span>;
            }
        }
        // Fallback
        return isFolder ? <Package className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
    };

    return (
        <li className="select-none">
            <div
                className={`
                    group flex items-center gap-2 p-2 rounded-md transition-colors
                    ${level === 0 ? 'bg-secondary/10 hover:bg-secondary/20 font-medium' : 'hover:bg-secondary/10 text-sm'}
                `}
                style={{ marginLeft: `${level * 24}px` }}
            >
                <div className="text-muted-foreground w-5 flex justify-center">
                    {renderIcon()}
                </div>
                <span>{module.name}</span>
                <span className="text-xs text-muted-foreground ml-auto bg-background/50 px-2 py-0.5 rounded border mr-2">
                    /{module.slug}
                </span>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    {/* Plus Button for Folders */}
                    {isFolder && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild(module.id);
                            }}
                            title="Add Child Module"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}

                    {/* Delete Button - Only for non-system modules */}
                    {!isSystemModule && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(module.id, module.name);
                            }}
                            title="Delete Module"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {hasChildren && (
                <ul className="mt-1 space-y-1 relative">
                    {/* Vertical line for hierarchy visual */}
                    <div
                        className="absolute left-0 top-0 bottom-0 border-l-2 border-border/40"
                        style={{ left: `${(level * 24) + 11}px` }}
                    ></div>
                    {children.map(child => (
                        <ModuleItem
                            key={child.id}
                            module={child}
                            getChildren={getChildren}
                            level={level + 1}
                            onAddChild={onAddChild}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
