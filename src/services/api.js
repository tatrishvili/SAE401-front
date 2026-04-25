const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

const request = async (method, endpoint, data) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const error = new Error(
      payload?.detail ||
        payload?.message ||
        payload?.error ||
        `HTTP ${response.status}`,
    );
    error.response = { status: response.status, data: payload };
    throw error;
  }

  return { data: payload, status: response.status };
};

export default {
  get(endpoint) {
    return request("GET", endpoint);
  },
  post(endpoint, data) {
    return request("POST", endpoint, data);
  },
};
