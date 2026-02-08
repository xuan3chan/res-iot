export const KAFKA_TOPICS = {
  AUTH: {
    LOGIN: 'auth.login',
    REGISTER: 'auth.register',
    USER_LOGIN: 'auth.user.login',
    USER_REGISTER: 'auth.user.register',
    LOGOUT: 'auth.logout',
    FACE_LOGIN: 'auth.face.login',
  },
  USER: {
    CREATE: 'user.create',
    FIND_ALL: 'user.find_all',
    FIND_ONE: 'user.find_one',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    REGISTER_FACE: 'user.register_face',
    VERIFY_FACE: 'user.verify_face',
  },
  ADMIN: {
    CREATE: 'admin.create',
    FIND_ALL: 'admin.find_all',
    FIND_ONE: 'admin.find_one',
    UPDATE: 'admin.update',
    DELETE: 'admin.delete',
    REGISTER_FACE: 'admin.register_face',
  },
  SCAN: {
    TARGET: {
      CREATE: 'scan.target.create',
      FIND_ALL: 'scan.target.find_all',
    },
    SCAN: {
      CREATE: 'scan.create',
      FIND_ALL: 'scan.find_all',
      FIND_ONE: 'scan.find_one',
      GET_REPORT: 'scan.get_report',
    },
    SCAN_JOB: {
      START: 'scan.job.start',
    },
  },
} as const;
