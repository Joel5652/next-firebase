import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, writeBatch, increment } from 'firebase/firestore';

import { auth, firestore } from '../lib/firebase';

import Link from 'next/link';

export default function HeartButton({ postRef }) {
    let reference;
    try {
        reference = doc(
            firestore,
            'users',
            postRef.uid,
            'posts',
            postRef.slug,
            'hearts',
            auth.currentUser.uid
        );
    } catch (err) {
        console.log('Reference not found');
        reference = null;
    }

    const [value] = useDocumentData(reference);

    //return snapshot of said document. if exists user has already hearted.

    const addHeart = async () => {
        const uid = auth.currentUser.uid;

        const batch = writeBatch(firestore);

        batch.update(
            doc(firestore, 'users', postRef.uid, 'posts', postRef.slug),
            {
                heartCount: increment(1),
            }
        );

        batch.set(
            doc(
                firestore,
                'users',
                postRef.uid,
                'posts',
                postRef.slug,
                'hearts',
                auth.currentUser.uid
            ),
            { uid }
        );

        await batch.commit();
    };

    const removeHeart = async () => {
        const batch = writeBatch(firestore);

        batch.update(
            doc(firestore, 'users', postRef.uid, 'posts', postRef.slug),
            { heartCount: increment(-1) }
        );
        batch.delete(
            doc(
                firestore,
                'users',
                postRef.uid,
                'posts',
                postRef.slug,
                'hearts',
                auth.currentUser.uid
            )
        );

        await batch.commit();
    };

    let uid = null;
    try {
        uid = auth.currentUser.uid;
    } catch (err) {
        console.log('no user');
    }

    if (uid === null) {
        return (
            <Link href={`/enter`}>
                <button>Sign in</button>
            </Link>
        );
    } else {
        return value != undefined ? (
            <button onClick={removeHeart}>Un-Like (Is this a word?)</button>
        ) : (
            <button onClick={addHeart}>Like</button>
        );
    }
}
