import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updatePost } from "../redux/postSlice";

const EditPostForm = ({ post, onCancel }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { title, content };
    dispatch(updatePost({ id: post.id, updatedData }));
    onCancel();
  };

  return (
    <div className="edit-form">
      <h3>Edit Post</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Post Content"
        />
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
