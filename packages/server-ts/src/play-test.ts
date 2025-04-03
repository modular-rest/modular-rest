import { createRest } from './application';

const app = createRest({
  adminUser: {
    email: 'admin@example.com',
    password: 'password',
  },
});
