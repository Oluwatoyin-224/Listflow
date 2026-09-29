import { useState } from 'react';
import { Layout, type View } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { TasksView } from '@/components/TasksView';
import { NotesView } from '@/components/NotesView';
import { ToastProvider } from '@/context/ToastContext';

function App() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <ToastProvider>
      <Layout currentView={view} onViewChange={setView}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'tasks' && <TasksView />}
        {view === 'notes' && <NotesView />}
      </Layout>
    </ToastProvider>
  );
}

export default App;
