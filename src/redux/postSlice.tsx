import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Post } from "../types";

const API_URL = "http://localhost:5000/posts";

interface PostData {
  title: string;
  content: string;
}

interface UpdatePostParams {
  id: number;
  updatedData: PostData;
}

export const fetchPosts = createAsyncThunk<Post[]>(
  "posts/fetchPosts",
  async () => {
    const response = await axios.get(API_URL);
    return response.data;
  }
);

export const createPost = createAsyncThunk<Post, PostData>(
  "posts/createPost",
  async (postData) => {
    const response = await axios.post(API_URL, postData);
    return response.data;
  }
);

export const updatePost = createAsyncThunk<Post, UpdatePostParams>(
  "posts/updatePost",
  async ({ id, updatedData }) => {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  }
);

export const deletePost = createAsyncThunk<number, number>(
  "posts/deletePost",
  async (postId) => {
    await axios.delete(`${API_URL}/${postId}`);
    return postId;
  }
);

interface PostsState {
  posts: Post[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  status: "idle",
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch posts";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.push(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(
          (post) => post.id === action.payload.id
        );
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      });
  },
});

export default postSlice.reducer;
