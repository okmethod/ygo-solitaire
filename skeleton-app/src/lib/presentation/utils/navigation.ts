import { goto } from "$app/navigation";
import { base } from "$app/paths";

export function navigateTo(path: string) {
  goto(`${base}${path}`);
}
