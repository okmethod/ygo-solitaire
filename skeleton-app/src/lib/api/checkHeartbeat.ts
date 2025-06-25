import { constructRequestInit, fetchApi } from "$lib/utils/request";
import { pathHeartbeat } from "$lib/api/paths";

interface ResponseJson {
  message: string;
}

async function checkHeartbeat(fetchFunction: typeof fetch): Promise<string> {
  const url = pathHeartbeat;
  const requestInit = constructRequestInit();
  const requestConfig = {
    ...requestInit,
    method: "GET",
  };
  const response = await fetchApi(fetchFunction, url, requestConfig);
  const { message } = (await response.json()) as ResponseJson;
  return message;
}

export default checkHeartbeat;
