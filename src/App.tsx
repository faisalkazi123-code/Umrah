import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, createMemoryRouter, Navigate, Outlet, RouterProvider, useLocation } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingSkeleton } from "@/components/States";
import { IS_DEMO } from "@/config/mode";
import { usePrefsStore } from "@/store/prefsStore";

// Each screen is its own chunk; the service worker precaches all of them for offline use.
const page = <T extends Record<string, unknown>>(load: () => Promise<T>, name: keyof T = "default") =>
  lazy(async () => ({ default: (await load())[name] as ComponentType }));

const Onboarding = page(() => import("@/pages/Onboarding"));
const Home = page(() => import("@/pages/Home"));
const JourneyOverview = page(() => import("@/pages/journey/JourneyOverview"));
const Ihram = page(() => import("@/pages/journey/Ihram"));
const Niyyah = page(() => import("@/pages/journey/RecitationStep"), "Niyyah");
const Talbiyah = page(() => import("@/pages/journey/RecitationStep"), "Talbiyah");
const Haram = page(() => import("@/pages/journey/Haram"));
const Tawaf = page(() => import("@/pages/journey/Tawaf"));
const AfterTawaf = page(() => import("@/pages/journey/AfterTawaf"));
const Saee = page(() => import("@/pages/journey/Saee"));
const Completion = page(() => import("@/pages/journey/Completion"), "Completion");
const UmrahComplete = page(() => import("@/pages/journey/Completion"), "UmrahComplete");
const Duas = page(() => import("@/pages/Duas"));
const Checklist = page(() => import("@/pages/Checklist"));
const More = page(() => import("@/pages/More"));
const Settings = page(() => import("@/pages/Settings"));
const GuideIndex = page(() => import("@/pages/guide/Guide"), "GuideIndex");
const Reminders = page(() => import("@/pages/guide/Guide"), "Reminders");
const NotFound = page(() => import("@/pages/NotFound"));
const guide = (group: string, titleKey: string) => {
  const Section = page(() => import("@/pages/guide/Guide"), "GuideSection") as ComponentType<{ group: string; titleKey: string }>;
  return <Section group={group} titleKey={titleKey} />;
};

function Layout() {
  const onboarded = usePrefsStore((s) => s.onboarded);
  const location = useLocation();
  if (!onboarded) return <Navigate to="/welcome" replace state={{ from: location.pathname }} />;
  return (
    <AppShell>
      <Suspense fallback={<LoadingSkeleton />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

export const routes = [
  {
    path: "/welcome",
    element: (
      <Suspense fallback={<LoadingSkeleton />}>
        <Onboarding />
      </Suspense>
    ),
    errorElement: <ErrorState />,
  },
  {
    element: <Layout />,
    errorElement: <ErrorState />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/journey", element: <JourneyOverview /> },
      { path: "/journey/ihram", element: <Ihram /> },
      { path: "/journey/ihram/niyyah", element: <Niyyah /> },
      { path: "/journey/ihram/talbiyah", element: <Talbiyah /> },
      { path: "/journey/haram", element: <Haram /> },
      { path: "/journey/tawaf", element: <Tawaf /> },
      { path: "/journey/tawaf/complete", element: <AfterTawaf /> },
      { path: "/journey/saee", element: <Saee /> },
      { path: "/journey/completion", element: <Completion /> },
      { path: "/journey/complete", element: <UmrahComplete /> },
      { path: "/duas", element: <Duas /> },
      { path: "/checklist", element: <Checklist /> },
      { path: "/more", element: <More /> },
      { path: "/settings", element: <Settings /> },
      { path: "/guide", element: <GuideIndex /> },
      { path: "/guide/reminders", element: <Reminders /> },
      { path: "/guide/madinah", element: guide("madinah", "guide.madinah") },
      { path: "/guide/hajj-types", element: guide("hajj_types", "guide.hajjTypes") },
      { path: "/guide/footnotes", element: guide("footnotes", "guide.footnotes") },
      { path: "*", element: <NotFound /> },
    ],
  },
];

const router = IS_DEMO ? createMemoryRouter(routes) : createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}
