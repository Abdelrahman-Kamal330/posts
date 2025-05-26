import React from "react";
import { useNavigate } from "react-router-dom";
import { usePostForm } from "../hooks/usePostForm";

const NewPost: React.FC = () => {
  const navigate = useNavigate();

  const {
    title,
    setTitle,
    content,
    setContent,
    isSubmitting,
    errors,
    handleSubmit,
    maxTitleLength,
    maxContentLength,
  } = usePostForm({
    onSuccess: () => navigate("/posts"),
    maxTitleLength: 100,
    maxContentLength: 2000,
  });

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm("Are you sure you want to discard this post?")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="new-post-container">
      <div className="new-post-header">
        <h1>Create New Post</h1>
      </div>

      <div className="post-form-container">
        <form
          onSubmit={handleSubmit}
          className="post-form"
          aria-label="Create new post form"
        >
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className={errors.title ? "error" : ""}
              aria-required="true"
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby="title-error title-count"
              maxLength={maxTitleLength}
            />
            <div className="input-footer">
              {errors.title && (
                <span id="title-error" className="error-message" role="alert">
                  {errors.title}
                </span>
              )}
              <span id="title-count" className="char-count" aria-live="polite">
                {title.length}/{maxTitleLength} characters remaining
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Post Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className={errors.content ? "error" : ""}
              rows={12}
              aria-required="true"
              aria-invalid={errors.content ? "true" : "false"}
              aria-describedby="content-error content-count"
              maxLength={maxContentLength}
            />
            <div className="input-footer">
              {errors.content && (
                <span id="content-error" className="error-message" role="alert">
                  {errors.content}
                </span>
              )}
              <span
                id="content-count"
                className="char-count"
                aria-live="polite"
              >
                {content.length}/{maxContentLength} characters remaining
              </span>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
