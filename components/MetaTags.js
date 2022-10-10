import Head from 'next/head';

export default function MetaTags({ title, desc, image }) {
    return (
        <Head>
            <title>{title}</title>
        </Head>
    );
}
