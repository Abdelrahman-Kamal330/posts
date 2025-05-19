import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import Header from "../Header";
import { logout } from "../../redux/authSlice.tsx";

// Mock the redux actions
jest.mock("../../redux/authSlice.tsx", () => ({
  logout: jest.fn(),
}));

// Mock the useAppSelector hook
jest.mock("../../redux/hook.ts", () => {
  // Keep track of the authentication state
  let isAuthenticated = false;

  return {
    useAppDispatch: jest.fn(() => jest.fn()),
    useAppSelector: jest.fn((selector) => {
      // Create a mock state object
      const state = {
        auth: {
          isAuthenticated: isAuthenticated,
          user: isAuthenticated ? { id: 1, email: "test@example.com" } : null,
        },
      };
      // Call the selector with our mock state
      return selector(state);
    }),
    // Add a method to set the authentication state for testing
    __setAuthState: (newState: boolean) => {
      isAuthenticated = newState;
    },
  };
});

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login and signup links when user is not authenticated", () => {
    // Set auth state to not authenticated
    require("../../redux/hook.ts").__setAuthState(false);

    renderWithProviders(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Signup")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("renders dashboard and logout button when user is authenticated", () => {
    // Set auth state to authenticated
    require("../../redux/hook.ts").__setAuthState(true);

    renderWithProviders(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Signup")).not.toBeInTheDocument();
  });

  it("dispatches logout action when logout button is clicked", () => {
    // Set auth state to authenticated
    require("../../redux/hook.ts").__setAuthState(true);

    renderWithProviders(<Header />);

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(logout).toHaveBeenCalled();
  });
});
