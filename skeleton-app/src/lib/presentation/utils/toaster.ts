import { createToaster } from "@skeletonlabs/skeleton-svelte";
import { isMobile } from "$lib/presentation/utils/mobile";

const mobile = isMobile();

export const toaster = createToaster({
  placement: "top-end",
  duration: mobile ? 1000 : 5000,
  max: mobile ? 3 : 10,
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
