import Application from '@/index';

const app = document.getElementById('app');

if (!app) {
    throw new Error('no app found');
}

Application(app);
