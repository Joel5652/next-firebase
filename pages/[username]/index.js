import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import { getUserPosts, getUserWithUsername } from '../../lib/firebase';

export async function getServerSideProps({ query }) {
    const { username } = query;

    const userDoc = await getUserWithUsername(username);

    if (!userDoc) {
        return {
            notFound: true,
        };
    }

    let user = null;
    let posts = null;

    if (userDoc) {
        user = userDoc.data();
        posts = await getUserPosts(userDoc); //returns array of objects
    }

    return { props: { user, posts } };
}

export default function User({ user, posts }) {
    return (
        <main>
            <UserProfile user={user} />
            <PostFeed posts={posts} />
        </main>
    );
}
