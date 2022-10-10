import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';

import Loader from '../components/Loader';
import { getRecentPosts, loadMorePosts } from '../lib/firebase';
import PostFeed from '../components/PostFeed';

const LIMIT = 8;

export async function getServerSideProps(query) {
    const posts = await getRecentPosts(LIMIT);

    return {
        props: { posts },
    };
}

export default function Home(props) {
    const [posts, setPosts] = useState(props.posts);
    const [loading, setLoading] = useState(false);

    const [postsEnd, setPostsEnd] = useState(false);

    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];

        const newPosts = await loadMorePosts(last, LIMIT);

        setPosts(posts.concat(newPosts));
        setLoading(false);

        if (newPosts.length < LIMIT) {
            setPostsEnd(true);
        }
    };

    return (
        <main>
            <Head>
                <title>Blog</title>
            </Head>
            <PostFeed posts={posts} />
            {!loading && !postsEnd && (
                <button onClick={getMorePosts}>Load more</button>
            )}
            <Loader show={loading} />

            {postsEnd && 'You have reached the end'}
        </main>
    );
}
