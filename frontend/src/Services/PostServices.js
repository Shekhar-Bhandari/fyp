import api from './api';

const PostServices = {
  getAllPosts: async () => await api.get('/posts'),
  createPost: async (data) => await api.post('/posts', data),
  updatePost: async (id, data) => await api.put(`/posts/${id}`, data),
  deletePost: async (id) => await api.delete(`/posts/${id}`),
};

export default PostServices;
