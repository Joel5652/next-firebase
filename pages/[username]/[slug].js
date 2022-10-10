import {
    firestore,
    getAllPosts,
    getSlugPost,
    getUserWithUsername,
} from '../../lib/firebase';

import styles from '../../styles/Post.module.css';

import PostContent from '../../components/PostContent';
import HeartButton from '../../components/HeartButton';
import AuthCheck from '../../components/AuthCheck';

import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export async function getStaticProps({ params }) {
    const { username, slug } = params;

    const userDoc = await getUserWithUsername(username);

    let post;
    let path = [];

    if (userDoc) {
        post = await getSlugPost(userDoc, slug);

        if (!post) {
            return {
                notFound: true,
            };
        }

        path.push(userDoc.id, post.slug);
    }

    return {
        props: { post, path },
        revalidate: 5000,
    };
}

//staticpath

export async function getStaticPaths() {
    const paths = (await getAllPosts()).docs.map(doc => {
        const { slug, username } = doc.data();
        return {
            params: { username, slug },
        };
    });

    return {
        paths,
        fallback: 'blocking',
        /* when routes to slug that has not been rendered yet because its newly created 
        this attribute will tell next to revert back to server side rendering in order to re fetch new info */
    };
}

export default function PostPage(props) {
    const [userID, slug] = props.path;

    const postRef = doc(firestore, 'users', userID, 'posts', slug);

    const [realtimePost] = useDocumentData(postRef);

    const post = realtimePost || props.post;

    return (
        <main className={styles.container}>
            <section>
                <PostContent post={post} />
            </section>

            <aside className='card'>
                <p>
                    <strong>{post?.heartCount || 0} 🤍</strong>
                </p>

                <HeartButton postRef={post} />
            </aside>
        </main>
    );
}
