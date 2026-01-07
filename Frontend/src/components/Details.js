// src/components/Details.js
import React from "react";

const Details = () => {
    return (
        <div className="my-8 text-grayDark max-w-4xl mx-auto space-y-4">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-center text-primaryLite">
                A Home Away From Home
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-center">
                A lush green piece of land and serene surroundings which make you want to talk to the blooms, play hide and seek with the butterflies, hear an occasional "moo" of the cow, the beautiful doves, quacking ducks, and the busy honeybees — how close can you get to nature?
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
                Nestled in the calm beauty of Marulpatti, <span className="font-bold text-primaryLite">SRK Luxe Resort</span> offers a perfect blend of nature, luxury, and unforgettable celebrations.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
                Designed with passion by <span className="font-bold text-primaryLite">K.P. Ravindranath</span>, our resort is the finest destination for premium stays and events.
            </p>
            <p className="text-center sm:text-lg leading-relaxed">
                A unit of <span className="font-bold text-primaryLite">SRK Homestead</span>
            </p>
        </div>
    );
};

export default Details;
