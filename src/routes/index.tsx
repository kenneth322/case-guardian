import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ApplicationForm from "@/components/screening/ApplicationForm";
import LoaderScreen from "@/components/screening/LoaderScreen";
import ResultsScreen from "@/components/screening/ResultsScreen";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Anti-Fraud Case Screening" },
      {
        name: "description",
        content:
          "Enterprise anti-fraud case screening console — assess bureau, digital and telco risk in one workflow.",
      },
      { property: "og:title", content: "Anti-Fraud Case Screening" },
      {
        property: "og:description",
        content:
          "Enterprise anti-fraud case screening console — assess bureau, digital and telco risk in one workflow.",
      },
    ],
  }),
});

type Screen = "form" | "loader" | "results";

function Index() {
  const [screen, setScreen] = useState<Screen>("form");
  const [mobile, setMobile] = useState("");

  if (screen === "loader") {
    return <LoaderScreen onDone={() => setScreen("results")} />;
  }
  if (screen === "results") {
    return (
      <ResultsScreen
        mobile={mobile}
        onReset={() => {
          setMobile("");
          setScreen("form");
        }}
      />
    );
  }
  return (
    <ApplicationForm
      onSubmit={(m) => {
        setMobile(m);
        setScreen("loader");
      }}
    />
  );
}
