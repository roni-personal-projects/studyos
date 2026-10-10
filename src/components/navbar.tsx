'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  RotateCcw,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { AddErrorModal } from './modals/add-error-modal';

export function Navbar() {
  const pathname = usePathname();
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Exams', href: '/exams', icon: Calendar },
    { label: 'Revisions', href: '/revisions', icon: RotateCcw },
    { label: 'Error Journal', href: '/errors', icon: AlertCircle },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tighter group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                StudyOS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrorModal(true)}
              className="text-xs font-medium"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1 text-rose-500" />
              Log Mistake
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95 px-3 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-zinc-950 dark:text-zinc-50 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                )}
              >
                <Icon className={cn('h-4 w-4 mb-1', isActive && 'stroke-[2.5]')} />
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
        </div>
      </nav>

      <AddErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} />
    </>
  );
}
