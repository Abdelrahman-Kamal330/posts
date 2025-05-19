import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import EditPostForm from "../EditPostForm";
import authReducer from "../../redux/authSlice.tsx";
import postReducer from "../../redux/postSlice.tsx";

// Mock the usePostForm hook
jest.mock("../../hooks/usePostForm", () => ({
  usePostForm: jest.fn(() => ({
    title: "Test Title",
    setTitle: jest.fn(),
    content: "Test Content",
    setContent: jest.fn(),
    errors: {},
    handleSubmit: jest.fn(),
  })),
}));

// Mock the redux actions
jest.mock("../../redux/postSlice.tsx", () => {
  const originalModule = jest.requireActual("../../redux/postSlice.tsx");
  return {
    ...originalModule,
    updatePost: jest.fn(),
  };
});

describe("EditPostForm", () => {
  const mockPost = {
    id: 1,
    title: "Test Title",
    content: "Test Content",
  };

  const mockOnCancel = jest.fn();

  const renderComponent = () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        posts: postReducer,
      },
    });

    return render(
      <Provider store={store}>
        <EditPostForm post={mockPost} onCancel={mockOnCancel} />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with post data", () => {
    renderComponent();

    expect(screen.getByText("Edit Post")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Post Title")).toHaveValue("Test Title");
    expect(screen.getByPlaceholderText("Post Content")).toHaveValue(
      "Test Content"
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("submits the form with updated data", async () => {
    // We need to reset the mock before this test
    const { usePostForm } = jest.requireMock("../../hooks/usePostForm");
    const mockUpdatePost = jest
      .fn()
      .mockReturnValue({ type: "posts/updatePost" });

    // Get the updatePost mock
    const { updatePost: originalUpdatePost } = jest.requireMock(
      "../../redux/postSlice.tsx"
    );
    originalUpdatePost.mockImplementation(mockUpdatePost);

    // Update the hook mock for this test
    usePostForm.mockReturnValue({
      title: "Updated Title",
      setTitle: jest.fn(),
      content: "Updated Content",
      setContent: jest.fn(),
      errors: {},
      handleSubmit: jest.fn((e) => {
        if (e && e.preventDefault) {
          e.preventDefault();
        }
        mockUpdatePost({
          id: 1,
          updatedData: {
            title: "Updated Title",
            content: "Updated Content",
          },
        });
        return Promise.resolve();
      }),
    });

    renderComponent();

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdatePost).toHaveBeenCalledWith({
        id: 1,
        updatedData: {
          title: "Updated Title",
          content: "Updated Content",
        },
      });
    });
  });

  it("displays validation errors", () => {
    // We need to reset the mock before this test
    const { usePostForm } = jest.requireMock("../../hooks/usePostForm");

    // Update the mock for this test
    usePostForm.mockReturnValue({
      title: "",
      setTitle: jest.fn(),
      content: "",
      setContent: jest.fn(),
      errors: {
        title: "Title is required",
        content: "Content is required",
      },
      handleSubmit: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Content is required")).toBeInTheDocument();
  });
});
