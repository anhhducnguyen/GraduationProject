// import type { DataProvider, HttpError } from "@refinedev/core";
// import { CrudFilters, CrudFilter, ConditionalFilter } from "@refinedev/core";


// const API_URL = "http://localhost:5000/api/v1";

// const fetcher = async (url: string, options?: RequestInit) => {
//   const token = localStorage.getItem("refine-auth");
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options?.headers || {}),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };

//   const response = await fetch(url, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     const errorBody = await response.json().catch(() => ({}));
//     const error: HttpError = {
//       name: "HttpError",
//       message: errorBody.message || response.statusText,
//       statusCode: response.status,
//       data: errorBody,
//     };
//     throw error;
//   }

//   return response.json();
// };

// export const dataProvider: DataProvider = {
//    getApiUrl: () => API_URL,
//   getList: async ({ resource, pagination, sort, filters }) => {
//     const { current = 1, pageSize = 10 } = pagination ?? {};
//     const sortField = sort?.[0]?.field;
//     const sortOrder = sort?.[0]?.order;

//     // Build query params
//     const query: Record<string, any> = {
//       _page: current,
//       _limit: pageSize,
//     };

//     if (sortField && sortOrder) {
//       query._sort = sortField;
//       query._order = sortOrder === "asc" ? "asc" : "desc";
//     }

//     // Add filter params
//     if (filters) {
//       filters.forEach((filter) => {
//         query[filter.operator] = filter.value;
//       });
//     }

//     // Build query string
//     const queryString = new URLSearchParams(query).toString();

//     const url = `${API_URL}/${resource}?${queryString}`;

//     const data = await fetcher(url);

//     // Nếu API trả về tổng số bản ghi trong headers (X-Total-Count)
//     // Refine cần trả về dạng { data: [...], total: number }
//     // Giả sử API không trả header, thì ta trả data.length luôn
//     return {
//       data,
//       total: data.length,
//     };
//   },

//   getOne: async ({ resource, id }) => {
//     const url = `${API_URL}/${resource}/${id}`;
//     const data = await fetcher(url);
//     return { data };
//   },

//   create: async ({ resource, variables }) => {
//     const url = `${API_URL}/${resource}`;
//     const data = await fetcher(url, {
//       method: "POST",
//       body: JSON.stringify(variables),
//     });
//     return { data };
//   },

//   update: async ({ resource, id, variables }) => {
//     const url = `${API_URL}/${resource}/${id}`;
//     const data = await fetcher(url, {
//       method: "PUT",
//       body: JSON.stringify(variables),
//     });
//     return { data };
//   },

//   deleteOne: async ({ resource, id }) => {
//     const url = `${API_URL}/${resource}/${id}`;
//     const data = await fetcher(url, {
//       method: "DELETE",
//     });
//     return { data };
//   },

//   // Các phương thức khác (deleteMany, updateMany) có thể implement sau nếu cần
// };




// import type { AxiosInstance } from "axios";
// import { stringify } from "query-string";
// import type { DataProvider } from "@refinedev/core";
// import { axiosInstance, generateSort, generateFilter } from "../utils/simple-rest/utils";

// type MethodTypes = "get" | "delete" | "head" | "options";
// type MethodTypesWithBody = "post" | "put" | "patch";

// export const dataProvider = (
//   apiUrl: string,
//   httpClient: AxiosInstance = axiosInstance,
// ): Omit<
//   Required<DataProvider>,
//   "createMany" | "updateMany" | "deleteMany"
// > => ({
//   getList: async ({ resource, pagination, filters, sorters, meta }) => {
//     const url = `${apiUrl}/${resource}`;

//     const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

//     const { headers: headersFromMeta, method } = meta ?? {};
//     const requestMethod = (method as MethodTypes) ?? "get";

//     const queryFilters = generateFilter(filters);

//     const query: {
//       _start?: number;
//       _end?: number;
//       _sort?: string;
//       _order?: string;
//     } = {};

//     if (mode === "server") {
//       query._start = (current - 1) * pageSize;
//       query._end = current * pageSize;
//     }

//     const generatedSort = generateSort(sorters);
//     if (generatedSort) {
//       const { _sort, _order } = generatedSort;
//       query._sort = _sort.join(",");
//       query._order = _order.join(",");
//     }

//     const combinedQuery = { ...query, ...queryFilters };
//     const urlWithQuery = Object.keys(combinedQuery).length
//       ? `${url}?${stringify(combinedQuery)}`
//       : url;

//     const { data, headers } = await httpClient[requestMethod](urlWithQuery, {
//       headers: headersFromMeta,
//     });

//     const total = +headers["x-total-count"];

//     return {
//       data,
//       total: total || data.length,
//     };
//   },

//   getMany: async ({ resource, ids, meta }) => {
//     const { headers, method } = meta ?? {};
//     const requestMethod = (method as MethodTypes) ?? "get";

//     const { data } = await httpClient[requestMethod](
//       `${apiUrl}/${resource}?${stringify({ id: ids })}`,
//       { headers },
//     );

//     return {
//       data,
//     };
//   },

//   create: async ({ resource, variables, meta }) => {
//     const url = `${apiUrl}/${resource}`;

//     const { headers, method } = meta ?? {};
//     const requestMethod = (method as MethodTypesWithBody) ?? "post";

//     const { data } = await httpClient[requestMethod](url, variables, {
//       headers,
//     });

//     return {
//       data,
//     };
//   },

//   update: async ({ resource, id, variables, meta }) => {
//     const url = `${apiUrl}/${resource}/${id}`;

//     const { headers, method } = meta ?? {};
//     const requestMethod = (method as MethodTypesWithBody) ?? "patch";

//     const { data } = await httpClient[requestMethod](url, variables, {
//       headers,
//     });

//     return {
//       data,
//     };
//   },

//   getOne: async ({ resource, id, meta }) => {
//     const url = `${apiUrl}/${resource}/${id}`;

//     const { headers, method } = meta ?? {};
//     const requestMethod = (method as MethodTypes) ?? "get";

//     const { data } = await httpClient[requestMethod](url, { headers });

//     return {
//       data,
//     };
//   },

//   deleteOne: async ({ resource, id, variables, meta }) => {
//     const url = `${apiUrl}/${resource}/${id}`;

//     const { headers, method } = meta ?? {};
//     const requestMethod = (method as MethodTypesWithBody) ?? "delete";

//     const { data } = await httpClient[requestMethod](url, {
//       data: variables,
//       headers,
//     });

//     return {
//       data,
//     };
//   },

//   getApiUrl: () => {
//     return apiUrl;
//   },

//   custom: async ({
//     url,
//     method,
//     filters,
//     sorters,
//     payload,
//     query,
//     headers,
//   }) => {
//     let requestUrl = `${url}?`;

//     if (sorters) {
//       const generatedSort = generateSort(sorters);
//       if (generatedSort) {
//         const { _sort, _order } = generatedSort;
//         const sortQuery = {
//           _sort: _sort.join(","),
//           _order: _order.join(","),
//         };
//         requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
//       }
//     }

//     if (filters) {
//       const filterQuery = generateFilter(filters);
//       requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
//     }

//     if (query) {
//       requestUrl = `${requestUrl}&${stringify(query)}`;
//     }

//     let axiosResponse;
//     switch (method) {
//       case "put":
//       case "post":
//       case "patch":
//         axiosResponse = await httpClient[method](url, payload, {
//           headers,
//         });
//         break;
//       case "delete":
//         axiosResponse = await httpClient.delete(url, {
//           data: payload,
//           headers: headers,
//         });
//         break;
//       default:
//         axiosResponse = await httpClient.get(requestUrl, {
//           headers,
//         });
//         break;
//     }

//     const { data } = axiosResponse;

//     return Promise.resolve({ data });
//   },
// });


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
