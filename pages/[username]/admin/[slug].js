import Router, { useRouter } from 'next/router';
import AuthCheck from '../../../components/AuthCheck';
import styles from '../../../styles/Admin.module.css';
import ImageUploader from '../../../components/ImageUploader';

import {
    getSlugPost,
    firestore,
    getUserWithUsername,
} from '../../../lib/firebase';

import toast from 'react-hot-toast';
import { serverTimestamp, updateDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

import ReactMarkdown from 'react-markdown';

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
import { useContext } from 'react';
import { UserContext } from '../../../lib/context';
import Link from 'next/link';

// export async function getServerSideProps({ params }) {
//     const { username, slug } = params;

//     const userDoc = await getUserWithUsername(username);

//     const post = await getSlugPost(userDoc, slug);

//     return {
//         props: { post },
//     };
// }

export default function AdminPostEdit({ post }) {
    return (
        <AuthCheck>
            <PostManager />
        </AuthCheck>
    );
}

function PostManager() {
    const [preview, setPreview] = useState(false);

    const { user, username } = useContext(UserContext);

    const router = useRouter();

    const { slug } = router.query;

    const postQuery = doc(firestore, 'users', user.uid, 'posts', slug);

    const [post] = useDocumentData(postQuery);

    console.log('slug', post);

    return (
        <main className={styles.container}>
            {post && (
                <>
                    <section>
                        <h1>{post.title}</h1>
                        <p>ID: {post.slug}</p>
                        <PostForm
                            postQuery={postQuery}
                            defaultValues={post}
                            preview={preview}
                        />
                    </section>
                    <aside>
                        <h3>Tools</h3>
                        <button onClick={() => setPreview(!preview)}>
                            {preview ? 'Edit' : 'Preview'}
                        </button>
                    </aside>
                </>
            )}
        </main>
    );
}

function PostForm({ defaultValues, postQuery, preview }) {
    const { register, handleSubmit, reset, watch, formState } = useForm({
        defaultValues,
        mode: 'onChange',
    });

    const router = useRouter();

    const { isValid, isDirty, errors } = formState;

    const updatePost = async ({ content, published }) => {
        await updateDoc(postQuery, {
            content,
            published,
            updatedAt: serverTimestamp(),
        });

        reset({ content, published });

        toast.success('Post updated successfully! Redirecting...');

        setTimeout(() => {
            const { slug, username } = router.query;

            Router.push(`/${username}/${slug}`);
        }, 500);
    };

    return (
        <form onSubmit={handleSubmit(updatePost)}>
            {preview && (
                <div className='card'>
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}

            <div className={preview ? styles.hidden : styles.controls}>
                <ImageUploader />

                <textarea
                    {...register('content', {
                        maxLength: {
                            value: 20000,
                            message: 'Content is too long',
                        },
                        minLength: {
                            value: 10,
                            message: 'Content is too short',
                        },
                        required: {
                            value: true,
                            message: 'Content is required',
                        },
                    })}
                ></textarea>
                {errors.content && (
                    <p className='text-danger'>{errors.content.message}</p>
                )}
                <fieldset>
                    <input
                        className={styles.checkbox}
                        type='checkbox'
                        {...register('published')}
                    />
                    <label>Published</label>
                </fieldset>
                <button
                    type='submit'
                    className='btn-green'
                    disbaled={!isDirty || !isValid}
                >
                    Save changes
                </button>
            </div>
        </form>
    );
}
