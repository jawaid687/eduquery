"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { HealthStatus } from "@/types";

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<HealthStatus>("/health")
      .then(setHealth)
      .catch(() => setError("Could not reach the backend."));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">EduQuery</h1>
      {health && (
        <p className="text-green-600">
          Backend connected: {health.service} is {health.status}
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!health && !error && (
        <p className="text-gray-500">Connecting to backend...</p>
      )}
    </main>
  );
}