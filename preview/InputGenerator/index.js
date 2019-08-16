import UIManager from './UIElements/UIManager';
import Editor, { getSocket } from './Editor';

window.onload = () => {
  Editor();
  UIManager(getSocket());
}
