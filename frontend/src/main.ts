import { createApplication } from './app/create-application';
import './app/style.css';

const root = document.querySelector('#app');

if (root) {
  createApplication().mount(root);
}
