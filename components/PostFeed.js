import Link from 'next/link';
import { Router, useRouter } from 'next/router';

export default function PostFeed({ posts, admin }) {
    return posts
        ? posts.map(post => (
              <PostItem
                  post={post}
                  key={post.slug}
                  admin={admin}
              />
          ))
        : null;
}

function PostItem({ post, admin = false }) {
    const wordCount = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);

    const router = useRouter();

    const { username } = router.query;

    return (
        <div className='card'>
            <Link href={`/${post.username}`}>
                <a>
                    <strong>By @{post.username}</strong>
                </a>
            </Link>
            <Link href={`/${post.username}/${post.slug}`}>
                <h2>
                    <a>{post.title}</a>
                </h2>
            </Link>
            <footer>
                <span>
                    {wordCount} words. {minutesToRead} min read.
                </span>
                <span className='push-left'>
                    {' '}
                    {post.heartCount} {post.heartCount > 1 ? 'Likes' : 'Like'}
                </span>
                {/* <span style={{ marginLeft: 30 }}>
                    {post.heartCount}{' '}
                    {post.heartCount > 1 ? 'Comments' : 'Comment'}
                </span> */}
            </footer>

            {/* If admin view, show extra controls for user */}
            {admin && (
                <>
                    <Link href={`/${username}/admin/${post.slug}`}>
                        <h3>
                            <button className='btn-blue'>Edit</button>
                        </h3>
                    </Link>

                    {post.published ? (
                        <p className='text-success'>Live</p>
                    ) : (
                        <p className='text-danger'>Unpublished</p>
                    )}
                </>
            )}
        </div>
    );
}
