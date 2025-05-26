import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import Posts from "../Posts";
import { fetchPosts } from "../../redux/postSlice.tsx";

// Mock the redux actions
jest.mock("../../redux/postSlice.tsx", () => ({
  fetchPosts: jest.fn(),
}));

// Mock the useAppSelector hook
jest.mock("../../redux/hook.ts", () => {
  // Keep track of the posts state
  let postsState = {
    posts: [],
    status: "idle",
    error: null,
  };

  return {
    useAppDispatch: jest.fn(() => jest.fn()),
    useAppSelector: jest.fn((selector) => {
      // Create a mock state object
      const state = {
        posts: postsState,
      };
      // Call the selector with our mock state
      return selector(state);
    }),
    // Add a method to set the posts state for testing
    __setPostsState: (newState: any) => {
      postsState = newState;
    },
  };
});

// Mock the PostCard component
jest.mock("../../components/PostCard.tsx", () => {
  return {
    __esModule: true,
    default: ({ post }: { post: any }) => (
      <div data-testid="post-card">
        <h2>{post.title}</h2>
        <p>{post.content}</p>
      </div>
    ),
  };
});

describe("Posts Component", () => {
  const mockPosts = [
    { id: 1, title: "Post 1", content: "Content 1" },
    { id: 2, title: "Post 2", content: "Content 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dispatches fetchPosts on mount", () => {
    renderWithProviders(<Posts />);
    expect(fetchPosts).toHaveBeenCalled();
  });

  it("displays loading state when posts are loading", () => {
    // Set posts state to loading
    require("../../redux/hook.ts").__setPostsState({
      posts: [],
      status: "loading",
      error: null,
    });

    renderWithProviders(<Posts />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card")).not.toBeInTheDocument();
  });

  it("displays posts when loading is complete", () => {
    // Set posts state to succeeded with mock posts
    require("../../redux/hook.ts").__setPostsState({
      posts: mockPosts,
      status: "succeeded",
      error: null,
    });

    renderWithProviders(<Posts />);

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("post-card")).toHaveLength(2);
    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });

  it("displays posts heading", () => {
    renderWithProviders(<Posts />);
    expect(screen.getByText("Posts")).toBeInTheDocument();
  });
});
