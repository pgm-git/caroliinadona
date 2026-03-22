import "server-only";

import { createCaller } from "@/server/trpc/root";
import { createContext } from "@/server/trpc/context";

export async function getServerTrpc() {
  const context = await createContext();
  return createCaller(context);
}
