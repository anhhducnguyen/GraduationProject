import type { AxiosInstance } from "axios";
import { stringify } from "query-string";
import type { DataProvider } from "@refinedev/core";
import { axiosInstance, generateSort, generateFilter } from "../utils/simple-rest/utils";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance,
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};
    const { headers: headersFromMeta = {}, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    // Lấy token từ localStorage và tạo header Authorization nếu có token
    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    const queryFilters = generateFilter(filters);

    const query: {
      _start?: number;
      _end?: number;
      _sort?: string;
      _order?: string;
    } = {};

    if (mode === "server") {
      query._start = (current - 1) * pageSize;
      query._end = current * pageSize;
    }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { _sort, _order } = generatedSort;
      query._sort = _sort.join(",");
      query._order = _order.join(",");
    }

    const combinedQuery = { ...query, ...queryFilters };
    const urlWithQuery = Object.keys(combinedQuery).length
      ? `${url}?${stringify(combinedQuery)}`
      : url;

    const { data, headers: responseHeaders } = await httpClient[requestMethod](urlWithQuery, {
      headers,
    });

    const total = +responseHeaders["x-total-count"];

    return {
      data,
      total: total || data.length,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers: headersFromMeta = {}, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    const { data } = await httpClient[requestMethod](
      `${apiUrl}/${resource}?${stringify({ id: ids })}`,
      { headers },
    );

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers: headersFromMeta = {}, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers: headersFromMeta = {}, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "patch";

    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers: headersFromMeta = {}, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    const { data } = await httpClient[requestMethod](url, { headers });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers: headersFromMeta = {}, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method = "get",
    filters,
    sorters,
    payload,
    query,
    headers: headersFromMeta = {},
  }) => {
    // Lấy token để thêm header Authorization
    const token = localStorage.getItem("refine-auth");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const headers = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headersFromMeta,
    };

    let requestUrl = url;

    const queryParts: Record<string, any> = {};

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        queryParts._sort = _sort.join(",");
        queryParts._order = _order.join(",");
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      Object.assign(queryParts, filterQuery);
    }

    if (query) {
      Object.assign(queryParts, query);
    }

    if (Object.keys(queryParts).length > 0) {
      requestUrl += (requestUrl.includes("?") ? "&" : "?") + stringify(queryParts);
    }

    let axiosResponse;
    switch (method) {
      case "put":
      case "post":
      case "patch":
        axiosResponse = await httpClient[method](url, payload, {
          headers,
        });
        break;
      case "delete":
        axiosResponse = await httpClient.delete(url, {
          data: payload,
          headers,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers,
        });
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});
