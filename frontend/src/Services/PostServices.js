import api from "./api";

const PostServices = {
  getAllPosts: async (specialization = "") => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    const token = user?.token;
    let url = "/posts";
    if (specialization) url += `?specialization=${encodeURIComponent(specialization)}`;
    return await api.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  
  getMyPosts: async () => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    return await api.get("/posts/my-posts", {
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

  // ⭐️ NEW FUNCTION FOR COMMENTS ⭐️
  addComment: async (postId, text) => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    if (!token) throw new Error("Authentication token is missing.");

    return await api.post(`/posts/${postId}/comment`, { text }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};


export default PostServices;