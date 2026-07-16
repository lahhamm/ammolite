import { createRoot } from 'react-dom/client';
import { App } from './App';
import { connect } from './ws';
import './os.css';

connect();

createRoot(document.getElementById('root')!).render(<App />);
