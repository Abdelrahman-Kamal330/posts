import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hook.ts";
import { fetchPosts } from "../redux/postSlice.tsx";
import PostCard from "../components/PostCard.tsx";
import type { RootState } from "../types";

const Posts: React.FC = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state: RootState) => state.posts.posts);
  const isLoading = useAppSelector(
    (state: RootState) => state.posts.status === "loading"
  );

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div>
      <h1>Posts</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
