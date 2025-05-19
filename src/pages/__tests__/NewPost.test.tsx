import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import NewPost from "../NewPost";

// Mock the usePostForm hook
jest.mock("../../hooks/usePostForm", () => ({
  usePostForm: jest.fn(() => ({
    title: "",
    setTitle: jest.fn(),
    content: "",
    setContent: jest.fn(),
    isSubmitting: false,
    errors: {},
    handleSubmit: jest.fn(),
    maxTitleLength: 100,
    maxContentLength: 2000,
  })),
}));

// Mock the redux actions
jest.mock("../../redux/postSlice", () => ({
  createPost: jest.fn(),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("NewPost Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the new post form correctly", () => {
    renderWithProviders(<NewPost />);

    expect(screen.getByText("Create New Post")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter a descriptive title...")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your post content here...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Post" })
    ).toBeInTheDocument();
    expect(screen.getByText("0/100")).toBeInTheDocument(); // Character count for title
    expect(screen.getByText("0/2000")).toBeInTheDocument(); // Character count for content
  });

  it("displays validation errors", () => {
    // Update the mock to return errors
    const usePostFormMock = require("../../hooks/usePostForm").usePostForm;
    usePostFormMock.mockReturnValue({
      title: "",
      setTitle: jest.fn(),
      content: "",
      setContent: jest.fn(),
      isSubmitting: false,
      errors: {
        title: "Title is required",
        content: "Content is required",
      },
      handleSubmit: jest.fn(),
      maxTitleLength: 100,
      maxContentLength: 2000,
    });

    renderWithProviders(<NewPost />);

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();
  });

  it("shows loading state when submitting", () => {
    // Update the mock to show loading state
    const usePostFormMock = require("../../hooks/usePostForm").usePostForm;
    usePostFormMock.mockReturnValue({
      title: "Test Title",
      setTitle: jest.fn(),
      content: "Test Content",
      setContent: jest.fn(),
      isSubmitting: true,
      errors: {},
      handleSubmit: jest.fn(),
      maxTitleLength: 100,
      maxContentLength: 2000,
    });

    renderWithProviders(<NewPost />);

    expect(
      screen.getByRole("button", { name: "Creating..." })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Creating..." })).toBeDisabled();
  });

  it("calls handleSubmit when form is submitted", () => {
    const handleSubmitMock = jest.fn((e) => e.preventDefault());

    // Update the mock to include handleSubmit
    const usePostFormMock = require("../../hooks/usePostForm").usePostForm;
    usePostFormMock.mockReturnValue({
      title: "Test Title",
      setTitle: jest.fn(),
      content: "Test Content",
      setContent: jest.fn(),
      isSubmitting: false,
      errors: {},
      handleSubmit: handleSubmitMock,
      maxTitleLength: 100,
      maxContentLength: 2000,
    });

    renderWithProviders(<NewPost />);

    // Submit the form
    fireEvent.submit(screen.getByRole("form"));

    expect(handleSubmitMock).toHaveBeenCalled();
  });

  it("updates title and content when typing", () => {
    const setTitleMock = jest.fn();
    const setContentMock = jest.fn();

    // Update the mock to include setTitle and setContent
    const usePostFormMock = require("../../hooks/usePostForm").usePostForm;
    usePostFormMock.mockReturnValue({
      title: "Test Title",
      setTitle: setTitleMock,
      content: "Test Content",
      setContent: setContentMock,
      isSubmitting: false,
      errors: {},
      handleSubmit: jest.fn(),
      maxTitleLength: 100,
      maxContentLength: 2000,
    });

    renderWithProviders(<NewPost />);

    // Type in the title field
    fireEvent.change(
      screen.getByPlaceholderText("Enter a descriptive title..."),
      {
        target: { value: "New Title" },
      }
    );

    // Type in the content field
    fireEvent.change(
      screen.getByPlaceholderText("Write your post content here..."),
      {
        target: { value: "New Content" },
      }
    );

    expect(setTitleMock).toHaveBeenCalledWith("New Title");
    expect(setContentMock).toHaveBeenCalledWith("New Content");
  });
});
