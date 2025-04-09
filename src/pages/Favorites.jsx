import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../components/layout/Favorites.css";
import { div } from "framer-motion/client";

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);

            const { data: sessionData} = await supabase.auth.getSession();

            if (sessionData?.session?.user) {
                const userID = sessionData.session.user.id;

                const { data, error} = await supabase
                .from('favorites')
                .select(`
                    id,
                    company_id,
                    companies (
                    id, 
                    companu_name,
                    logo_url,
                    website_url,
                    email
                    )
                    `)
                    .eq('student_id', userID);

                    if (error) throw error;

                    if (data) {
                        setFavorites(data);
                    }
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleRemoveFavorite = async (favoriteId) => {
        //lägg till kod här
    };

    if (loading) {
        return (
            <div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="favorites-container">
                <h1 className="favorites-title">Favoriter</h1>

                <div className="favorites-grid">
                    {/* lägg till kod för visa favoritkort*/}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Favorites;