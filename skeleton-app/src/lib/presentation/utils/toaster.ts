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
