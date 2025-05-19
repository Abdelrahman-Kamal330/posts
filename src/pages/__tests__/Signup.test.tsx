import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import Signup from "../Signup";
import { login } from "../../redux/authSlice.tsx";
import api from "../../utils/api.tsx";

// Mock the redux actions
jest.mock("../../redux/authSlice.tsx", () => ({
  login: jest.fn(),
}));

// Mock the api
jest.mock("../../utils/api.tsx", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock the useAppDispatch hook
jest.mock("../../redux/hook.ts", () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn(),
}));

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders signup form correctly", () => {
    renderWithProviders(<Signup />);

    expect(screen.getByRole("heading", { name: "Signup" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Signup" })).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("validates email and password on submit", async () => {
    renderWithProviders(<Signup />);

    const submitButton = screen.getByRole("button", { name: "Signup" });

    // Submit with empty fields
    fireEvent.click(submitButton);

    // Mock the validateForm function to simulate validation
    const errorDiv = await waitFor(() => screen.getByTestId("error-message"));
    expect(errorDiv).toHaveTextContent("Email is required");

    // Enter invalid email
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);
    const emailErrorDiv = await waitFor(() =>
      screen.getByTestId("error-message")
    );
    expect(emailErrorDiv).toHaveTextContent(
      "Please enter a valid email address"
    );

    // Enter valid email but no password
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    // Clear password field
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "" } });
    fireEvent.click(submitButton);
    const passwordErrorDiv = await waitFor(() =>
      screen.getByTestId("error-message")
    );
    expect(passwordErrorDiv).toHaveTextContent("Password is required");

    // Enter short password
    fireEvent.change(passwordInput, { target: { value: "12345" } });
    fireEvent.click(submitButton);
    const shortPasswordErrorDiv = await waitFor(() =>
      screen.getByTestId("error-message")
    );
    expect(shortPasswordErrorDiv).toHaveTextContent(
      "Password must be at least 6 characters long"
    );
  });

  it("shows error when user already exists", async () => {
    // Mock API to return existing user
    (api.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1, email: "existing@example.com" }],
    });

    renderWithProviders(<Signup />);

    // Fill form with valid data
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Signup" });
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("User with this email already exists")
      ).toBeInTheDocument();
    });

    // Verify API was called correctly
    expect(api.get).toHaveBeenCalledWith("/users?email=existing%40example.com");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("creates a new user successfully", async () => {
    // Mock API responses
    (api.get as jest.Mock).mockResolvedValue({ data: [] }); // No existing user
    (api.post as jest.Mock).mockResolvedValue({
      data: { id: 1, email: "new@example.com", createdAt: "2023-01-01" },
    });

    renderWithProviders(<Signup />);

    // Fill form with valid data
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Signup" });
    fireEvent.click(submitButton);

    // Wait for API calls to complete
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/users", {
        email: "new@example.com",
        password: "password123",
        createdAt: expect.any(String),
      });
    });

    // Verify login action was dispatched
    expect(login).toHaveBeenCalledWith({
      id: 1,
      email: "new@example.com",
      createdAt: "2023-01-01",
    });
  });

  it("handles API error during signup", async () => {
    // Mock console.error to prevent error output in tests
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Mock API responses
    (api.get as jest.Mock).mockResolvedValue({ data: [] }); // No existing user
    (api.post as jest.Mock).mockRejectedValue(new Error("API error"));

    renderWithProviders(<Signup />);

    // Fill form with valid data
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Signup" });
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to create account. Please try again.")
      ).toBeInTheDocument();
    });

    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Signup error:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("shows loading state during form submission", async () => {
    // Mock API to delay response
    (api.get as jest.Mock).mockResolvedValue({ data: [] });
    (api.post as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                id: 1,
                email: "new@example.com",
                createdAt: "2023-01-01",
              },
            });
          }, 100);
        })
    );

    renderWithProviders(<Signup />);

    // Fill form with valid data
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(emailInput, { target: { value: "new@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form
    const submitButton = screen.getByRole("button", { name: "Signup" });
    fireEvent.click(submitButton);

    // Check for loading state
    expect(
      screen.getByRole("button", { name: "Creating Account..." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Creating Account..." })
    ).toBeDisabled();
  });
});
