import { PRODUCT_URL } from '../constant';
import { apiSlice } from './apiSlices';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
   getProducts: builder.query({
  query: (searchTerm = "") => ({
    url: searchTerm ? `${PRODUCT_URL}?search=${searchTerm}` : PRODUCT_URL,
  }),
}),


    getProductDetails : builder.query({
      query: (productId) => ({
       url: `${PRODUCT_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),

  }),
});

export const { useGetProductsQuery , useGetProductDetailsQuery } = productsApiSlice;