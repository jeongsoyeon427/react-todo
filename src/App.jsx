import { useEffect, useMemo, useState } from "react";

export default function App() {
  // ===== state =====
  const [todos, setTodos] = useState(() => {
    // 앱 시작 시 localStorage에서 복원
    const raw = localStorage.getItem("todos");
    return raw ? JSON.parse(raw) : [];
  });
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // ===== side effects =====
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // ===== handlers =====
  const addTodo = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: value, done: false, createdAt: Date.now() },
    ]);
    setText("");
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const startEdit = (id, current) => {
    setEditingId(id);
    setEditingText(current);
  };

  const saveEdit = (id) => {
    const value = editingText.trim();
    if (!value) {
      // 빈 값이면 삭제로 간주
      removeTodo(id);
    } else {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: value } : t)));
    }
    setEditingId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const removeTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  // ===== derived =====
  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "completed") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.done).length;

  // ===== UI =====
  return (
    <div className="app">
      <header>
        <h1>To-Do List</h1>
        <p className="subtitle">작고 빠른 React + Vite To-Do</p>
      </header>

      <form onSubmit={addTodo} className="add">
        <input
          type="text"
          placeholder="할 일을 입력하고 Enter"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="새 할 일"
        />
        <button type="submit">추가</button>
      </form>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="필터">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            전체
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            미완료
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            완료
          </button>
        </div>
        <div className="summary">
          남은 일: <strong>{activeCount}</strong>개
        </div>
      </div>

      <ul className="list">
        {filtered.length === 0 && (
          <li className="empty">표시할 항목이 없습니다.</li>
        )}
        {filtered.map((t) => (
          <li key={t.id} className={`item ${t.done ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleTodo(t.id)}
              aria-label="완료 토글"
            />

            {editingId === t.id ? (
              <>
                <input
                  className="editInput"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(t.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                />
                <div className="actions">
                  <button onClick={() => saveEdit(t.id)}>저장</button>
                  <button onClick={cancelEdit} className="ghost">
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <span
                  className="text"
                  onDoubleClick={() => startEdit(t.id, t.text)}
                  title="더블클릭하면 수정"
                >
                  {t.text}
                </span>
                <div className="actions">
                  <button onClick={() => startEdit(t.id, t.text)}>수정</button>
                  <button onClick={() => removeTodo(t.id)} className="danger">
                    삭제
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {todos.some((t) => t.done) && (
        <div className="footer">
          <button onClick={clearCompleted} className="ghost">
            완료 항목 모두 삭제
          </button>
        </div>
      )}
    </div>
  );
}

