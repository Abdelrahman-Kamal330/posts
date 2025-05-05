import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createPost } from "../redux/postSlice";
import { useNavigate } from "react-router-dom";

const NewPost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 2000;

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content.trim()) newErrors.content = "Content is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newPost = { title, content };
      await dispatch(createPost(newPost)).unwrap();
      navigate("/posts");
    } catch (error) {
      console.error("Failed to create post:", error);
      setErrors({ submit: "Failed to create post. Please try again." });
      setIsSubmitting(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
              }
              placeholder="Enter a descriptive title..."
              className={errors.title ? "error" : ""}
            />
            <div className="input-footer">
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
              <span className="char-count">
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Post Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) =>
                setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))
              }
              placeholder="Write your post content here..."
              className={errors.content ? "error" : ""}
              rows="12"
            />
            <div className="input-footer">
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
              <span className="char-count">
                {content.length}/{MAX_CONTENT_LENGTH}
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
