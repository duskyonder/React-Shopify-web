import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Config data is stable across a session — cache for 5 minutes to prevent
      // flash-of-default-content on page navigation.
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ─── Server-Side Config Hydration ────────────────────────────────────────────
// The Express server injects window.__INITIAL_CONFIG__ into the HTML before
// React mounts (see server/_core/vite.ts).  We pre-populate the React Query
// cache with this data so that trpc.siteConfig.getAll.useQuery() resolves
// synchronously on first render — eliminating the flash of default content.
//
// tRPC v11 query key for siteConfig.getAll (no input, type "query"):
//   [["siteConfig", "getAll"], { type: "query" }]
declare global {
  interface Window {
    __INITIAL_CONFIG__?: Record<string, unknown>;
  }
}

if (typeof window !== "undefined" && window.__INITIAL_CONFIG__) {
  queryClient.setQueryData(
    [["siteConfig", "getAll"], { type: "query" }],
    window.__INITIAL_CONFIG__
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
