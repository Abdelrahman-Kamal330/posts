import React, { useState } from "react";
import { useAppDispatch } from "../redux/hook.ts";
import { deletePost } from "../redux/postSlice.tsx";
import EditPostForm from "./EditPostForm.tsx";
import type { Post } from "../types/index.ts";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(post.id));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="post-card">
      {isEditing ? (
        <EditPostForm post={post} onCancel={handleCancelEdit} />
      ) : (
        <>
          <div className="post-header">
            <h2>{post.title}</h2>
            <div className="post-actions">
              <button className="edit-btn" onClick={handleEdit}>
                Edit
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
          <p>{post.content}</p>
        </>
      )}
    </div>
  );
};

export default PostCard;
