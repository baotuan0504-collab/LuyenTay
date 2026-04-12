import { apiFetch } from "./api";

export const getMyReaction = async (
  targetId: string,
  targetType: string,
  token: string,
) => {
  return apiFetch(`/reactions/my?targetId=${targetId}&targetType=${targetType}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getReactionCounts = async (targetId: string, targetType: string, token?: string) => {
  return apiFetch(`/reactions/counts?targetId=${targetId}&targetType=${targetType}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const upsertReaction = async (
  targetId: string,
  targetType: string,
  reactionType: string,
  token: string,
) => {
  return apiFetch("/reactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetId, targetType, reactionType }),
  });
};

export const removeReaction = async (
  targetId: string,
  targetType: string,
  token: string,
) => {
  return apiFetch(`/reactions?targetId=${targetId}&targetType=${targetType}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getReactionUsers = async (
  targetId: string,
  targetType: string, 
)=> {
  return apiFetch(`/reactions/users?targetId=${targetId}&targetType=${targetType}`);
}