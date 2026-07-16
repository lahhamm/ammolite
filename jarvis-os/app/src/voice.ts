/** VoiceIO — free stack: Web Speech API in, speechSynthesis out.
 *  Abstracted so a premium voice (ElevenLabs etc.) can replace `speak` later. */

import { setState, getState } from './store';
import { pulse } from './sphereBus';

// ---------- TTS ----------

let voice: SpeechSynthesisVoice | null = null;
const PREFERRED = ['Daniel', 'Arthur', 'Google UK English Male', 'Alex', 'Samantha'];

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  for (const name of PREFERRED) {
    const found = voices.find((v) => v.name.startsWith(name) && v.lang.startsWith('en'));
    if (found) {
      voice = found;
      return;
    }
  }
  voice = voices.find((v) => v.lang.startsWith('en')) ?? voices[0];
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speakable(text: string): string {
  let t = text
    .replace(/```[\s\S]*?```/g, ' — code on screen — ')
    .replace(/[*_#>`~|]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'a link')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > 550) {
    const cut = t.slice(0, 550);
    const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    t = (stop > 200 ? cut.slice(0, stop + 1) : cut) + ' The rest is on screen.';
  }
  return t;
}

export function speak(text: string) {
  if (typeof speechSynthesis === 'undefined') return;
  const t = speakable(text);
  if (!t) return;
  stopListening(); // never listen to ourselves
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(t);
  if (voice) utterance.voice = voice;
  utterance.rate = 1.04;
  utterance.pitch = 0.92;
  utterance.onstart = () => setState({ speaking: true });
  utterance.onboundary = () => pulse();
  const done = () => setState({ speaking: false });
  utterance.onend = done;
  utterance.onerror = done;
  speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  setState({ speaking: false });
}

// ---------- STT ----------

type STT = {
  start(): void;
  stop(): void;
  abort(): void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } };
}

const SR: (new () => STT) | undefined =
  (window as unknown as { SpeechRecognition?: new () => STT; webkitSpeechRecognition?: new () => STT })
    .SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: new () => STT }).webkitSpeechRecognition;

export const sttSupported = Boolean(SR);

let recognition: STT | null = null;
let heard = '';
let onFinalText: ((text: string) => void) | null = null;

export function setDirectiveHandler(fn: (text: string) => void) {
  onFinalText = fn;
}

export function startListening() {
  if (!SR || getState().listening) return;
  stopSpeaking(); // barge-in: talking to Jarvis interrupts him
  heard = '';
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (final) heard += final;
    setState({ interim: (heard + ' ' + interim).trim() });
  };
  recognition.onerror = () => {
    setState({ listening: false, interim: '' });
  };
  recognition.onend = () => {
    const text = (heard || getState().interim).trim();
    setState({ listening: false, interim: '' });
    heard = '';
    if (text && onFinalText) onFinalText(text);
  };
  recognition.start();
  setState({ listening: true, interim: '' });
}

export function stopListening() {
  if (recognition) {
    try {
      recognition.stop();
    } catch {
      // already stopped
    }
    recognition = null;
  }
}
