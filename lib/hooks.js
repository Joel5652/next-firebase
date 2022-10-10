import { auth, firestore } from '../lib/firebase';

import { onSnapshot, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function useUserData() {
    const [user] = useAuthState(auth);

    const [username, setUsername] = useState(null);

    useEffect(() => {
        let unsubscribe;

        if (user) {
            unsubscribe = onSnapshot(
                doc(firestore, 'users', `${user.uid}`),
                doc => {
                    try {
                        setUsername(doc.data().username);
                    } catch (err) {
                        console.log('Username not defined');
                    }
                }
            );
        } else {
            setUsername(null);
        }

        return unsubscribe;
    }, [user]);

    return { user, username };
}
