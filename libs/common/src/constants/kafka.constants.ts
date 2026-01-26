export const KAFKA_TOPICS = {
    AUTH: {
        LOGIN: 'auth.login',
        LOGOUT: 'auth.logout',
    },
    USER: {
        CREATE: 'user.create',
        FIND_ALL: 'user.findAll',
        FIND_ONE: 'user.findOne',
        UPDATE: 'user.update',
        DELETE: 'user.delete',
        REGISTER_FACE: 'user.register-face',
        VERIFY_FACE: 'user.verify-face',
    }
} as const;
