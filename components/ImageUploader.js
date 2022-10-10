import { useState } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import Loader from '../components/Loader';
import { storage, auth } from '../lib/firebase';

export default function ImageUploader() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState(null);

    const uploadFile = async e => {
        const file = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        const storageRef = ref(
            storage,
            `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`
        );

        setUploading(true);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            snapshot => {
                const pct = (
                    (snapshot.bytesTransferred / snapshot.totalBytes) *
                    100
                ).toFixed(0);

                setProgress(pct);
            },
            error => console.log(error.serverResponse),
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                    setDownloadURL(downloadURL);
                    setUploading(false);
                });
            }
        );
    };

    return (
        <div className='box'>
            <Loader show={uploading} />
            {uploading && <h3>{progress}</h3>}

            {!uploading && (
                <>
                    <label className='btn'>
                        📸 Upload Img
                        <input
                            type='file'
                            onChange={uploadFile}
                            accept='image/x-png,image/gif,image/jpeg'
                        />
                    </label>

                    {downloadURL && (
                        <code className='upload-snippet'>{`![alt](${downloadURL})`}</code>
                    )}
                </>
            )}
        </div>
    );
}
