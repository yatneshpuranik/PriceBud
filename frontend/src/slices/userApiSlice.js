import { USER_URL } from "../constant";
import { apiSlice } from "./apiSlices";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        login : builder.mutation({
            query  : (data) =>
           ({
                url : `${USER_URL}/login`,
                method : 'POST' ,
                body : data, 
            }),
        }),
        register : builder.mutation({
            query  : (data) =>
           ({
                url : `${USER_URL}/register`, // just to user not to the register api like `${USER_URL}/register`
                method : 'POST' ,
                body : data, 
            }),
        }),
        logout : builder.mutation({
            query  : (data) =>
           ({
                url : `${USER_URL}/logout`,
                method : 'POST' ,
            }),
        }),
        profile: builder.mutation({
    query: (data) => ({
        url: `${USER_URL}/profile`,
        method: 'PUT',
        body: data,
        credentials: 'include', // <-- send JWT cookie to backend
    }),
}),
getUsers: builder.query({
      query: () => ({
        url: `${USER_URL}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    // 🔹 Delete a user (Admin)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USER_URL}/${userId}`,
        method: "DELETE",
      }),
    }),

    // 🔹 Get user details (Admin)
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USER_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
     updateUser: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),



    })
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} = usersApiSlice