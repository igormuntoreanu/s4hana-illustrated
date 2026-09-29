import { createFileRoute } from "@tanstack/react-router";
import { GuideApp } from "@/components/guide-app";

export const Route = createFileRoute("/")({ component: GuideApp });
