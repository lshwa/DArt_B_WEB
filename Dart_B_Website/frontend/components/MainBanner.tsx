import React, { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "framer-motion";
import { useSiteTextContext } from "../src/SiteTextContext";
import campusImg from '../assets/images/중앙대.jpeg';

export function MainBanner() {
  const [isHovered, setIsHovered] = useState(false);
  const { getText } = useSiteTextContext();

  return (
    <section
      className="relative pt-20 h-[80vh] flex items-center justify-center text-white bg-gradient-to-r from-[#0B2447] to-[#1a3a5c]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Campus Background - Fixed */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src={campusImg}
          alt="University Campus"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.h1
          className="text-6xl font-bold mb-4"
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getText('home.hero.title')}
        </motion.h1>
        <motion.h2
          className="text-2xl font-medium mb-6 text-blue-200"
          animate={isHovered ? { y: -5 } : { y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {getText('home.hero.subtitle')}
        </motion.h2>
        <motion.p
          className="text-lg leading-relaxed opacity-90 max-w-3xl mx-auto"
          animate={isHovered ? { y: -3 } : { y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {getText('home.hero.description')}
        </motion.p>
      </div>
    </section>
  );
}