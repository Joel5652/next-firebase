import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

export default function NavBar({}) {
    const { user, username } = useContext(UserContext);

    return (
        <nav className='navbar'>
            <ul>
                <li>
                    <Link href='/'>
                        <button className='btn-logo'>FEED</button>
                    </Link>
                </li>
                {username && (
                    <>
                        <li className='push-left'>
                            <Link href='/enter'>
                                <button>Sign Out</button>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${username}/admin`}>
                                <button className='btn-blue'>
                                    Write posts
                                </button>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${username}`}>
                                <img src={user?.photoURL} />
                            </Link>
                        </li>
                    </>
                )}

                {!username && (
                    <li>
                        <Link href='/enter'>
                            <button className='btn-blue'>Log in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}
