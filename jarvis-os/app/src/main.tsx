import { createRoot } from 'react-dom/client';
import { App } from './App';
import { connect, startHealthPolling } from './ws';
import './os.css';

connect();
startHealthPolling();

createRoot(document.getElementById('root')!).render(<App />);
