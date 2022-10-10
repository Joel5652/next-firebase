import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';

import { UserContext, userContext } from '../lib/context';

export default function AuthCheck(props) {
    const { username } = useContext(UserContext);

    const router = useRouter();

    const { username: account } = router.query;

    return username === account
        ? props.children
        : props.fallback || (
              <Link href='/enter'>You must be logged in to access this.</Link>
          );
}
