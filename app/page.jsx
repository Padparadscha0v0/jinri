'use client';

import React, { useEffect, useMemo, useState } from 'react';

const PRIORITY_ORDER = { 高: 0, 中: 1, 低: 2 };
const POEMS = [
  '明月松间照，清泉石上流',
  '行到水穷处，坐看云起时',
  '采菊东篱下，悠然见南山',
];

function getEmoji(text) {
  if (text.includes('学习') || text.includes('背')) return '📚';
  if (text.includes('实验')) return '🧪';
  if (text.includes('运动')) return '🏃';
  if (text.includes('吃')) return '🍽️';
  return '📝';
}

export default function TodoApp() {
  const STORAGE_KEY = 'student-todo-lite';

  const [input, setInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('中');
  const [todos, setTodos] = useState([]);
  const [expandedNotes, setExpandedNotes] = useState({});
  const noteRef = React.useRef(null);
  const [poem, setPoem] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to read todos:', e);
    }

    const randomPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
    setPoem(randomPoem);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  }, [todos]);

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.id - a.id;
    });
  }, [todos]);

  const counts = useMemo(() => ({
    all: todos.length,
    todo: todos.filter(t => t.status === '未开始').length,
    doing: todos.filter(t => t.status === '进行中').length,
    done: todos.filter(t => t.status === '已完成').length,
  }), [todos]);

  function addTodo() {
    const text = input.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now(),
      text,
      emoji: getEmoji(text),
      note: noteInput.trim(),
      priority: priorityInput,
      status: '未开始',
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInput('');
    setNoteInput('');
    setPriorityInput('中');
  }

  function updateStatus(id, status) {
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, status } : todo));
  }

  function updatePriority(id, priority) {
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, priority } : todo));
  }

  function updateNote(id, note) {
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, note } : todo));
  }

  function removeTodo(id) {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }

  function toggleNote(id) {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addTodo();
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-[rgb(211,218,196)] p-6 shadow-sm">
        <div className="mb-4 flex items-end gap-3">
          <h1 className="text-3xl font-bold text-green-900">今日记</h1>
          <p className="pb-1 ml-2 text-sm text-[rgb(76,79,74)]">{poem}</p>
        </div>

        {/* 输入区 */}
        <div className="mb-3">
          <div className="flex gap-3 items-stretch">
            <div className="flex-1 space-y-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入待办事项"
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
              />

              <textarea
                ref={noteRef}
                value={noteInput}
                onChange={(e) => {
                  setNoteInput(e.target.value);
                  const el = noteRef.current;
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                placeholder="可选备注"
                rows={1}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none resize-none overflow-hidden focus:border-green-500"
              />
            </div>

            <div className="flex flex-col w-32">
              <select
                value={priorityInput}
                onChange={(e) => setPriorityInput(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="高">高优先级</option>
                <option value="中">中优先级</option>
                <option value="低">低优先级</option>
              </select>

              <div className="flex-1" />

              <button
                onClick={addTodo}
                className="w-full rounded-2xl bg-[rgb(171,170,120)] px-4 py-3 text-sm font-medium text-white hover:bg-[rgb(150,150,100)]"
              >
                添加
              </button>

              <div className="flex-1" />
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(counts).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-gray-200 p-3 bg-white">
              <div className="text-xs text-green-600">
                {key === 'all' ? '全部' : key === 'todo' ? '未开始' : key === 'doing' ? '进行中' : '已完成'}
              </div>
              <div className="text-xl font-semibold text-green-900">{value}</div>
            </div>
          ))}
        </div>

        {/* 列表 */}
        <div className="mb-4 text-3xl font-bold tracking-tight text-green-900">清单</div>
        <div className="space-y-3">
          {sortedTodos.map((todo) => (
            <div key={todo.id} className="relative rounded-2xl border border-gray-200 bg-white p-3 group hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{todo.emoji}</span>
                  <p className="text-lg font-semibold">{todo.text}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleNote(todo.id)}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-white"
                  >
                    {expandedNotes[todo.id] ? '收起备注' : '显示备注'}
                  </button>

                  <select
                    value={todo.priority}
                    onChange={(e) => updatePriority(todo.id, e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 outline-none"
                  >
                    <option>高</option>
                    <option>中</option>
                    <option>低</option>
                  </select>

                  <select
                    value={todo.status}
                    onChange={(e) => updateStatus(todo.id, e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-green-900 outline-none"
                  >
                    <option>未开始</option>
                    <option>进行中</option>
                    <option>已完成</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => removeTodo(todo.id)}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 rounded-full border border-gray-300 bg-white w-6 h-6 flex items-center justify-center text-green-700 hover:bg-gray-200"
              >
                ✕
              </button>

              {expandedNotes[todo.id] && (
                <textarea
                  value={todo.note || ''}
                  onChange={(e) => updateNote(todo.id, e.target.value)}
                  className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
