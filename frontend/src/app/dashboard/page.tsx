'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '../../lib/api';
import { 
  LogOut, Sun, Moon, Plus, Filter, Search, Grid, List as ListIcon, 
  Trash2, Edit3, CheckCircle2, Circle, Clock, ChevronRight, AlertCircle, Calendar, Sparkles
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
      setError(err.message || 'Failed to load tasks. Please verify your connection.');
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const progressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/10';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/10';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const getStatusLabelColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';
      case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md px-6 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
              T
            </div>
            <span className="text-sm font-bold tracking-tight">Caseload Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            {/* User display badge */}
            <div className="flex items-center gap-2 rounded-lg bg-muted-background border border-border px-3 py-1.5">
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center uppercase">
                {user?.name ? user.name[0] : 'G'}
              </div>
              <span className="text-xs font-semibold text-foreground max-w-[120px] truncate">
                {user?.name}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 mx-auto max-w-7xl w-full p-6 space-y-6 overflow-x-hidden animate-fade-in-up">
        {/* Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Caseload Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Monitor caseload targets, student metrics, and tasks.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={fetchTasks}
                className="underline hover:text-red-500 font-semibold cursor-pointer ml-4"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total tasks', count: totalCount, icon: Clock, color: 'text-primary', border: 'border-l-primary' },
            { label: 'To Do', count: todoCount, icon: Circle, color: 'text-muted-foreground', border: 'border-l-slate-400' },
            { label: 'In Progress', count: progressCount, icon: ChevronRight, color: 'text-amber-500', border: 'border-l-amber-500' },
            { label: 'Completed', count: completedCount, icon: CheckCircle2, color: 'text-emerald-500', border: 'border-l-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className={`bg-card border border-border border-l-4 ${stat.border} p-5 rounded-2xl flex items-center justify-between shadow-sm transition-transform duration-200 hover:scale-[1.01]`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <h3 className="text-xl font-bold tracking-tight">{stat.count}</h3>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color} opacity-85`} />
            </div>
          ))}
        </section>

        {/* Filters and Actions Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search caseload tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-sm focus-ring"
              />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-border bg-background pl-10 pr-8 py-2 text-xs font-bold text-foreground focus-ring cursor-pointer min-w-[150px] appearance-none"
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
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`rounded-md p-1.5 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="Kanban Board"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md p-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                title="List View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={handleOpenCreate}
              className="rounded-xl bg-primary text-primary-foreground py-2 px-3.5 text-xs font-bold flex items-center gap-2 hover:opacity-95 active:scale-95 shadow-md transition-all cursor-pointer"
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
                <div className="h-3 bg-muted-background rounded-md w-1/4" />
                <div className="h-5 bg-muted-background rounded-md w-3/4" />
                <div className="h-12 bg-muted-background rounded-md w-full" />
                <div className="h-6 bg-muted-background rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty States */
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-2xl bg-card/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted-background text-muted-foreground mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">No matching tasks</h3>
            <p className="text-xs text-muted-foreground max-w-xs mb-5 font-medium leading-normal">
              No caseload tasks match your query. Create a new task or adjust the filters above.
            </p>
            <button
              onClick={handleOpenCreate}
              className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Add New Task
            </button>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => {
              const statusTasks = filteredTasks.filter((t) => t.status === status);
              const columnTitle = status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed';
              const columnHeaderColor = status === 'TODO' ? 'border-t-slate-400 bg-slate-100/50 dark:bg-slate-900/30' : status === 'IN_PROGRESS' ? 'border-t-amber-500 bg-amber-50/20 dark:bg-amber-900/10' : 'border-t-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10';
              
              return (
                <div key={status} className={`flex flex-col gap-4 border border-border border-t-2 ${columnHeaderColor} p-4 rounded-2xl max-h-[80vh] shadow-sm`}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      {columnTitle}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground shadow-sm">
                      {statusTasks.length}
                    </span>
                  </div>

                  {/* Task Card List */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[180px]">
                    {statusTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="bg-card border border-border hover:border-primary/30 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col gap-3.5 animate-fade-in hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-sm tracking-tight leading-snug group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="font-medium">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted-background hover:text-primary transition-colors cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted-background hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Move Actions (low-profile segmented tabs) */}
                        <div className="flex items-center rounded-lg border border-border bg-muted-background p-0.5 mt-1">
                          {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((destStatus) => (
                            <button
                              key={destStatus}
                              disabled={task.status === destStatus}
                              onClick={() => handleStatusChange(task.id, destStatus)}
                              className={`flex-1 text-[9px] font-bold py-1.5 rounded-md transition-all ${task.status === destStatus ? 'bg-card text-primary shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground cursor-pointer'}`}
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
          /* List View (Tabular List) */
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted-background/45 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4 pl-6">Status</th>
                    <th className="p-4">Task Details</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-medium">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-muted-background/25 transition-colors group">
                      <td className="p-4 pl-6">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`text-[10px] font-bold rounded-lg px-2.5 py-1.5 focus-ring cursor-pointer ${getStatusLabelColor(task.status)}`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="font-bold text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{task.description}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs font-semibold">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-muted-background transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-muted-foreground hover:text-red-500 p-2 rounded-lg hover:bg-muted-background transition-colors cursor-pointer"
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
      <footer className="border-t border-border bg-card/20 py-5 text-center text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
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
