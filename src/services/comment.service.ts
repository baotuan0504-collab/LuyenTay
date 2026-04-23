import { apiFetch } from "./api"

export const deleteComment = async (commentId: string) => {
  return apiFetch(`/comments/${commentId}`, {
    method: "DELETE",
  })
}
