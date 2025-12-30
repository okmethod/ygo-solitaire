import { createToaster } from "@skeletonlabs/skeleton-svelte";

export const toaster = createToaster({
  placement: "top-end",
});

export function showSuccessToast(title: string) {
  toaster.success({
    title: title,
  });
}

export function showErrorToast(title: string) {
  toaster.error({
    title: title,
  });
}

/**
 * Show info toast notification
 * @param summary - Toast summary (title)
 * @param description - Toast description (message)
 */
export function showInfoToast(summary: string, description: string) {
  toaster.success({
    title: `${summary}: ${description}`,
  });
}
