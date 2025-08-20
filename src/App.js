// App.js
import Layout from './components/common/Layout';
import { ToastProvider } from './hooks/useToast';

function App() {
  return (
    <ToastProvider>
      <Layout />
    </ToastProvider>
  );
}

export default App;