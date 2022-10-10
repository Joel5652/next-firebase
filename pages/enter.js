import {
    auth,
    googleAuthProvider,
    firestore,
    signInWithPopUp,
} from '../lib/firebase';
import { useCallback, useContext, useEffect, useState } from 'react';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { debounce } from 'lodash';
import { UserContext } from '../lib/context';

export default function Enter(props) {
    const { user, username } = useContext(UserContext);

    // 1. user signed out <SignInButton />
    // 2. user signed in, but missing username <UsernameForm />
    // 3. user signed in, has username <SignOutButton />
    return (
        <main>
            {user ? (
                !username ? (
                    <UsernameForm />
                ) : (
                    <SignOutButton />
                )
            ) : (
                <SignInButton />
            )}
        </main>
    );
}

// Sign in with Google button
function SignInButton() {
    const signInWithGoogle = async () => {
        await signInWithPopUp(auth, googleAuthProvider);
    };

    return (
        <button
            className='btn-google'
            onClick={signInWithGoogle}
        >
            <img src={'/google.png'} /> Sign in with Google
        </button>
    );
}

// Sign out button
function SignOutButton() {
    return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext);

    const onChange = e => {
        // Force form value typed in form to match correct format
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
            setFormValue(val);
            setLoading(false);
            setIsValid(false);
        }

        if (re.test(val)) {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    };

    const onSubmit = async e => {
        e.preventDefault();

        console.log('Batching');
        const userDoc = doc(firestore, 'users', `${user.uid}`);
        const usernameDoc = doc(firestore, 'usernames', `${formValue}`);

        const batch = writeBatch(firestore);

        batch.set(userDoc, {
            username: formValue,
            photoURL: user.photoURL,
            displayName: user.displayName,
        });
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();
    };

    useEffect(() => {
        checkUsername(formValue);
    }, [formValue]);

    const checkUsername = useCallback(
        debounce(async username => {
            if (username.length >= 3) {
                const ref = doc(firestore, 'usernames', `${username}`);
                const document = await getDoc(ref);
                console.log('Firestore read executed');

                if (document.exists()) {
                    console.log('Already exists', document.data());
                    setIsValid(false);
                    setLoading(false);
                } else {
                    console.log('Valid');
                    setIsValid(true);
                    setLoading(false);
                }
            }
        }, 500)
    );

    return (
        !username && (
            <section>
                <h3>Choose username</h3>
                <form onSubmit={onSubmit}>
                    <input
                        name='username'
                        placeholder='username'
                        value={formValue}
                        onChange={onChange}
                    />
                    <UsernameErrorMessage
                        username={formValue}
                        isValid={isValid}
                        loading={loading}
                    />
                    <button
                        type='submit'
                        className='btn-green'
                        disabled={!isValid}
                    >
                        Submit
                    </button>
                    <h3>Debug state</h3>
                    <div>
                        Username: {formValue}
                        <br />
                        Loading: {loading}
                        <br />
                        Username valid: {isValid.toString()}
                    </div>
                </form>
            </section>
        )
    );
}

function UsernameErrorMessage({ username, isValid, loading }) {
    if (loading) {
        return <p>Checking...</p>;
    } else if (isValid) {
        return <p className='text-success'>{username} is available</p>;
    } else if (username.length > 3 && !isValid) {
        return <p className='text-danger'>That username is taken!</p>;
    } else if (username) {
        return <p>More than 3</p>;
    }
}
