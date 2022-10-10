import AuthCheck from '../../../components/AuthCheck';
import {
    addDocument,
    getUserPosts,
    getUserWithUsername,
    auth,
} from '../../../lib/firebase';
import { UserContext } from '../../../lib/context';
import PostFeed from '../../../components/PostFeed';
import { serverTimestamp } from 'firebase/firestore';

import styles from '../../../styles/Admin.module.css';

import kebabCase from 'lodash.kebabcase';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export async function getServerSideProps({ params }) {
    const { username } = params;

    const userDoc = await getUserWithUsername(username);

    const posts = await getUserPosts(userDoc, true);

    return {
        props: { posts },
    };
}

export default function AdminPostsPage({ posts }) {
    return (
        <main>
            <AuthCheck>
                <PostList posts={posts} />
            </AuthCheck>
        </main>
    );
}

function PostList({ posts }) {
    return (
        <>
            <h1>Manage your posts</h1>
            <PostFeed
                posts={posts}
                admin
            />
            <CreateNewPost />
        </>
    );
}

function CreateNewPost() {
    const router = useRouter();
    const { user, username } = useContext(UserContext);
    const [title, setTitle] = useState('');

    const slug = encodeURI(kebabCase(title));

    const isValid = title.length > 3 && title.length < 100;

    const createPost = async e => {
        e.preventDefault();
        const uid = user.uid;

        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            content: 'Hello world!',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartCount: 0,
        };

        await addDocument(data, uid, slug);

        toast.success('Post created!');

        router.push(`/admin/${slug}`);
    };

    return (
        <form onSubmit={createPost}>
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='My new Article!'
                className={styles.input}
            />
            <p>
                <strong>Slug:</strong> {slug}
            </p>
            <button
                type='submit'
                disabled={!isValid}
                className='btn-green'
            >
                Create new post
            </button>
        </form>
    );
}
