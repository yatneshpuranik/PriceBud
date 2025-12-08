import { createApi , fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constant";

// import { logout } from './authSlice'; // Import the logout action

const baseQuery = fetchBaseQuery({ baseUrl : BASE_URL});
 
async function baseQueryWithAuth(args, api, extra) {
  const result = await baseQuery(args, api, extra);
  // Dispatch the logout action on 401.
  if (result.error && result.error.status === 401) {
    api.dispatch();
  }
  return result;
}

export const apiSlice = createApi ({
    baseQuery: baseQueryWithAuth, 
    tagTypes : ['Product', 'User' ],
    endpoints : (builder) => ({}),
})