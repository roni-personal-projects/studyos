'use client';

import React, { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store/study-context';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  CheckCircle2,
  Clock,
  FastForward,
  Sparkles,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  Play,
  Pause,
  Undo2,
  Timer,
} from 'lucide-react';
import { Task } from '@/types';

export function TodaysPlan() {
  const {
    tasks,
    availableMinutes,
    setAvailableMinutes,
    completeTask,
    uncompleteTask,
    skipTask,
  } = useStudyStore();

  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Active Focus Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsTimerRunning(false);
      if (activeTimerTaskId) {
        completeTask(activeTimerTaskId);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, activeTimerTaskId, completeTask]);

  const startTimerForTask = (task: Task) => {
    if (activeTimerTaskId === task.id) {
      setIsTimerRunning(!isTimerRunning);
    } else {
      setActiveTimerTaskId(task.id);
      setTimerSecondsLeft(task.estimated_minutes * 60);
      setIsTimerRunning(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalMinutesAllocated = tasks.reduce((sum, t) => sum + t.estimated_minutes, 0);
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const completedMinutes = tasks
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + t.estimated_minutes, 0);
  const progressPct = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const getTaskIcon = (type: Task['task_type']) => {
    switch (type) {
      case 'Revision':
        return <RotateCcw className="h-4 w-4 text-indigo-500" />;
      case 'Error Review':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'Exam Prep':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Capacity Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Today&apos;s Plan
            </h2>
            <Badge variant="secondary">
              {totalMinutesAllocated} min allocated
            </Badge>
            {completedTasksCount > 0 && (
              <Badge variant="success" className="text-[10px]">
                {completedTasksCount}/{tasks.length} Done ({progressPct}%)
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Strictly prioritized from subject mastery checkpoints, exam urgency, and due revisions.
          </p>
        </div>

        {/* Available Capacity Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Capacity:
          </span>
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
            {[45, 60, 90, 120, 180].map((mins) => (
              <button
                key={mins}
                onClick={() => setAvailableMinutes(mins)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  availableMinutes === mins
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Completion Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-zinc-100/70 dark:bg-zinc-800/50 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-full max-w-xs h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-zinc-600 dark:text-zinc-300 font-medium">
              {progressPct}% ({completedMinutes}/{totalMinutesAllocated}m)
            </span>
          </div>

          {activeTimerTaskId && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-900/60">
              <Timer className="h-3.5 w-3.5 animate-pulse" />
              <span>Focus Session: {formatTimer(timerSecondsLeft)}</span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="hover:underline text-[11px] ml-1"
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            All caught up for today!
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
            No pending revisions or urgent exam topics needing attention. You can add new chapters or take a well-deserved break.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task, index) => {
            const isCompleted = task.status === 'Completed';
            const isSkipped = task.status === 'Skipped';
            const isFocusActive = activeTimerTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isCompleted
                    ? 'border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10 opacity-75'
                    : isSkipped
                    ? 'border-zinc-200/40 bg-zinc-50/50 dark:border-zinc-800/40 dark:bg-zinc-900/30 opacity-50'
                    : isFocusActive
                    ? 'border-indigo-500/80 ring-2 ring-indigo-500/20 bg-indigo-50/15 dark:bg-indigo-950/15'
                    : index === 0
                    ? 'border-zinc-900/20 bg-white shadow-xs ring-1 ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-zinc-600'
                    : 'border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      {getTaskIcon(task.task_type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          {task.subject_name}
                          {task.chapter_name ? ` · ${task.chapter_name}` : ''}
                        </span>
                        <span className="inline-flex items-center text-xs text-zinc-400">
                          • {task.estimated_minutes} min
                        </span>
                        {index === 0 && !isCompleted && !isSkipped && (
                          <Badge variant="warning" className="text-[10px] py-0">
                            Highest Urgency
                          </Badge>
                        )}
                        {task.task_type === 'Exam Prep' && (
                          <Badge variant="secondary" className="text-[10px] py-0">
                            Exam Syllabus
                          </Badge>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate ${
                          isCompleted ? 'line-through text-zinc-500 dark:text-zinc-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.priority_reason && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1 font-mono">
                          <span className="text-zinc-400">Why:</span> {task.priority_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => uncompleteTask(task.id)}
                          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 h-7 px-2"
                          title="Undo / mark as pending"
                        >
                          <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
                        </Button>
                      </div>
                    ) : isSkipped ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Skipped</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => completeTask(task.id)}
                          className="h-7 text-xs"
                        >
                          Mark Done
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Focus Timer Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startTimerForTask(task)}
                          className={`h-8 text-xs font-medium ${
                            isFocusActive
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                          title="Start focused study timer"
                        >
                          {isFocusActive && isTimerRunning ? (
                            <>
                              <Pause className="h-3 w-3 mr-1 text-indigo-600" />
                              {formatTimer(timerSecondsLeft)}
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1 text-indigo-600" />
                              Focus
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => skipTask(task.id)}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 h-8 px-2 text-xs"
                          title="Skip for now"
                        >
                          <FastForward className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => completeTask(task.id)}
                          className="h-8 text-xs font-medium"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
