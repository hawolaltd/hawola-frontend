import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-screen-xl mx-auto text-center">
                <div className="space-x-6">
                    <a href="#" className="hover:text-blue-400">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-400">Terms of Service</a>
                    <a href="#" className="hover:text-blue-400">Contact</a>
                </div>
                <p className="mt-6 text-sm text-gray-400">&copy; 2025 E-Shop. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
