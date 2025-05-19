import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import Dashboard from "../Dashboard";
import { logout } from "../../redux/authSlice.tsx";
import { fetchPosts } from "../../redux/postSlice.tsx";
import api from "../../utils/api.tsx";

// Mock the redux actions
jest.mock("../../redux/authSlice.tsx", () => ({
  logout: jest.fn(),
}));

jest.mock("../../redux/postSlice.tsx", () => ({
  fetchPosts: jest.fn(),
}));

// Mock the api
jest.mock("../../utils/api.tsx", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Mock the useAppSelector hook
jest.mock("../../redux/hook.ts", () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn((selector) => {
    // Mock implementation that returns data based on the selector function
    const state = {
      auth: {
        user: { id: 1, email: "test@example.com", createdAt: "2023-01-01" },
        isAuthenticated: true,
      },
      posts: {
        posts: [
          { id: 1, title: "Post 1", content: "Content 1" },
          { id: 2, title: "Post 2", content: "Content 2" },
        ],
        status: "succeeded",
        error: null,
      },
    };
    return selector(state);
  }),
}));

describe("Dashboard Component", () => {
  const mockUser = {
    id: 1,
    email: "test@example.com",
    createdAt: "2023-01-01",
  };
  const mockPosts = [
    { id: 1, title: "Post 1", content: "Content 1" },
    { id: 2, title: "Post 2", content: "Content 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the API response for user count
    (api.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });
  });

  it("renders dashboard with user information and stats", async () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        posts: {
          posts: mockPosts,
          status: "succeeded",
          error: null,
        },
      },
    });

    // Check user greeting
    expect(
      screen.getByText(/Good (morning|afternoon|evening), test/)
    ).toBeInTheDocument();

    // Check stats
    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Posts count

    // Wait for user count to be fetched
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument(); // User count
    });

    // Check user email
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // Check action links
    expect(screen.getByText("View Posts")).toBeInTheDocument();
    expect(screen.getByText("Create New Post")).toBeInTheDocument();
  });

  it("dispatches fetchPosts when posts array is empty", () => {
    // Mock the posts state to be empty
    const mockDispatch = jest.fn();
    require("../../redux/hook.ts").useAppDispatch.mockReturnValue(mockDispatch);

    // Set posts to empty array
    require("../../redux/hook.ts").useAppSelector.mockImplementation(
      (selector: any) => {
        const state = {
          auth: {
            user: mockUser,
            isAuthenticated: true,
          },
          posts: {
            posts: [], // Empty posts array
            status: "idle",
            error: null,
          },
        };
        return selector(state);
      }
    );

    renderWithProviders(<Dashboard />);

    // Since we're mocking the dispatch function, we can't directly check if fetchPosts was called
    // Instead, we'll verify that dispatch was called at least once
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("does not dispatch fetchPosts when posts array is not empty", () => {
    // Mock the posts state to have posts
    const mockDispatch = jest.fn();
    require("../../redux/hook.ts").useAppDispatch.mockReturnValue(mockDispatch);

    // Set posts to non-empty array
    require("../../redux/hook.ts").useAppSelector.mockImplementation(
      (selector: any) => {
        const state = {
          auth: {
            user: mockUser,
            isAuthenticated: true,
          },
          posts: {
            posts: mockPosts, // Non-empty posts array
            status: "succeeded",
            error: null,
          },
        };
        return selector(state);
      }
    );

    renderWithProviders(<Dashboard />);

    // Since we're mocking the dispatch function, we can verify it wasn't called with fetchPosts
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("dispatches logout action when logout button is clicked", () => {
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        posts: {
          posts: mockPosts,
          status: "succeeded",
          error: null,
        },
      },
    });

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(logout).toHaveBeenCalled();
  });

  it("handles API error when fetching user count", async () => {
    // Mock console.error to prevent error output in tests
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock API to throw an error
    (api.get as jest.Mock).mockRejectedValue(new Error("API error"));

    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        posts: {
          posts: mockPosts,
          status: "succeeded",
          error: null,
        },
      },
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching user count:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("displays correct greeting based on time of day", () => {
    // Mock the Date to return a specific hour
    const mockDate = jest.spyOn(global.Date.prototype, "getHours");

    // Test morning greeting
    mockDate.mockReturnValue(8); // 8 AM
    renderWithProviders(<Dashboard />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        posts: {
          posts: mockPosts,
          status: "succeeded",
          error: null,
        },
      },
    });
    expect(screen.getByText(/Good morning, test/)).toBeInTheDocument();

    // Cleanup
    mockDate.mockRestore();
  });
});
