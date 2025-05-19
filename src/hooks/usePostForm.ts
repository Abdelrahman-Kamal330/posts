import { useState, type FormEvent } from "react";
import { useAppDispatch } from "../redux/hook";
import { updatePost, createPost } from "../redux/postSlice";
import type { Post } from "../types";

interface PostFormData {
  title: string;
  content: string;
}

interface UsePostFormProps {
  initialData?: Post;
  onSuccess?: () => void;
  isEdit?: boolean;
  maxTitleLength?: number;
  maxContentLength?: number;
}

export const usePostForm = ({
  initialData,
  onSuccess,
  isEdit = false,
  maxTitleLength = 100,
  maxContentLength = 2000,
}: UsePostFormProps = {}) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [content, setContent] = useState<string>(initialData?.content || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTitleChange = (value: string) => {
    setTitle(value.slice(0, maxTitleLength));
  };

  const handleContentChange = (value: string) => {
    setContent(value.slice(0, maxContentLength));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: PostFormData = { title, content };

      if (isEdit && initialData) {
        await dispatch(
          updatePost({ id: initialData.id, updatedData: formData })
        ).unwrap();
      } else {
        await dispatch(createPost(formData)).unwrap();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      setErrors({ submit: "Failed to save post. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle: handleTitleChange,
    content,
    setContent: handleContentChange,
    isSubmitting,
    errors,
    handleSubmit,
    validateForm,
    maxTitleLength,
    maxContentLength,
  };
};
