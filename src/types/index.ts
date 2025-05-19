// Define interfaces for the application

// Post interface
export interface Post {
  id: number;
  title: string;
  content: string;
}

// User interface
export interface User {
  id: number;
  email: string;
  createdAt: string;
}

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Posts state interface
export interface PostsState {
  posts: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Root state interface
export interface RootState {
  auth: AuthState;
  posts: PostsState;
}

// Form errors interface
export interface FormErrors {
  [key: string]: string;
}
