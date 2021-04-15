import { SmoothModal } from './lib/smooth-modal.js';

document.body.onclick = () => SmoothModal.alert(Math.round(Math.random() * 1000));
window.SmoothModal = SmoothModal;
SmoothModal.alert('123');
SmoothModal.alert('avadf asdjiao dj aosdjo ');
SmoothModal.alert('abcd');