import {
    firestore,
    getAllComments,
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
    let comments = 'hi';

    if (userDoc) {
        post = await getSlugPost(userDoc, slug);

        if (!post) {
            return {
                notFound: true,
            };
        }

        path.push(userDoc.id, post.slug);

        try {
            comments = await getAllComments(post.uid, post.slug);
        } catch (err) {
            console.log('Error fetching comments...', err);
        }
    }

    return {
        props: { post, path, comments },
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

    const comments = props.comments;

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

                <CommentSection data={comments} />
            </aside>
        </main>
    );
}

function CommentSection({ data }) {
    return (
        <section className={styles.commentSection}>
            <h3>Comments section</h3>

            {/* {data &&
                data.map(comment => {
                    return <p key={comment.username}>{comment.content}</p>;
                })} */}
        </section>
    );
}
