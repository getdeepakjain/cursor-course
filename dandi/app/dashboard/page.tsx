"use client";

import { ApiKeysTableCard } from "./components/overview/ApiKeysTableCard";
import { DashboardOverviewFooter } from "./components/overview/DashboardOverviewFooter";
import { DashboardTopBar } from "./components/overview/DashboardTopBar";
import { NotificationToast } from "./components/overview/NotificationToast";
import { PlanUsageBanner } from "./components/overview/PlanUsageBanner";
import { useDashboardKeys } from "./components/overview/useDashboardKeys";
import { CreateKeyModal } from "./components/overview/modals/CreateKeyModal";
import { DeleteKeyModal } from "./components/overview/modals/DeleteKeyModal";
import { NewSecretModal } from "./components/overview/modals/NewSecretModal";
import { RenameKeyModal } from "./components/overview/modals/RenameKeyModal";

/**
 * Dashboard “Overview”: usage banner, API keys CRUD, modals, toasts.
 * Data logic lives in `useDashboardKeys`; UI is split under `components/overview/`.
 */
export default function DashboardPage() {
  const d = useDashboardKeys();

  return (
    <div className="min-h-screen pb-10">
      {/* Toasts sit above modals but below nothing else — fixed center */}
      <div className="pointer-events-none fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 justify-center px-4">
        {d.toast ? (
          <NotificationToast message={d.toast.message} variant={d.toast.variant} onDismiss={d.dismissToast} />
        ) : null}
      </div>

      <DashboardTopBar />

      <div className="px-8 pt-8">
        <p className="text-xs font-medium text-neutral-500">
          Pages <span className="text-neutral-400">/</span> Overview
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">Overview</h1>
      </div>

      <PlanUsageBanner usageDisplay={d.usageDisplay} planLimit={d.planLimit} usagePct={d.usagePct} />

      <ApiKeysTableCard
        keys={d.keys}
        loading={d.loading}
        error={d.error}
        revealed={d.revealed}
        revealLoading={d.revealLoading}
        onOpenCreate={() => d.setShowCreateModal(true)}
        onToggleReveal={d.toggleReveal}
        onCopy={d.copyKey}
        onRename={d.openRename}
        onRequestDelete={d.setDeleteConfirmId}
      />

      <DashboardOverviewFooter />

      <CreateKeyModal
        open={d.showCreateModal}
        name={d.newName}
        onNameChange={d.setNewName}
        creating={d.creating}
        onClose={() => d.setShowCreateModal(false)}
        onSubmit={d.handleCreate}
      />

      <DeleteKeyModal
        keyId={d.deleteConfirmId}
        keys={d.keys}
        busy={d.deleteBusy}
        onCancel={() => d.setDeleteConfirmId(null)}
        onConfirm={d.executeDelete}
      />

      <RenameKeyModal
        open={Boolean(d.renameModalId)}
        value={d.renameValue}
        onValueChange={d.setRenameValue}
        saving={d.savingId === d.renameModalId}
        onCancel={() => d.setRenameModalId(null)}
        onSave={d.saveRename}
      />

      <NewSecretModal
        secret={d.newSecretModal}
        onDismiss={() => d.setNewSecretModal(null)}
        onCopied={() => d.showToast("API key copied successfully")}
      />
    </div>
  );
}
