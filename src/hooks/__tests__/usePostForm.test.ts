import { renderHook, act } from "@testing-library/react";
import { usePostForm } from "../usePostForm";
import { createPost, updatePost } from "../../redux/postSlice.tsx";

// Mock the redux hooks
jest.mock("../../redux/hook", () => ({
  useAppDispatch: jest.fn(() =>
    jest.fn(() => ({ unwrap: () => Promise.resolve() }))
  ),
}));

// Mock the redux actions
jest.mock("../../redux/postSlice.tsx", () => ({
  createPost: jest.fn(() => ({ unwrap: () => Promise.resolve() })),
  updatePost: jest.fn(() => ({ unwrap: () => Promise.resolve() })),
}));

describe("usePostForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePostForm());

    expect(result.current.title).toBe("");
    expect(result.current.content).toBe("");
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("should initialize with provided values", () => {
    const initialData = { id: 1, title: "Test Title", content: "Test Content" };
    const { result } = renderHook(() => usePostForm({ initialData }));

    expect(result.current.title).toBe("Test Title");
    expect(result.current.content).toBe("Test Content");
  });

  it("should update title and content", () => {
    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.setTitle("New Title");
      result.current.setContent("New Content");
    });

    expect(result.current.title).toBe("New Title");
    expect(result.current.content).toBe("New Content");
  });

  it("should validate form and return errors for empty fields", () => {
    const { result } = renderHook(() => usePostForm());

    let isValid;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors).toEqual({
      title: "Title is required",
      content: "Content is required",
    });
  });

  it("should validate form and return true for valid fields", () => {
    const { result } = renderHook(() => usePostForm());

    act(() => {
      result.current.setTitle("Valid Title");
      result.current.setContent("Valid Content");
    });

    let isValid;
    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("should call createPost when submitting a new post", async () => {
    const mockCreatePost = createPost as unknown as jest.Mock;
    mockCreatePost.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePostForm({ onSuccess }));

    act(() => {
      result.current.setTitle("New Post");
      result.current.setContent("New Content");
    });

    await act(async () => {
      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;
      await result.current.handleSubmit(event);
    });

    expect(mockCreatePost).toHaveBeenCalledWith({
      title: "New Post",
      content: "New Content",
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should call updatePost when editing an existing post", async () => {
    const mockUpdatePost = updatePost as unknown as jest.Mock;
    mockUpdatePost.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });

    const initialData = {
      id: 1,
      title: "Original Title",
      content: "Original Content",
    };
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      usePostForm({ initialData, onSuccess, isEdit: true })
    );

    act(() => {
      result.current.setTitle("Updated Title");
      result.current.setContent("Updated Content");
    });

    await act(async () => {
      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;
      await result.current.handleSubmit(event);
    });

    expect(mockUpdatePost).toHaveBeenCalledWith({
      id: 1,
      updatedData: {
        title: "Updated Title",
        content: "Updated Content",
      },
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle errors during submission", async () => {
    // Mock createPost to return a rejected promise
    const mockCreatePost = createPost as unknown as jest.Mock;
    mockCreatePost.mockImplementation(() => ({
      unwrap: jest.fn().mockRejectedValue(new Error("Failed to save")),
    }));

    // Mock the dispatch function
    const mockDispatch = jest.fn(() => ({
      unwrap: jest.fn().mockRejectedValue(new Error("Failed to save")),
    }));

    // Mock the useAppDispatch hook
    const { useAppDispatch } = require("../../redux/hook");
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => usePostForm({ onSuccess }));

    act(() => {
      result.current.setTitle("New Post");
      result.current.setContent("New Content");
    });

    await act(async () => {
      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>;
      await result.current.handleSubmit(event);
    });

    // The onSuccess should not be called when there's an error
    expect(onSuccess).not.toHaveBeenCalled();

    // Check for the error message
    expect(result.current.errors.submit).toBe(
      "Failed to save post. Please try again."
    );
  });
});
