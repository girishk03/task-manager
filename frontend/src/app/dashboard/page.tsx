'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '../../lib/api';
import { 
  LogOut, Sun, Moon, Plus, Filter, Search, Grid, List as ListIcon, 
  Trash2, Edit3, CheckCircle2, Circle, Clock, ChevronRight, AlertCircle, Calendar 
} from 'lucide-react';
import { useTheme } from '../../components/ThemeProvider';
import TaskModal from '../../components/TaskModal';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Views
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    // Authenticate client-side
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      setAuthToken(null);
      router.replace('/');
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    router.replace('/');
  };

  const handleCreateOrUpdateTask = async (taskData: {
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
  }) => {
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, taskData);
      } else {
        await api.createTask(taskData);
      }
      fetchTasks();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save task');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateTask(id, { status: newStatus });
      // Update local state directly for responsive feedback
      setTasks((prev) => 
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError('Failed to delete task');
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Task count stats
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const progressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
              T
            </div>
            <span className="text-lg font-semibold tracking-tight">Caseload Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground">
              Hello, <span className="text-foreground font-semibold">{user?.name}</span>
            </span>

            <button
              onClick={toggleTheme}
              className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 mx-auto max-w-7xl w-full p-6 space-y-8 overflow-x-hidden">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={fetchTasks}
                className="underline hover:text-red-400 font-semibold cursor-pointer ml-4"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total tasks', count: totalCount, icon: Clock, color: 'text-primary' },
            { label: 'To Do', count: todoCount, icon: Circle, color: 'text-muted-foreground' },
            { label: 'In Progress', count: progressCount, icon: ChevronRight, color: 'text-amber-500' },
            { label: 'Completed', count: completedCount, icon: CheckCircle2, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <h3 className="text-2xl font-bold">{stat.count}</h3>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
            </div>
          ))}
        </section>

        {/* Filters and Actions Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-border bg-background pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none min-w-[140px]"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-border bg-background p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`rounded-lg p-2 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Kanban Board"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={handleOpenCreate}
              className="rounded-xl bg-primary text-primary-foreground py-2.5 px-4 text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </section>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border bg-card rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="h-4 bg-muted rounded-md w-1/4" />
                <div className="h-6 bg-muted rounded-md w-3/4" />
                <div className="h-16 bg-muted rounded-md w-full" />
                <div className="h-8 bg-muted rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty States */
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-card/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-1">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Create a new task to get started, or change your filters to see older tasks.
            </p>
            <button
              onClick={handleOpenCreate}
              className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Add Your First Task
            </button>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => {
              const statusTasks = filteredTasks.filter((t) => t.status === status);
              const columnTitle = status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed';
              const columnHeaderColor = status === 'TODO' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' : status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
              
              return (
                <div key={status} className="flex flex-col gap-4 bg-card/50 border border-border p-4 rounded-2xl max-h-[80vh]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${columnHeaderColor}`}>
                        {columnTitle}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">{statusTasks.length}</span>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[150px]">
                    {statusTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="bg-card border border-border hover:border-primary/40 p-5 rounded-xl shadow-sm hover:shadow-md transition-all group flex flex-col gap-3.5 animate-fade-in"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="p-1 hover:text-primary transition-colors cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Move Actions */}
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((destStatus) => (
                            <button
                              key={destStatus}
                              disabled={task.status === destStatus}
                              onClick={() => handleStatusChange(task.id, destStatus)}
                              className={`text-[9px] font-semibold py-1 rounded-md transition-all border ${task.status === destStatus ? 'bg-primary/5 text-primary/40 border-primary/10' : 'bg-background hover:bg-muted text-muted-foreground border-border hover:text-foreground cursor-pointer'}`}
                            >
                              {destStatus === 'TODO' ? 'To Do' : destStatus === 'IN_PROGRESS' ? 'Progress' : 'Done'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4 pl-6">Status</th>
                    <th className="p-4">Title & Description</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 pl-6">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="bg-background border border-border text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="font-semibold mb-0.5">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-6 text-center text-xs text-muted-foreground">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors font-medium"
        >
          Built for Digital Heroes Training Task
        </a>
      </footer>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
      />
    </div>
  );
}
