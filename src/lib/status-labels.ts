const PRODUCT_STATUS: Record<string, string> = {
  QUEUED: "Queued",
  PROCESSING: "Generating",
  COMPLETE: "Complete",
  FAILED: "Failed",
  PENDING: "Pending",
};

const PIPELINE_PHASE: Record<string, string> = {
  RECEIVING: "Receiving upload",
  ANALYZING: "Analyzing product",
  RESEARCHING: "Researching category",
  SELECTING: "Planning modules",
  GENERATING: "Generating images",
  QA: "Quality check",
  COMPLETE: "Complete",
};

const MODULE_LABELS: Record<string, string> = {
  L1: "Hero",
  L3: "Lifestyle",
  L4: "Detail",
  L5: "Flat lay",
  L6: "Context",
  L8: "Packaging",
};

export function formatProductStatus(status: string) {
  return PRODUCT_STATUS[status] ?? status.replace(/_/g, " ").toLowerCase();
}

export function formatPipelinePhase(phase: string) {
  return PIPELINE_PHASE[phase] ?? phase.replace(/_/g, " ").toLowerCase();
}

/** Seller-facing module name (no internal codes). */
export function formatModuleLabel(moduleId: string) {
  return MODULE_LABELS[moduleId] ?? moduleId;
}

/** Internal code + label — for logs or admin only. */
export function formatModuleLabelTechnical(moduleId: string) {
  const label = MODULE_LABELS[moduleId];
  return label ? `${moduleId} · ${label}` : moduleId;
}

export function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    paid: "Paid",
    PAID: "Paid",
    complete: "Complete",
    COMPLETE: "Complete",
    failed: "Failed",
    FAILED: "Failed",
  };
  return labels[status] ?? status.replace(/_/g, " ").toLowerCase();
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "COMPLETE":
      return "bg-[var(--success-bg)] text-[var(--success)]";
    case "FAILED":
      return "bg-[var(--error-bg)] text-[var(--error)]";
    case "PROCESSING":
      return "bg-[var(--accent-soft)] text-[var(--accent)]";
    default:
      return "bg-[var(--muted)] text-[var(--muted-fg)]";
  }
}
