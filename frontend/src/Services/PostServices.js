import api from "./api";

const PostServices = {
  getAllPosts: async () => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.get("/posts", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  likePost: async (id) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.put(`/posts/${id}/like`, null, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  createPost: async (data) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.post("/posts", data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  updatePost: async (id, data) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.put(`/posts/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  deletePost: async (id) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.delete(`/posts/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default PostServices;
