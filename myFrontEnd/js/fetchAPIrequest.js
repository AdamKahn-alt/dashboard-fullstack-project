const API_BASE_URL = `http://localhost:8000/api/v1/users`;

const fetchFunction = async (url_endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url_endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (response.status === 401) {
    location.href = "index.html";
    return;
  }

  return data;
};
export default fetchFunction;
