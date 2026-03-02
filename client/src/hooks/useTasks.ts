import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { tasksApi } from '../services/tasksApi';
import type { Task, TaskStatus } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, description: string) => {
    const task = await tasksApi.create({ title, description });
    setTasks((prev) => [task, ...prev]);
    toast.success('Task added');
    return task;
  };

  const toggleStatus = async (task: Task) => {
    const next: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: next } : t)));
    try {
      await tasksApi.update(task._id, { status: next });
    } catch {
      // Revert on failure
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t)));
      toast.error('Failed to update task');
    }
  };

  const removeTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await tasksApi.remove(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
      fetchTasks(); // re-sync on failure
    }
  };

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return { tasks: filteredTasks, allTasks: tasks, loading, filter, setFilter, addTask, toggleStatus, removeTask };
}
