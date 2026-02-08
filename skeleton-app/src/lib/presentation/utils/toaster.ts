import { createToaster } from "@skeletonlabs/skeleton-svelte";
import { isMobile } from "$lib/presentation/utils/mobile";

const _isMobile = isMobile();

export const toaster = createToaster({
  placement: "top-end",
  duration: _isMobile ? 1000 : 5000,
  max: _isMobile ? 3 : 10,
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
