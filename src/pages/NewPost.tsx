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
        <form onSubmit={handleSubmit} className="post-form" role="form">
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className={errors.title ? "error" : ""}
            />
            <div className="input-footer">
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
              <span className="char-count">
                {title.length}/{maxTitleLength}
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
            />
            <div className="input-footer">
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
              <span className="char-count">
                {content.length}/{maxContentLength}
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
