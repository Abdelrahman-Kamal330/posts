import React from "react";
import type { Post } from "../types/index.ts";
import { usePostForm } from "../hooks/usePostForm";

interface EditPostFormProps {
  post: Post;
  onCancel: () => void;
}

const EditPostForm: React.FC<EditPostFormProps> = ({ post, onCancel }) => {
  const { title, setTitle, content, setContent, errors, handleSubmit } =
    usePostForm({
      initialData: post,
      onSuccess: onCancel,
      isEdit: true,
    });

  return (
    <div className="edit-form">
      <h3>Edit Post</h3>
      <form onSubmit={handleSubmit} role="form">
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            className={errors.title ? "error" : ""}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post Content"
            className={errors.content ? "error" : ""}
          />
          {errors.content && (
            <div className="error-message">{errors.content}</div>
          )}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-buttons">
          <button type="submit" className="save-btn">
            Save
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostForm;
