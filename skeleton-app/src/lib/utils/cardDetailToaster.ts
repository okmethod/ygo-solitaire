import { createToaster } from "@skeletonlabs/skeleton-svelte";

export const cardDetailToaster = createToaster({
  placement: "top-end",
  max: 1,
  duration: -1,
  overlap: false,
  offsets: "1rem",
});

export function showCardDetailToast(cardName: string, cardDetails: string) {
  cardDetailToaster.info({
    title: cardName,
    description: cardDetails,
    closable: true,
  });
}
