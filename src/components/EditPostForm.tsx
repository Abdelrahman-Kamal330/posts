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
    <div
      className="edit-form"
      role="dialog"
      aria-labelledby="edit-post-title"
      aria-modal="true"
    >
      <h2 id="edit-post-title">Edit Post</h2>
      <form onSubmit={handleSubmit} aria-label="Edit post form" noValidate>
        <div className="form-group">
          <label htmlFor="edit-title">Post Title</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            required
            className={errors.title ? "error" : ""}
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <div id="title-error" className="error-message" role="alert">
              {errors.title}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="edit-content">Post Content</label>
          <textarea
            id="edit-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post Content"
            className={errors.content ? "error" : ""}
            aria-invalid={errors.content ? "true" : "false"}
            aria-describedby={errors.content ? "content-error" : undefined}
            required
            aria-multiline="true"
          />
          {errors.content && (
            <div id="content-error" className="error-message" role="alert">
              {errors.content}
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="error-message" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="form-buttons" role="group" aria-label="Form actions">
          <button
            type="submit"
            className="save-btn"
            aria-label="Save post changes"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostForm;
