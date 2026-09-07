import React from 'react';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/lib/storefrontUrls';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-screen-xl mx-auto text-center">
                <div className="space-x-6">
                    <a href={PRIVACY_POLICY_URL} className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    <a href={TERMS_OF_USE_URL} className="hover:text-blue-400" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                    <a href="mailto:ask@hawola.com" className="hover:text-blue-400">Contact</a>
                </div>
                <p className="mt-6 text-sm text-gray-400">&copy; {new Date().getFullYear()} Hawola. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
