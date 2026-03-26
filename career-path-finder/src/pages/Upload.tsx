import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
    const navigate = useNavigate();
    useEffect(() => { navigate('/build', { replace: true }); }, [navigate]);
    return null;
}
