import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    limit,
    getDoc,
    orderBy,
    collectionGroup,
    Timestamp,
    startAfter,
    doc,
    setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyD-nnBqLhGgBKNa9_tMhu6qcv0-gYcxqOY',
    authDomain: 'nextfire-af0a7.firebaseapp.com',
    projectId: 'nextfire-af0a7',
    storageBucket: 'nextfire-af0a7.appspot.com',
    messagingSenderId: '104336723077',
    appId: '1:104336723077:web:bf10afd06d4555a3d76dec',
    measurementId: 'G-CS1KF5EVFF',
};

const app = initializeApp({ ...firebaseConfig });

export const storage = getStorage(app);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
export const Collection = collection;
export const GetDocs = getDoc;

export const signInWithPopUp = signInWithPopup;

//Helper functions

export async function getUserWithUsername(username) {
    const userQuery = query(
        collection(firestore, 'users'),
        where('username', '==', username),
        limit(1)
    );
    const querySnapshot = (await getDocs(userQuery)).docs[0]; // would normally return array

    return querySnapshot; //returns snapshot of document rather than data so that other functions can acces things like the ID of the document etc.
}

export async function getUserPosts(userDoc, admin) {
    let postsQuery;

    if (admin) {
        postsQuery = query(
            collection(firestore, 'users', userDoc.id, 'posts'),
            orderBy('createdAt', 'desc')
        );
    } else {
        postsQuery = query(
            collection(firestore, 'users', userDoc.id, 'posts'),
            where('published', '==', true),
            limit(5),
            orderBy('createdAt', 'desc')
        );
    }
    //return value is array of posts data after being parsed as JSON.
    //!Originally, it is array of SNAPSHOTS of document not data.
    const querySnapshot = (await getDocs(postsQuery)).docs.map(postToJSON);

    return querySnapshot;
}

export async function getSlugPost(userDoc, slug, noJSON) {
    const postQuery = doc(firestore, 'users', userDoc.id, 'posts', slug);

    let querySnapshot = noJSON
        ? await getDoc(postQuery)
        : postToJSON(await getDoc(postQuery));

    if (querySnapshot.uid === userDoc.id) {
        return querySnapshot; //returns
    } else {
        return null;
    }
}

//Collection group querys - get all posts

export async function getRecentPosts(LIMIT) {
    const postsQuery = query(
        collectionGroup(firestore, 'posts'),
        where('published', '==', true),
        limit(LIMIT),
        orderBy('createdAt', 'desc')
    );

    const querySnapshot = (await getDocs(postsQuery)).docs.map(postToJSON);

    return querySnapshot; //return array of posts data after parsing to JSON
}

export async function getAllPosts() {
    const postsQuery = query(collectionGroup(firestore, 'posts'));
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot; //array of all posts snapshots
}

export async function loadMorePosts(lastPost, LIMIT) {
    const cursor =
        typeof lastPost.createdAt === 'number'
            ? (lastPost.createdAt = Timestamp.fromMillis(lastPost.createdAt))
            : lastPost.createdAt;

    const postsQuery = query(
        collectionGroup(firestore, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(LIMIT),
        startAfter(cursor)
    );

    const querySnapshot = (await getDocs(postsQuery)).docs.map(doc =>
        doc.data()
    );

    return querySnapshot; //returns array of post data.
}

export async function getAllComments(userID, slug) {
    console.log(userID, slug);
    const commentQuery = query(
        collection(firestore, 'users', userID, 'posts', slug, 'comments')
    );

    const commentsSnapshot = (await getDocs(commentQuery)).docs.map(doc => {
        let data = doc.data();

        return {
            ...data,
        };
    });

    return commentsSnapshot;
}

export function postToJSON(doc) {
    const data = doc.data();
    // x = Timestamp.fromMillis(x);

    return {
        ...data,
        createdAt: data?.createdAt.toMillis() || 0,
        updatedAt: data?.updatedAt.toMillis() || 0,
    };
}

//Adding docs

export async function addDocument(data, userID, slug) {
    await setDoc(doc(firestore, 'users', userID, 'posts', slug), data);
}

//updating doc
