import postReducer, {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
} from "../postSlice.tsx";
import type { Post, PostsState } from "../../types/index";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Post Slice", () => {
  const initialState: PostsState = {
    posts: [],
    status: "idle",
    error: null,
  };

  const mockPosts: Post[] = [
    { id: 1, title: "Post 1", content: "Content 1" },
    { id: 2, title: "Post 2", content: "Content 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle initial state", () => {
    const state = postReducer(undefined, { type: "unknown" });
    expect(state).toEqual(initialState);
  });

  describe("fetchPosts", () => {
    it("should handle fetchPosts.pending", () => {
      const action = { type: fetchPosts.pending.type };
      const state = postReducer(initialState, action);
      expect(state).toEqual({
        posts: [],
        status: "loading",
        error: null,
      });
    });

    it("should handle fetchPosts.fulfilled", () => {
      const action = {
        type: fetchPosts.fulfilled.type,
        payload: mockPosts,
      };
      const state = postReducer(initialState, action);
      expect(state).toEqual({
        posts: mockPosts,
        status: "succeeded",
        error: null,
      });
    });

    it("should handle fetchPosts.rejected", () => {
      const action = {
        type: fetchPosts.rejected.type,
        error: { message: "Failed to fetch posts" },
      };
      const state = postReducer(initialState, action);
      expect(state).toEqual({
        posts: [],
        status: "failed",
        error: "Failed to fetch posts",
      });
    });

    it("should fetch posts from API", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockPosts });

      const dispatch = jest.fn();
      const thunk = fetchPosts();

      await thunk(dispatch, () => ({}), undefined);

      const { calls } = dispatch.mock;
      expect(calls[0][0].type).toBe(fetchPosts.pending.type);
      expect(calls[1][0].type).toBe(fetchPosts.fulfilled.type);
      expect(calls[1][0].payload).toEqual(mockPosts);
    });
  });

  describe("createPost", () => {
    it("should handle createPost.fulfilled", () => {
      const newPost: Post = {
        id: 3,
        title: "New Post",
        content: "New Content",
      };
      const action = {
        type: createPost.fulfilled.type,
        payload: newPost,
      };
      const state = postReducer(
        {
          ...initialState,
          posts: [...mockPosts],
        },
        action
      );
      expect(state.posts).toEqual([...mockPosts, newPost]);
    });

    it("should create a post via API", async () => {
      const newPost: Post = {
        id: 3,
        title: "New Post",
        content: "New Content",
      };
      const postData = { title: "New Post", content: "New Content" };

      mockedAxios.post.mockResolvedValueOnce({ data: newPost });

      const dispatch = jest.fn();
      const thunk = createPost(postData);

      await thunk(dispatch, () => ({}), undefined);

      const { calls } = dispatch.mock;
      expect(calls[0][0].type).toBe(createPost.pending.type);
      expect(calls[1][0].type).toBe(createPost.fulfilled.type);
      expect(calls[1][0].payload).toEqual(newPost);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5000/posts",
        postData
      );
    });
  });

  describe("updatePost", () => {
    it("should handle updatePost.fulfilled", () => {
      const updatedPost: Post = {
        id: 1,
        title: "Updated Post",
        content: "Updated Content",
      };
      const action = {
        type: updatePost.fulfilled.type,
        payload: updatedPost,
      };
      const state = postReducer(
        {
          ...initialState,
          posts: [...mockPosts],
        },
        action
      );
      expect(state.posts[0]).toEqual(updatedPost);
    });

    it("should update a post via API", async () => {
      const updatedPost: Post = {
        id: 1,
        title: "Updated Post",
        content: "Updated Content",
      };
      const updateData = {
        id: 1,
        updatedData: { title: "Updated Post", content: "Updated Content" },
      };

      mockedAxios.put.mockResolvedValueOnce({ data: updatedPost });

      const dispatch = jest.fn();
      const thunk = updatePost(updateData);

      await thunk(dispatch, () => ({}), undefined);

      const { calls } = dispatch.mock;
      expect(calls[0][0].type).toBe(updatePost.pending.type);
      expect(calls[1][0].type).toBe(updatePost.fulfilled.type);
      expect(calls[1][0].payload).toEqual(updatedPost);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:5000/posts/1",
        updateData.updatedData
      );
    });
  });

  describe("deletePost", () => {
    it("should handle deletePost.fulfilled", () => {
      const action = {
        type: deletePost.fulfilled.type,
        payload: 1,
      };
      const state = postReducer(
        {
          ...initialState,
          posts: [...mockPosts],
        },
        action
      );
      expect(state.posts).toEqual([mockPosts[1]]);
    });

    it("should delete a post via API", async () => {
      mockedAxios.delete.mockResolvedValueOnce({});

      const dispatch = jest.fn();
      const thunk = deletePost(1);

      await thunk(dispatch, () => ({}), undefined);

      const { calls } = dispatch.mock;
      expect(calls[0][0].type).toBe(deletePost.pending.type);
      expect(calls[1][0].type).toBe(deletePost.fulfilled.type);
      expect(calls[1][0].payload).toEqual(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:5000/posts/1"
      );
    });
  });
});
