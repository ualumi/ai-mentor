// api/client.js

import { useAuth } from "../context/AuthContext";

export function useApi() {
  const { token } = useAuth();

  const request = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    return response.json();
  };

  return { request };
}