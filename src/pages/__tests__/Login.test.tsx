import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import Login from "../Login";
import { login } from "../../redux/authSlice.tsx";
import api from "../../utils/api";

// Mock the redux actions
jest.mock("../../redux/authSlice.tsx", () => ({
  login: jest.fn(),
}));

// Mock the api
jest.mock("../../utils/api.tsx", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    renderWithProviders(<Login />);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText("Signup")).toBeInTheDocument();
  });

  it("updates form values on input change", () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("submits the form and logs in successfully", async () => {
    const mockLogin = login as unknown as jest.Mock;
    const mockApiGet = api.get as jest.Mock;

    // Mock successful API response
    mockApiGet.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          email: "test@example.com",
          password: "password123",
          createdAt: "2023-01-01",
        },
      ],
    });

    renderWithProviders(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    // Check if API was called with correct data
    expect(mockApiGet).toHaveBeenCalledWith(`/users?email=test@example.com`);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        id: 1,
        email: "test@example.com",
        password: "password123",
        createdAt: "2023-01-01",
      });
    });

    // Loading state should be shown during submission
    expect(screen.queryByText("Logging in...")).not.toBeInTheDocument();
  });

  it("displays error message on login failure", async () => {
    const mockApiGet = api.get as jest.Mock;

    // Mock API error
    mockApiGet.mockResolvedValueOnce({
      data: [], // No matching user found
    });

    renderWithProviders(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrong-password" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText("No account found with this email")
      ).toBeInTheDocument();
    });

    // Login action should not have been called
    expect(login).not.toHaveBeenCalled();
  });

  it("handles generic error when API response is unexpected", async () => {
    const mockApiGet = api.get as jest.Mock;

    // Mock network error
    mockApiGet.mockRejectedValueOnce(new Error("Network error"));

    renderWithProviders(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    // Wait for the error message to appear
    await waitFor(
      () => {
        expect(
          screen.getByText("Login failed. Please try again.")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
