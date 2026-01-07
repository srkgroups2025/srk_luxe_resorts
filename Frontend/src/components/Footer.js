"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
    const router = useRouter();

    const handleSectionScroll = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className="bg-teritaryLite text-white mt-5">
            {/* Top Section */}
            <div className="max-w-7xl mx-auto px-8 py-16 grid gap-10 md:grid-cols-4">

                {/* Brand */}
                <div>
                    <h3 className="text-2xl font-bold text-primaryLite">
                        SRK Luxe Resort
                    </h3>
                    <p className="mt-4 text-sm text-gray-300 leading-relaxed">
                        A luxurious escape for peaceful stays and grand celebrations,
                        crafted to create timeless memories.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="hover:text-primaryLite cursor-pointer">
                            <Link href="/">Home</Link>
                        </li>
                        <li className="hover:text-primaryLite cursor-pointer">
                            <Link href="/book">Rooms</Link>
                        </li>
                        <li 
                            className="hover:text-primaryLite cursor-pointer"
                            onClick={() => handleSectionScroll("amenities")}
                        >
                            Amenities
                        </li>
                        <li 
                            className="hover:text-primaryLite cursor-pointer"
                            onClick={() => handleSectionScroll("nearby-places")}
                        >
                            Nearby Places
                        </li>
                    </ul>
                </div>

                {/* Why Choose Us */}
                <div className="md:-ml-9">
                    <h4 className="font-semibold text-lg mb-4">Why Choose Us</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>✔ Premium luxury experience</li>
                        <li>✔ Peaceful natural surroundings</li>
                        <li>✔ Perfect for weddings & events</li>
                        <li>✔ Exceptional hospitality</li>
                        <li>✔ Trusted by 1000+ guests</li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>📍Marupatti, udumalpet, Tamil Nadu</li>
                        <li>📞 +91 75983 46200</li>
                        <li className="flex items-center gap-4">
                            {/* Email */}
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=srk.luxe.resort@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-primaryLite transition"
                                aria-label="Send Email"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/srk_luxe.resort/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-primaryLite transition"
                                aria-label="Instagram"
                            >
                                {/* Instagram Icon */}
                                <svg
                                    xmlns="https://www.vhv.rs/viewpic/hwRobwi_instagram-icon-small-png-png-download-instagram-logo/"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.92 4.92 0 011.77 1.03 4.92 4.92 0 011.03 1.77c.163.46.35 1.26.403 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.92 4.92 0 01-1.03 1.77 4.92 4.92 0 01-1.77 1.03c-.46.163-1.26.35-2.43.403-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.92 4.92 0 01-1.77-1.03 4.92 4.92 0 01-1.03-1.77c-.163-.46-.35-1.26-.403-2.43-.058-1.266-.07-1.65-.07-4.85s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.92 4.92 0 011.03-1.77 4.92 4.92 0 011.77-1.03c.46-.163 1.26-.35 2.43-.403C8.416 2.212 8.8 2.2 12 2.2zm0 3.8a6 6 0 100 12 6 6 0 000-12zm0 9.9a3.9 3.9 0 110-7.8 3.9 3.9 0 010 7.8zm6.406-10.845a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>© {new Date().getFullYear()} SRK Luxe Resort. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">
                        Designed with ❤️ for luxury stays
                    </p>
                </div>
            </div>
        </footer>
    );
}
