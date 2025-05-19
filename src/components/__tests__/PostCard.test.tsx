import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import PostCard from "../PostCard";
import { deletePost } from "../../redux/postSlice.tsx";

// Mock the redux actions
jest.mock("../../redux/postSlice.tsx", () => ({
  deletePost: jest.fn(),
}));

// Mock the EditPostForm component
jest.mock("../EditPostForm", () => {
  return {
    __esModule: true,
    default: ({ onCancel }: { post: any; onCancel: () => void }) => (
      <div data-testid="edit-form">
        <button onClick={onCancel}>Cancel Edit</button>
      </div>
    ),
  };
});

describe("PostCard", () => {
  const mockPost = {
    id: 1,
    title: "Test Post",
    content: "This is a test post content",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders post information correctly", () => {
    renderWithProviders(<PostCard post={mockPost} />);

    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("This is a test post content")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows edit form when edit button is clicked", () => {
    renderWithProviders(<PostCard post={mockPost} />);

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByTestId("edit-form")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("hides edit form when cancel is clicked", () => {
    renderWithProviders(<PostCard post={mockPost} />);

    // Show edit form
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByTestId("edit-form")).toBeInTheDocument();

    // Cancel editing
    fireEvent.click(screen.getByText("Cancel Edit"));
    expect(screen.queryByTestId("edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("dispatches deletePost action when delete button is clicked", () => {
    const mockDeletePost = deletePost as unknown as jest.Mock;
    mockDeletePost.mockReturnValue({ type: "posts/deletePost" });

    renderWithProviders(<PostCard post={mockPost} />);

    // Mock window.confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);

    fireEvent.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this post?"
    );
    expect(mockDeletePost).toHaveBeenCalledWith(1);
  });

  it("does not dispatch deletePost when delete is canceled", () => {
    const mockDeletePost = deletePost as unknown as jest.Mock;
    mockDeletePost.mockReturnValue({ type: "posts/deletePost" });

    renderWithProviders(<PostCard post={mockPost} />);

    // Mock window.confirm to return false
    window.confirm = jest.fn().mockImplementation(() => false);

    fireEvent.click(screen.getByText("Delete"));
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this post?"
    );
    expect(mockDeletePost).not.toHaveBeenCalled();
  });
});
