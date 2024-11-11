import React, { useEffect, useState } from 'react';
import { db } from './firebase'; // Adjust import as needed
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './styles/Banner.css';

function Banner() {
    const [systemSLAPS, setSystemSLAPS] = useState([]);

    useEffect(() => {
        // Set up Firestore listener for active SLAPS
        const slapsRef = collection(db, 'slaps');
        const activeSlapsQuery = query(slapsRef, where('isActive', '==', true));
        
        const unsubscribe = onSnapshot(activeSlapsQuery, (snapshot) => {
            const activeSlaps = snapshot.docs.map(doc => doc.data());
            setSystemSLAPS(activeSlaps);
        });

        // Clean up the listener when component unmounts
        return () => unsubscribe();
    }, []);

    if (systemSLAPS.length === 0) return null;

    return (
        <div className="Banner">
            <p><b>System Notification:</b> {systemSLAPS[0].content}</p>
        </div>
    );
}

export default Banner;
