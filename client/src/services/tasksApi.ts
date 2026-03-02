import api from './api';
import type { Task, TaskStatus } from '../types';

export const tasksApi = {
  getAll: (status?: TaskStatus) =>
    api.get<Task[]>('/tasks', { params: status ? { status } : {} }).then((r) => r.data),

  create: (data: { title: string; description?: string }) =>
    api.post<Task>('/tasks', data).then((r) => r.data),

  update: (id: string, data: { title?: string; description?: string; status?: TaskStatus }) =>
    api.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/tasks/${id}`).then((r) => r.data),
};
