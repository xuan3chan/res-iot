export const KAFKA_TOPICS = {
  AUTH: {
    LOGIN: 'auth.admin_login',
    LOGOUT: 'auth.logout',
    REGISTER: 'auth.admin_register',
    USER_LOGIN: 'auth.user_login',
    USER_REGISTER: 'auth.user_register',
  },
  USER: {
    CREATE: 'user.create',
    FIND_ALL: 'user.findAll',
    FIND_ONE: 'user.findOne',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    REGISTER_FACE: 'user.register-face',
    VERIFY_FACE: 'user.verify-face',
  },
  ADMIN: {
    CREATE: 'admin.create',
    FIND_ALL: 'admin.findAll',
    FIND_ONE: 'admin.findOne',
    UPDATE: 'admin.update',
    DELETE: 'admin.delete',
  },
} as const;
