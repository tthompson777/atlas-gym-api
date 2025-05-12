import admin from 'firebase-admin';
import * as serviceAccount from '../config/firebase-admin-key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

export { admin };
