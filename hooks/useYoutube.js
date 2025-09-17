import { useState } from 'react';
import GLOBALS from '../Globals';

const YOUTUBE_API_KEY = GLOBALS.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3'; 

export const useYouTube = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchVideos = async (query) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=10&key=${YOUTUBE_API_KEY}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Respuesta de error de YouTube (texto):", errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error?.message || `Error al buscar en YouTube: ${response.status} - ${errorText}`);
                } catch (jsonError) {
                    throw new Error(`Error al buscar en YouTube: ${response.status} - ${errorText}`);
                }
            }

            const data = await response.json();
            
            const videos = data.items
                .filter(item => item.id.videoId)
                .map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    artist_name: item.snippet.channelTitle,
                    album_image_url: item.snippet.thumbnails.high.url,
                    source: 'youtube',
                }));

            return videos;

        } catch (err) {
            console.error("Error en useYoutubeVideos (final catch):", err);
            setError(err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return { searchVideos, isLoading, error };
};